// userRoutes.js - Backend Routes

import express from 'express';
import UserController from '../../controllers/mentorprofiles/userController.js';

const router = express.Router();

// Get all users with role = 1 (with pagination and search)
router.get('/get-users', UserController.getUsersByRole);

// Get single user by ID
router.get('/Admin/view-user/:userId', UserController.getUserById);

// Update user
router.put('/update-user/:userId', UserController.updateUser);

// Block/Unblock user
router.post('/block-user',  UserController.toggleBlockUser);

// Delete user (soft delete)
router.delete('/delete-user/:userId',  UserController.deleteUser);
export default router;
