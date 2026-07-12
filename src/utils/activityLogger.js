const activityLogService = require('../services/activityLogService');

const logActivity = async (req, { action, entity, entityId, oldValues, newValues, description }) => {
  try {
    await activityLogService.log({
      userId: req.user?.id || null,
      action,
      entity,
      entityId,
      oldValues,
      newValues,
      description,
      ipAddress: req.ip || req.connection?.remoteAddress || null,
      userAgent: req.headers?.['user-agent'] || null,
    });
  } catch (err) {
    console.error('Failed to log activity:', err.message);
  }
};

const logCreation = async (req, entity, entityId, newValues) => {
  await logActivity(req, { action: 'CREATE', entity, entityId, newValues });
};

const logUpdate = async (req, entity, entityId, oldValues, newValues) => {
  await logActivity(req, { action: 'UPDATE', entity, entityId, oldValues, newValues });
};

const logDeletion = async (req, entity, entityId, oldValues) => {
  await logActivity(req, { action: 'DELETE', entity, entityId, oldValues });
};

const logStatusChange = async (req, entity, entityId, oldStatus, newStatus) => {
  await logActivity(req, {
    action: 'STATUS_CHANGE',
    entity,
    entityId,
    oldValues: { status: oldStatus },
    newValues: { status: newStatus },
  });
};

module.exports = { logActivity, logCreation, logUpdate, logDeletion, logStatusChange };
