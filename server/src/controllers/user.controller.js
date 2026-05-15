const prisma = require('../config/prisma');
const { successResponse, errorResponse } = require('../utils/response');

const getAllUsers = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = search
      ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }] }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        select: { id: true, name: true, email: true, role: true, avatar: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return successResponse(res, { users, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: { id: true, name: true, email: true, role: true, avatar: true, createdAt: true },
    });
    if (!user) return errorResponse(res, 'User not found', 404);
    return successResponse(res, user);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['ADMIN', 'MEMBER'].includes(role)) return errorResponse(res, 'Invalid role', 400);
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });
    return successResponse(res, user, 'Role updated');
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user.id) return errorResponse(res, 'Cannot delete yourself', 400);
    await prisma.user.delete({ where: { id: req.params.id } });
    return successResponse(res, null, 'User deleted');
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

module.exports = { getAllUsers, getUserById, updateUserRole, deleteUser };
