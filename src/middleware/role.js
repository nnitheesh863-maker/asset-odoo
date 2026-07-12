const AppError = require("../utils/AppError");

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Authentication required.", 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. Required role: ${roles.join(" or ")}. Your role: ${req.user.role}.`,
          403
        )
      );
    }

    next();
  };
};

const authorizeDepartment = (getDepartmentId) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Authentication required.", 401));
    }

    if (req.user.role === "ADMIN") {
      return next();
    }

    const targetDepartmentId =
      typeof getDepartmentId === "function"
        ? getDepartmentId(req)
        : req.params.departmentId || req.body.departmentId;

    if (req.user.departmentId === targetDepartmentId) {
      return next();
    }

    if (req.user.role === "MANAGER" && req.user.departmentId === targetDepartmentId) {
      return next();
    }

    return next(new AppError("You do not have access to this department's resources.", 403));
  };
};

const authorizeOwnership = (getResourceOwnerId) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Authentication required.", 401));
    }

    if (req.user.role === "ADMIN") {
      return next();
    }

    const ownerId =
      typeof getResourceOwnerId === "function"
        ? getResourceOwnerId(req)
        : req.params.userId || req.body.userId;

    if (req.user.id === ownerId) {
      return next();
    }

    if (req.user.role === "MANAGER") {
      return next();
    }

    return next(new AppError("You do not have access to this resource.", 403));
  };
};

module.exports = { authorize, authorizeDepartment, authorizeOwnership };
