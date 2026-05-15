const prisma = require('../config/prisma');
const { successResponse, errorResponse } = require('../utils/response');

const getAdminDashboard = async (req, res) => {
  try {
    const now = new Date();

    const [
      totalProjects,
      totalTasks,
      completedTasks,
      overdueTasks,
      totalUsers,
      totalTeams,
      recentActivity,
      projectsByStatus,
      tasksByPriority,
    ] = await Promise.all([
      prisma.project.count(),
      prisma.task.count(),
      prisma.task.count({ where: { status: 'COMPLETED' } }),
      prisma.task.count({ where: { deadline: { lt: now }, status: { not: 'COMPLETED' } } }),
      prisma.user.count(),
      prisma.team.count(),
      prisma.activityLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, name: true, avatar: true } } },
      }),
      prisma.project.groupBy({ by: ['status'], _count: { status: true } }),
      prisma.task.groupBy({ by: ['priority'], _count: { priority: true } }),
    ]);

    const pendingTasks = totalTasks - completedTasks;

    return successResponse(res, {
      stats: { totalProjects, totalTasks, completedTasks, pendingTasks, overdueTasks, totalUsers, totalTeams },
      recentActivity,
      charts: { projectsByStatus, tasksByPriority },
    });
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

const getMemberDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    const [
      assignedTasks,
      completedTasks,
      overdueTasks,
      upcomingTasks,
      myProjects,
      recentActivity,
    ] = await Promise.all([
      prisma.task.count({ where: { assignedToId: userId } }),
      prisma.task.count({ where: { assignedToId: userId, status: 'COMPLETED' } }),
      prisma.task.count({ where: { assignedToId: userId, deadline: { lt: now }, status: { not: 'COMPLETED' } } }),
      prisma.task.findMany({
        where: { assignedToId: userId, status: { not: 'COMPLETED' }, deadline: { gte: now } },
        orderBy: { deadline: 'asc' },
        take: 5,
        include: { project: { select: { id: true, title: true } } },
      }),
      prisma.project.findMany({
        where: { members: { some: { userId } } },
        select: { id: true, title: true, status: true, deadline: true },
        take: 5,
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.activityLog.findMany({
        where: { userId },
        take: 10,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const inProgressTasks = await prisma.task.count({ where: { assignedToId: userId, status: 'IN_PROGRESS' } });

    return successResponse(res, {
      stats: { assignedTasks, completedTasks, overdueTasks, inProgressTasks },
      upcomingTasks,
      myProjects,
      recentActivity,
    });
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

module.exports = { getAdminDashboard, getMemberDashboard };
