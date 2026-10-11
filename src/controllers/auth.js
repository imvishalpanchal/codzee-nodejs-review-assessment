const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const prisma = require('../config/database/prismaClient');
const { errors } = require('../config/api/errorHandler');
const ApiResponse = require('../config/api/sendResponse');
const messages = require('../utils/messages');

const authController = {
  register: async (req, res, next) => {
    try {
      const { name, email, password, role } = req.body;

      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (existingUser) {
        return next(errors.conflict(messages.EMAIL_EXISTS));
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          password: hashedPassword,
          role: role || 'member'
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true
        }
      });

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'super_secret_codzee_jwt_key_2026_dev_env',
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      return ApiResponse.details(res, 201, messages.AUTH.REGISTER_SUCCESS, {
        user,
        token
      });
    } catch (error) {
      next(error);
    }
  },

  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (!user) {
        return next(errors.unauthorized(messages.INVALID_CREDENTIALS));
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return next(errors.unauthorized(messages.INVALID_CREDENTIALS));
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'super_secret_codzee_jwt_key_2026_dev_env',
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      return ApiResponse.details(res, 200, messages.AUTH.LOGIN_SUCCESS, {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token
      });
    } catch (error) {
      next(error);
    }
  },

  getProfile: async (req, res, next) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          _count: {
            select: {
              ownedProjects: true,
              assignedTasks: true
            }
          }
        }
      });

      if (!user) {
        return next(errors.notFound('User profile not found'));
      }

      return ApiResponse.details(res, 200, messages.AUTH.PROFILE_SUCCESS, user);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = authController;
