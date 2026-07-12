const { prisma } = require('../config/database');
const AppError = require('../utils/AppError');

class CategoryService {
  async create({ name, description }) {
    const existing = await prisma.category.findUnique({ where: { name } });
    if (existing) {
      throw new AppError('A category with this name already exists', 409);
    }

    return prisma.category.create({
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

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: { select: { assets: true } },
        },
      }),
      prisma.category.count({ where }),
    ]);

    return {
      categories,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: { select: { assets: true } },
        assets: {
          take: 20,
          select: {
            id: true,
            name: true,
            assetCode: true,
            status: true,
          },
        },
      },
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    return category;
  }

  async update(id, { name, description }) {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    if (name && name !== category.name) {
      const existing = await prisma.category.findUnique({ where: { name } });
      if (existing) {
        throw new AppError('A category with this name already exists', 409);
      }
    }

    return prisma.category.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description: description || null }),
      },
    });
  }

  async delete(id) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: { select: { assets: true } },
      },
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    if (category._count.assets > 0) {
      throw new AppError(
        `Cannot delete category. ${category._count.assets} asset(s) are assigned to it. Reassign them first.`,
        400
      );
    }

    return prisma.category.delete({ where: { id } });
  }
}

module.exports = new CategoryService();
