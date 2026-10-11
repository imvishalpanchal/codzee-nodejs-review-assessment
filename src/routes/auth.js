const express = require('express');
const authController = require('../controllers/auth');
const { validateRequest } = require('../utils/yup');
const { registerSchema, loginSchema } = require('../validations/auth');
const { authMiddleware } = require('../middlewares/auth');

const router = express.Router();

router.post('/register', validateRequest(registerSchema), authController.register);
router.post('/login', validateRequest(loginSchema), authController.login);
router.get('/me', authMiddleware, authController.getProfile);

module.exports = router;
