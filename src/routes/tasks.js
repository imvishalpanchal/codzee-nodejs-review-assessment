const express = require('express');
const taskController = require('../controllers/tasks');
const { authMiddleware } = require('../middlewares/auth');
const { validateRequest } = require('../utils/yup');
const { createTaskSchema, updateTaskSchema } = require('../validations/tasks');

const router = express.Router();

router.use(authMiddleware);

router.get('/', taskController.getAll);
router.get('/:id', taskController.getById);
router.post('/', validateRequest(createTaskSchema), taskController.create);
router.put('/:id', validateRequest(updateTaskSchema), taskController.update);
router.delete('/:id', taskController.delete);

module.exports = router;
