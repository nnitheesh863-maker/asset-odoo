function paginate(query = {}, defaults = {}) {
  const {
    page: rawPage = "1",
    limit: rawLimit = "10",
    sortBy = defaults.sortBy || "createdAt",
    sortOrder = defaults.sortOrder || "desc",
    search = "",
    searchFields = [],
  } = query;

  let page = parseInt(rawPage, 10);
  let limit = parseInt(rawLimit, 10);

  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1) limit = 10;
  if (limit > 100) limit = 100;

  const skip = (page - 1) * limit;
  const take = limit;

  const allowedSortFields = defaults.allowedSortFields || ["createdAt", "updatedAt", "name", "email"];
  let finalSortBy = sortBy;
  if (!allowedSortFields.includes(sortBy)) {
    finalSortBy = defaults.sortBy || "createdAt";
  }

  const finalSortOrder = sortOrder === "asc" ? "asc" : "desc";

  const where = buildWhereClause(query, search, searchFields, defaults.extraWhere);

  return {
    skip,
    take,
    page,
    limit,
    sortBy: finalSortBy,
    sortOrder: finalSortOrder,
    where,
    orderBy: { [finalSortBy]: finalSortOrder },
    search,
  };
}

function buildWhereClause(query, search, searchFields, extraWhere = {}) {
  const where = { ...extraWhere };

  if (search && searchFields.length > 0) {
    where.OR = searchFields.map((field) => ({
      [field]: { contains: search, mode: "insensitive" },
    }));
  }

  if (query.status) {
    where.status = query.status;
  }

  if (query.departmentId) {
    where.departmentId = query.departmentId;
  }

  if (query.categoryId) {
    where.categoryId = query.categoryId;
  }

  if (query.userId) {
    where.userId = query.userId;
  }

  if (query.isActive !== undefined) {
    where.isActive = query.isActive === "true" || query.isActive === true;
  }

  if (query.dateFrom || query.dateTo) {
    where.createdAt = {};
    if (query.dateFrom) {
      where.createdAt.gte = new Date(query.dateFrom);
    }
    if (query.dateTo) {
      where.createdAt.lte = new Date(query.dateTo);
    }
  }

  return where;
}

function buildPaginationMeta(totalCount, page, limit) {
  const totalPages = Math.ceil(totalCount / limit);
  return {
    total: totalCount,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

module.exports = {
  paginate,
  buildPaginationMeta,
  buildWhereClause,
};
