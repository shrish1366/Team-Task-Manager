const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const { generateToken } = require('../utils/jwt');
const { successResponse, errorResponse } = require('../utils/response');

const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return errorResponse(res, 'Email already registered', 409);

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role: role === 'ADMIN' ? 'ADMIN' : 'MEMBER' },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    const token = generateToken({ id: user.id, role: user.role });
    return successResponse(res, { user, token }, 'Account created successfully', 201);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return errorResponse(res, 'Invalid credentials', 401);

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return errorResponse(res, 'Invalid credentials', 401);

    const token = generateToken({ id: user.id, role: user.role });
    const { password: _, ...safeUser } = user;
    return successResponse(res, { user: safeUser, token }, 'Login successful');
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

const getMe = async (req, res) => {
  const { password: _, ...safeUser } = req.user;
  return successResponse(res, safeUser);
};

const updateProfile = async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, avatar },
      select: { id: true, name: true, email: true, role: true, avatar: true, updatedAt: true },
    });
    return successResponse(res, user, 'Profile updated');
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return errorResponse(res, 'Current password is incorrect', 400);
    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } });
    return successResponse(res, null, 'Password changed successfully');
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

module.exports = { signup, login, getMe, updateProfile, changePassword };
