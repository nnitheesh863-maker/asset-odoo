const { prisma } = require('../config/database');
const AppError = require('../utils/AppError');
const { hashPassword } = require('../utils/password');

class EmployeeService {
  async create({ name, email, password, phone, departmentId, designation, role, joinDate }) {
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      throw new AppError('An account with this email already exists', 409);
    }

    if (phone) {
      const existingPhone = await prisma.user.findUnique({ where: { phone } });
      if (existingPhone) {
        throw new AppError('An account with this phone number already exists', 409);
      }
    }

    const department = await prisma.department.findUnique({ where: { id: departmentId } });
    if (!department) {
      throw new AppError('Department not found', 404);
    }

    const hashedPassword = await hashPassword(password);

    const lastEmployee = await prisma.employee.findFirst({
      orderBy: { id: 'desc' },
    });

    let nextNumber = 1;
    if (lastEmployee && lastEmployee.employeeCode) {
      nextNumber = parseInt(lastEmployee.employeeCode.replace('EMP', ''), 10) + 1;
    }
    const employeeCode = `EMP${String(nextNumber).padStart(4, '0')}`;

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          phone: phone || null,
          role: role || 'EMPLOYEE',
          status: 'ACTIVE',
          departmentId,
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          departmentId: true,
          createdAt: true,
        },
      });

      const employee = await tx.employee.create({
        data: {
          employeeCode,
          userId: user.id,
          departmentId,
          designation: designation || null,
          joinDate: joinDate ? new Date(joinDate) : new Date(),
          status: 'ACTIVE',
        },
        include: {
          department: { select: { id: true, name: true } },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              role: true,
              status: true,
            },
          },
        },
      });

      return employee;
    });

    return result;
  }

  async getAll({ page = 1, limit = 10, search, departmentId, status, role, sortBy = 'createdAt', sortOrder = 'desc' }) {
    const skip = (page - 1) * limit;

    const where = {};
    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { employeeCode: { contains: search, mode: 'insensitive' } },
        { designation: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (departmentId) {
      where.departmentId = departmentId;
    }
    if (status) {
      where.status = status;
    }
    if (role) {
      where.user = { ...where.user, role };
    }

    const orderBy = {};
    if (sortBy === 'name' || sortBy === 'email') {
      orderBy.user = { [sortBy]: sortOrder };
    } else {
      orderBy[sortBy] = sortOrder;
    }

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              role: true,
              status: true,
            },
          },
          department: { select: { id: true, name: true } },
          _count: {
            select: { allocations: { where: { status: 'ACTIVE' } } },
          },
        },
      }),
      prisma.employee.count({ where }),
    ]);

    return {
      employees,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id) {
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            status: true,
            createdAt: true,
          },
        },
        department: { select: { id: true, name: true } },
        allocations: {
          include: {
            asset: {
              select: {
                id: true,
                name: true,
                assetCode: true,
                status: true,
                category: { select: { id: true, name: true } },
              },
            },
          },
          orderBy: { allocatedAt: 'desc' },
        },
      },
    });

    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    return employee;
  }

  async update(id, data) {
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    if (data.email && data.email !== employee.user.email) {
      const existingEmail = await prisma.user.findUnique({ where: { email: data.email } });
      if (existingEmail) {
        throw new AppError('An account with this email already exists', 409);
      }
    }

    if (data.phone && data.phone !== employee.user.phone) {
      const existingPhone = await prisma.user.findUnique({ where: { phone: data.phone } });
      if (existingPhone) {
        throw new AppError('An account with this phone number already exists', 409);
      }
    }

    if (data.departmentId) {
      const department = await prisma.department.findUnique({ where: { id: data.departmentId } });
      if (!department) {
        throw new AppError('Department not found', 404);
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const userUpdateData = {};
      if (data.name !== undefined) userUpdateData.name = data.name;
      if (data.email !== undefined) userUpdateData.email = data.email;
      if (data.phone !== undefined) userUpdateData.phone = data.phone || null;
      if (data.role !== undefined) userUpdateData.role = data.role;

      const employeeUpdateData = {};
      if (data.departmentId !== undefined) employeeUpdateData.departmentId = data.departmentId;
      if (data.designation !== undefined) employeeUpdateData.designation = data.designation || null;
      if (data.status !== undefined) employeeUpdateData.status = data.status;
      if (data.joinDate !== undefined) employeeUpdateData.joinDate = new Date(data.joinDate);

      if (data.departmentId !== undefined) {
        userUpdateData.departmentId = data.departmentId;
      }

      if (Object.keys(userUpdateData).length > 0) {
        await tx.user.update({
          where: { id: employee.userId },
          data: userUpdateData,
        });
      }

      if (Object.keys(employeeUpdateData).length > 0) {
        await tx.employee.update({
          where: { id },
          data: employeeUpdateData,
        });
      }

      return tx.employee.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              role: true,
              status: true,
              createdAt: true,
            },
          },
          department: { select: { id: true, name: true } },
        },
      });
    });

    return result;
  }

  async delete(id) {
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        allocations: { where: { status: 'ACTIVE' } },
      },
    });

    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    if (employee.allocations.length > 0) {
      throw new AppError(
        `Cannot delete employee. ${employee.allocations.length} active asset allocation(s) exist. Return assets first.`,
        400
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.employee.update({
        where: { id },
        data: { status: 'TERMINATED' },
      });

      await tx.user.update({
        where: { id: employee.userId },
        data: { status: 'INACTIVE', refreshToken: null },
      });

      return { message: 'Employee deactivated successfully' };
    });

    return result;
  }

  async getEmployeeStats(departmentId) {
    const where = {};
    if (departmentId) {
      where.departmentId = departmentId;
    }

    const [totalEmployees, activeEmployees, inactiveEmployees, terminatedEmployees] = await Promise.all([
      prisma.employee.count({ where }),
      prisma.employee.count({ where: { ...where, status: 'ACTIVE' } }),
      prisma.employee.count({ where: { ...where, status: 'INACTIVE' } }),
      prisma.employee.count({ where: { ...where, status: 'TERMINATED' } }),
    ]);

    const byDepartment = await prisma.employee.groupBy({
      by: ['departmentId'],
      where: { ...where, status: 'ACTIVE' },
      _count: { id: true },
    });

    const departments = await prisma.department.findMany({
      select: { id: true, name: true },
    });

    const departmentMap = departments.reduce((acc, d) => {
      acc[d.id] = d.name;
      return acc;
    }, {});

    const employeesByDepartment = byDepartment.map((item) => ({
      departmentId: item.departmentId,
      departmentName: departmentMap[item.departmentId] || 'Unknown',
      count: item._count.id,
    }));

    return {
      totalEmployees,
      activeEmployees,
      inactiveEmployees,
      terminatedEmployees,
      employeesByDepartment,
    };
  }

  async getEmployeeAssets(id) {
    const employee = await prisma.employee.findUnique({ where: { id } });
    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    const allocations = await prisma.assetAllocation.findMany({
      where: { employeeId: id },
      include: {
        asset: {
          include: {
            category: { select: { id: true, name: true } },
            department: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { allocatedAt: 'desc' },
    });

    const active = allocations.filter((a) => a.status === 'ACTIVE');
    const returned = allocations.filter((a) => a.status === 'RETURNED');

    return {
      employee,
      activeAllocations: active,
      returnedAllocations: returned,
      totalAllocations: allocations.length,
    };
  }
}

module.exports = new EmployeeService();
