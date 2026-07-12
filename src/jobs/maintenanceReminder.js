const cron = require('node-cron');
const { prisma } = require('../config/database');
const notificationService = require('../services/notificationService');
const { emitToUser } = require('../sockets');

const checkMaintenanceReminders = async () => {
  try {
    const now = new Date();
    const threeDaysFromNow = new Date(now);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const upcomingMaintenance = await prisma.maintenanceRequest.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledDate: {
          gte: now,
          lte: threeDaysFromNow,
        },
      },
      include: {
        asset: { select: { id: true, assetCode: true, name: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    for (const maintenance of upcomingMaintenance) {
      if (!maintenance.assignedToId) continue;

      const scheduledDate = new Date(maintenance.scheduledDate).toLocaleDateString();
      const title = `Maintenance Reminder: ${maintenance.asset.name}`;
      const message = `Scheduled maintenance for ${maintenance.asset.assetCode} - ${maintenance.asset.name} is due on ${scheduledDate}. Priority: ${maintenance.priority}.`;

      const notification = await notificationService.create(
        maintenance.assignedToId,
        'MAINTENANCE_SCHEDULED',
        title,
        message,
        { link: `/maintenance/${maintenance.id}` }
      );

      emitToUser(maintenance.assignedToId, 'notification', notification);
    }

    console.log(`[Cron] Maintenance reminders sent for ${upcomingMaintenance.length} upcoming tasks`);
  } catch (error) {
    console.error('[Cron] Error checking maintenance reminders:', error.message);
  }
};

const scheduleMaintenanceReminders = () => {
  cron.schedule('0 9 * * *', checkMaintenanceReminders, {
    timezone: 'UTC',
  });
  console.log('[Cron] Maintenance reminder job scheduled (daily at 9:00 AM UTC)');
};

module.exports = { scheduleMaintenanceReminders, checkMaintenanceReminders };
