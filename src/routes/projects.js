const express = require('express');
const projectController = require('../controllers/projects');
const { authMiddleware } = require('../middlewares/auth');
const { validateRequest } = require('../utils/yup');
const { createProjectSchema, updateProjectSchema } = require('../validations/projects');

const router = express.Router();

router.use(authMiddleware);

router.get('/', projectController.getAll);
router.get('/:id', projectController.getById);
router.post('/', validateRequest(createProjectSchema), projectController.create);
router.put('/:id', validateRequest(updateProjectSchema), projectController.update);
router.delete('/:id', projectController.delete);

module.exports = router;
