const prisma = require("../config/database");
const logger = require("../utils/logger");

const logActivity = (action, entity) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = function (body) {
      setImmediate(async () => {
        try {
          const logData = {
            userId: req.user?.id || null,
            action,
            entity,
            entityId: req.params.id || null,
            ipAddress: req.ip || req.connection?.remoteAddress || null,
            userAgent: req.get("user-agent") || null,
          };

          if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
            const sensitiveFields = ["password", "token", "secret", "creditCard"];
            const sanitizedBody = { ...req.body };
            for (const field of sensitiveFields) {
              if (sanitizedBody[field]) {
                sanitizedBody[field] = "[REDACTED]";
              }
            }
            logData.newValues = sanitizedBody;
          }

          if (res.locals.oldValues) {
            logData.oldValues = res.locals.oldValues;
          }

          if (res.locals.resourceId) {
            logData.entityId = res.locals.resourceId;
          }

          await prisma.activityLog.create({
            data: logData,
          });
        } catch (error) {
          logger.error("Failed to log activity:", error);
        }
      });

      return originalJson(body);
    };

    next();
  };
};

const logAssetActivity = (action) => {
  return logActivity(action, "Asset");
};

const logUserActivity = (action) => {
  return logActivity(action, "User");
};

const logDepartmentActivity = (action) => {
  return logActivity(action, "Department");
};

const logBookingActivity = (action) => {
  return logActivity(action, "Booking");
};

const logMaintenanceActivity = (action) => {
  return logActivity(action, "MaintenanceRequest");
};

const logTransferActivity = (action) => {
  return logActivity(action, "TransferRequest");
};

const logAuditActivity = (action) => {
  return logActivity(action, "AuditCycle");
};

const logNotificationActivity = (action) => {
  return logActivity(action, "Notification");
};

module.exports = {
  logActivity,
  logAssetActivity,
  logUserActivity,
  logDepartmentActivity,
  logBookingActivity,
  logMaintenanceActivity,
  logTransferActivity,
  logAuditActivity,
  logNotificationActivity,
};
