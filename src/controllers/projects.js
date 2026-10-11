const projectService = require('../services/projects');
const ApiResponse = require('../config/api/sendResponse');
const messages = require('../utils/messages');

const projectController = {
  getAll: async (req, res, next) => {
    try {
      const { projects, total, page, limit } = await projectService.getProjects(
        req.user.id,
        req.user.role,
        req.query
      );

      return ApiResponse.list(
        res,
        200,
        projects,
        { page, limit },
        total,
        messages.PROJECT.FETCH_SUCCESS
      );
    } catch (error) {
      next(error);
    }
  },

  getById: async (req, res, next) => {
    try {
      const project = await projectService.getProjectById(
        req.params.id,
        req.user.id,
        req.user.role
      );

      return ApiResponse.details(
        res,
        200,
        messages.PROJECT.DETAILS_SUCCESS,
        project
      );
    } catch (error) {
      next(error);
    }
  },

  create: async (req, res, next) => {
    try {
      const project = await projectService.createProject(req.body, req.user.id);

      return ApiResponse.details(
        res,
        201,
        messages.PROJECT.CREATE_SUCCESS,
        project
      );
    } catch (error) {
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
      const updated = await projectService.updateProject(
        req.params.id,
        req.body,
        req.user.id,
        req.user.role
      );

      return ApiResponse.details(
        res,
        200,
        messages.PROJECT.UPDATE_SUCCESS,
        updated
      );
    } catch (error) {
      next(error);
    }
  },

  delete: async (req, res, next) => {
    try {
      await projectService.deleteProject(
        req.params.id,
        req.user.id,
        req.user.role
      );

      return ApiResponse.details(
        res,
        200,
        messages.PROJECT.DELETE_SUCCESS,
        { id: parseInt(req.params.id, 10) }
      );
    } catch (error) {
      next(error);
    }
  }
};

module.exports = projectController;
