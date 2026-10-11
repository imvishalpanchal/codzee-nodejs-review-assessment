const commentService = require('../services/comments');
const ApiResponse = require('../config/api/sendResponse');
const messages = require('../utils/messages');

const commentController = {
  getByTaskId: async (req, res, next) => {
    try {
      const comments = await commentService.getCommentsByTaskId(
        req.params.taskId,
        req.user.id,
        req.user.role
      );

      return ApiResponse.details(
        res,
        200,
        messages.COMMENT.FETCH_SUCCESS,
        comments
      );
    } catch (error) {
      next(error);
    }
  },

  create: async (req, res, next) => {
    try {
      const comment = await commentService.createComment(
        req.params.taskId,
        req.body.content,
        req.user.id,
        req.user.role
      );

      return ApiResponse.details(
        res,
        201,
        messages.COMMENT.CREATE_SUCCESS,
        comment
      );
    } catch (error) {
      next(error);
    }
  },

  delete: async (req, res, next) => {
    try {
      await commentService.deleteComment(
        req.params.id,
        req.user.id,
        req.user.role
      );

      return ApiResponse.details(
        res,
        200,
        messages.COMMENT.DELETE_SUCCESS,
        { id: parseInt(req.params.id, 10) }
      );
    } catch (error) {
      next(error);
    }
  }
};

module.exports = commentController;
