const cron = require('node-cron');
const { prisma } = require('../config/database');
const notificationService = require('../services/notificationService');
const { emitToUser, emitToDepartment } = require('../sockets');

const checkOverdueAllocations = async () => {
  try {
    const now = new Date();

    const overdueAllocations = await prisma.assetAllocation.findMany({
      where: {
        isActive: true,
        dueDate: { lt: now },
      },
      include: {
        asset: { select: { id: true, assetCode: true, name: true } },
        user: { select: { id: true, firstName: true, lastName: true, email: true, departmentId: true } },
      },
    });

    for (const allocation of overdueAllocations) {
      const daysOverdue = Math.ceil((now - new Date(allocation.dueDate)) / (1000 * 60 * 60 * 24));
      const dueDateStr = new Date(allocation.dueDate).toLocaleDateString();

      const title = `Overdue Asset: ${allocation.asset.name}`;
      const message = `Asset ${allocation.asset.assetCode} - ${allocation.asset.name} allocated to ${allocation.user.firstName} ${allocation.user.lastName} was due on ${dueDateStr} and is ${daysOverdue} day(s) overdue.`;

      const notification = await notificationService.create(
        allocation.userId,
        'GENERAL',
        title,
        message,
        { link: `/allocations/${allocation.id}` }
      );

      emitToUser(allocation.userId, 'notification', notification);
      emitToUser(allocation.userId, 'overdue-allocation', {
        allocationId: allocation.id,
        assetCode: allocation.asset.assetCode,
        daysOverdue,
      });
    }

    if (overdueAllocations.length > 0) {
      const managerUserIds = await prisma.user.findMany({
        where: { role: { in: ['ADMIN', 'MANAGER'] }, isActive: true },
        select: { id: true, departmentId: true },
      });

      const uniqueManagerIds = [...new Set(managerUserIds.map((u) => u.id))];
      if (uniqueManagerIds.length > 0) {
        const managerTitle = `Overdue Allocations Alert`;
        const managerMessage = `${overdueAllocations.length} asset allocation(s) are overdue and require attention.`;

        await notificationService.createBulk(
          uniqueManagerIds,
          'GENERAL',
          managerTitle,
          managerMessage,
          { link: '/allocations?status=overdue' }
        );

        for (const managerId of uniqueManagerIds) {
          emitToUser(managerId, 'notification', {
            type: 'GENERAL',
            title: managerTitle,
            message: managerMessage,
          });
        }
      }
    }

    console.log(`[Cron] Overdue allocations check: ${overdueAllocations.length} overdue found`);
  } catch (error) {
    console.error('[Cron] Error checking overdue allocations:', error.message);
  }
};

const scheduleOverdueAllocations = () => {
  cron.schedule('0 8 * * *', checkOverdueAllocations, {
    timezone: 'UTC',
  });
  console.log('[Cron] Overdue allocations job scheduled (daily at 8:00 AM UTC)');
};

module.exports = { scheduleOverdueAllocations, checkOverdueAllocations };
