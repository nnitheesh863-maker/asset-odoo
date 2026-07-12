const { scheduleMaintenanceReminders } = require('./maintenanceReminder');
const { scheduleOverdueAllocations } = require('./overdueAllocations');

const startAllJobs = () => {
  scheduleMaintenanceReminders();
  scheduleOverdueAllocations();
  console.log('[Cron] All cron jobs registered');
};

module.exports = { startAllJobs };
