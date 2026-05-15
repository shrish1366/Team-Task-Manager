const prisma = require('../config/prisma');

const logActivity = async ({ action, entityType, entityId, userId, projectId = null, taskId = null }) => {
  try {
    await prisma.activityLog.create({
      data: { action, entityType, entityId, userId, projectId, taskId },
    });
  } catch (err) {
    console.error('Activity log error:', err.message);
  }
};

module.exports = { logActivity };
