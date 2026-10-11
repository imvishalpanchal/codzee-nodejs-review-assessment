const taskService = require('../services/tasks');
const ApiResponse = require('../config/api/sendResponse');
const messages = require('../utils/messages');

const taskController = {
  getAll: async (req, res, next) => {
    try {
      const { tasks, total, page, limit } = await taskService.getTasks(
        req.query,
        req.user.id,
        req.user.role
      );

      return ApiResponse.list(
        res,
        200,
        tasks,
        { page, limit },
        total,
        messages.TASK.FETCH_SUCCESS
      );
    } catch (error) {
      next(error);
    }
  },

  getById: async (req, res, next) => {
    try {
      const task = await taskService.getTaskById(
        req.params.id,
        req.user.id,
        req.user.role
      );

      return ApiResponse.details(
        res,
        200,
        messages.TASK.DETAILS_SUCCESS,
        task
      );
    } catch (error) {
      next(error);
    }
  },

  create: async (req, res, next) => {
    try {
      const task = await taskService.createTask(
        req.body,
        req.user.id,
        req.user.role
      );

      return ApiResponse.details(
        res,
        201,
        messages.TASK.CREATE_SUCCESS,
        task
      );
    } catch (error) {
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
      const updated = await taskService.updateTask(
        req.params.id,
        req.body,
        req.user.id,
        req.user.role
      );

      return ApiResponse.details(
        res,
        200,
        messages.TASK.UPDATE_SUCCESS,
        updated
      );
    } catch (error) {
      next(error);
    }
  },

  delete: async (req, res, next) => {
    try {
      await taskService.deleteTask(
        req.params.id,
        req.user.id,
        req.user.role
      );

      return ApiResponse.details(
        res,
        200,
        messages.TASK.DELETE_SUCCESS,
        { id: parseInt(req.params.id, 10) }
      );
    } catch (error) {
      next(error);
    }
  }
};

module.exports = taskController;
