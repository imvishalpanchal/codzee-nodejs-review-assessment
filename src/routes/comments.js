const express = require('express');
const commentController = require('../controllers/comments');
const { authMiddleware } = require('../middlewares/auth');
const { validateRequest } = require('../utils/yup');
const { createCommentSchema } = require('../validations/comments');

const router = express.Router();

router.use(authMiddleware);

router.get('/task/:taskId', commentController.getByTaskId);
router.post('/task/:taskId', validateRequest(createCommentSchema), commentController.create);
router.delete('/:id', commentController.delete);

module.exports = router;
