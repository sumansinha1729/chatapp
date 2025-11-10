const express = require('express');
const { getAllUsers, getUserById, getCurrentUser } = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getAllUsers);
router.get('/me', getCurrentUser);
router.get('/:id', getUserById);

module.exports = router;
