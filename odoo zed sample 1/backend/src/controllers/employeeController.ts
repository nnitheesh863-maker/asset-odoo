import { Response } from 'express';
import { Employee, AssetAllocation } from '../models';
import { AuthRequest, PaginationQuery } from '../types';
import { paginate, hashPassword, generateEmployeeId, createActivityLog } from '../utils/helpers';

export const getEmployees = async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '10', search = '', role, status, departmentId } = req.query as any;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const { skip } = paginate(pageNum, limitNum);

    const filter: any = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
      ];
    }
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (departmentId) filter.departmentId = departmentId;

    const [employees, total] = await Promise.all([
      Employee.find(filter)
        .select('-password')
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 })
        .populate('departmentId', 'name'),
      Employee.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: employees,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEmployee = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findById(id)
      .select('-password')
      .populate('departmentId', 'name');

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const allocations = await AssetAllocation.find({ employeeId: id, status: 'ACTIVE' })
      .populate('assetId', 'assetTag assetName status');

    res.json({ success: true, data: { ...employee.toObject(), allocations } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createEmployee = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, phone, departmentId, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password required' });
    }

    const existing = await Employee.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const employeeId = await generateEmployeeId();
    const hashedPassword = await hashPassword(password);

    const employee = await Employee.create({
      employeeId,
      name,
      email,
      password: hashedPassword,
      phone,
      departmentId,
      role: role || 'EMPLOYEE',
    });

    const employeeObj = employee.toObject();
    const { password: _, ...employeeData } = employeeObj;

    await createActivityLog(req.user!.id, 'CREATED', 'EMPLOYEE', { name, employeeId });

    res.status(201).json({ success: true, message: 'Employee created', data: employeeData });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateEmployee = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, phone, departmentId, role, status } = req.body;

    const employee = await Employee.findByIdAndUpdate(
      id,
      { name, email, phone, departmentId, role, status },
      { new: true }
    ).select('-password');

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    await createActivityLog(req.user!.id, 'UPDATED', 'EMPLOYEE', { name: employee.name });

    res.json({ success: true, message: 'Employee updated', data: employee });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteEmployee = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const activeAllocations = await AssetAllocation.countDocuments({
      employeeId: id,
      status: 'ACTIVE',
    });
    if (activeAllocations > 0) {
      return res.status(400).json({ success: false, message: 'Cannot delete employee with active asset allocations' });
    }

    await Employee.findByIdAndUpdate(id, { status: 'INACTIVE' });
    await createActivityLog(req.user!.id, 'DEACTIVATED', 'EMPLOYEE', { id });

    res.json({ success: true, message: 'Employee deactivated' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
