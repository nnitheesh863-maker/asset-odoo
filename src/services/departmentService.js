const { prisma } = require('../config/database');
const AppError = require('../utils/AppError');

class DepartmentService {
  async create({ name, description }) {
    const existing = await prisma.department.findUnique({ where: { name } });
    if (existing) {
      throw new AppError('A department with this name already exists', 409);
    }

    return prisma.department.create({
      data: { name, description: description || null },
    });
  }

  async getAll({ page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' }) {
    const skip = (page - 1) * limit;

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [departments, total] = await Promise.all([
      prisma.department.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: { employees: true, users: true, assets: true },
          },
        },
      }),
      prisma.department.count({ where }),
    ]);

    return {
      departments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id) {
    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        employees: {
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
          },
        },
        _count: {
          select: { employees: true, users: true, assets: true },
        },
      },
    });

    if (!department) {
      throw new AppError('Department not found', 404);
    }

    return department;
  }

  async update(id, { name, description }) {
    const department = await prisma.department.findUnique({ where: { id } });
    if (!department) {
      throw new AppError('Department not found', 404);
    }

    if (name && name !== department.name) {
      const existing = await prisma.department.findUnique({ where: { name } });
      if (existing) {
        throw new AppError('A department with this name already exists', 409);
      }
    }

    return prisma.department.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description: description || null }),
      },
    });
  }

  async delete(id) {
    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        _count: {
          select: { employees: true, users: true, assets: true },
        },
      },
    });

    if (!department) {
      throw new AppError('Department not found', 404);
    }

    if (department._count.employees > 0) {
      throw new AppError(
        `Cannot delete department. ${department._count.employees} employee(s) are assigned to it. Reassign them first.`,
        400
      );
    }

    if (department._count.users > 0) {
      throw new AppError(
        `Cannot delete department. ${department._count.users} user(s) are assigned to it. Reassign them first.`,
        400
      );
    }

    if (department._count.assets > 0) {
      throw new AppError(
        `Cannot delete department. ${department._count.assets} asset(s) are assigned to it. Reassign them first.`,
        400
      );
    }

    return prisma.department.delete({ where: { id } });
  }

  async getDepartmentStats(id) {
    const department = await prisma.department.findUnique({ where: { id } });
    if (!department) {
      throw new AppError('Department not found', 404);
    }

    const [employeeCount, assetCount, userCount, activeAllocations] = await Promise.all([
      prisma.employee.count({ where: { departmentId: id, status: 'ACTIVE' } }),
      prisma.asset.count({ where: { departmentId: id } }),
      prisma.user.count({ where: { departmentId: id, status: 'ACTIVE' } }),
      prisma.assetAllocation.count({
        where: {
          status: 'ACTIVE',
          asset: { departmentId: id },
        },
      }),
    ]);

    const assetsByStatus = await prisma.asset.groupBy({
      by: ['status'],
      where: { departmentId: id },
      _count: { id: true },
    });

    return {
      department,
      stats: {
        employeeCount,
        assetCount,
        userCount,
        activeAllocations,
        assetsByStatus: assetsByStatus.reduce((acc, item) => {
          acc[item.status] = item._count.id;
          return acc;
        }, {}),
      },
    };
  }
}

module.exports = new DepartmentService();
