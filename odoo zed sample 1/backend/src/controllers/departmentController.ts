import { Response } from 'express';
import { Department, Employee, Asset } from '../models';
import { AuthRequest, PaginationQuery } from '../types';
import { paginate, createActivityLog } from '../utils/helpers';

export const getDepartments = async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '10', search = '' } = req.query as PaginationQuery;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const { skip } = paginate(pageNum, limitNum);

    const filter = search
      ? { name: { $regex: search, $options: 'i' } }
      : {};

    const [departments, total] = await Promise.all([
      Department.find(filter)
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 })
        .populate('departmentHead', 'name email employeeId'),
      Department.countDocuments(filter),
    ]);

    const departmentsWithCount = await Promise.all(
      departments.map(async (dept) => {
        const [empCount, assetCount] = await Promise.all([
          Employee.countDocuments({ departmentId: dept._id }),
          Asset.countDocuments({ departmentId: dept._id }),
        ]);
        return { ...dept.toObject(), _count: { employees: empCount, assets: assetCount } };
      })
    );

    res.json({
      success: true,
      data: departmentsWithCount,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDepartment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const department = await Department.findById(id)
      .populate('departmentHead', 'name email employeeId');

    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    const [employees, assets, empCount, assetCount] = await Promise.all([
      Employee.find({ departmentId: id }).select('name employeeId role status'),
      Asset.find({ departmentId: id }).select('assetTag assetName status'),
      Employee.countDocuments({ departmentId: id }),
      Asset.countDocuments({ departmentId: id }),
    ]);

    res.json({
      success: true,
      data: {
        ...department.toObject(),
        employees,
        assets,
        _count: { employees: empCount, assets: assetCount },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createDepartment = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, parentDepartment, departmentHeadId, status } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Department name required' });
    }

    const existing = await Department.findOne({ name });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Department name already exists' });
    }

    const department = await Department.create({
      name,
      description,
      parentDepartment,
      departmentHead: departmentHeadId,
      status,
    });

    const populated = await department.populate('departmentHead', 'name');

    await createActivityLog(req.user!.id, 'CREATED', 'DEPARTMENT', { name });

    res.status(201).json({ success: true, message: 'Department created', data: populated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateDepartment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, parentDepartment, departmentHeadId, status } = req.body;

    const data: any = {};
    if (name) data.name = name;
    if (description !== undefined) data.description = description;
    if (parentDepartment !== undefined) data.parentDepartment = parentDepartment;
    if (departmentHeadId !== undefined) data.departmentHead = departmentHeadId;
    if (status) data.status = status;

    const department = await Department.findByIdAndUpdate(id, data, { new: true })
      .populate('departmentHead', 'name');

    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    await createActivityLog(req.user!.id, 'UPDATED', 'DEPARTMENT', { name: department.name });

    res.json({ success: true, message: 'Department updated', data: department });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteDepartment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const hasEmployees = await Employee.countDocuments({ departmentId: id });
    if (hasEmployees > 0) {
      return res.status(400).json({ success: false, message: 'Cannot delete department with employees' });
    }

    await Department.findByIdAndDelete(id);
    await createActivityLog(req.user!.id, 'DELETED', 'DEPARTMENT', { id });

    res.json({ success: true, message: 'Department deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
