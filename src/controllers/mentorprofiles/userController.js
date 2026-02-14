// userController.js
import User from "../../models/users.js";

class UserController {

  // =========================
  // Get all users with role = 1 (with pagination and search)
  // =========================
  static async getUsersByRole(req, res) {
    try {
      const { page = 1, limit = 10, search = '' } = req.query;

      const filter = {
        role: 1,
        is_Deleted: false
      };

      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { username: { $regex: search, $options: 'i' } }
        ];
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const total = await User.countDocuments(filter);

      const users = await User.find(filter)
        .select('-password -fcm_token')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      return res.status(200).json({
        success: true,
        message: 'Users retrieved successfully',
        data: {
          users,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit))
          }
        }
      });

    } catch (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching users',
        error: error.message
      });
    }
  }

  // =========================
  // Get single user by ID
  // =========================
  static async getUserById(req, res) {
    try {
      const { userId } = req.params;

      const user = await User.findOne({
        _id: userId,
        role: 1,
        is_Deleted: false
      }).select('-password -fcm_token');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'User retrieved successfully',
        data: user
      });

    } catch (error) {
      console.error('Error fetching user:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching user',
        error: error.message
      });
    }
  }

  // =========================
  // Update user
  // =========================
  static async updateUser(req, res) {
    try {
      const { userId } = req.params;
      const updateData = { ...req.body };

      // Remove fields that shouldn't be updated directly
      delete updateData.password;
      delete updateData.role;
      delete updateData._id;

      const user = await User.findOneAndUpdate(
        { _id: userId, role: 1, is_Deleted: false },
        { $set: updateData },
        { new: true, runValidators: true }
      ).select('-password -fcm_token');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: user
      });

    } catch (error) {
      console.error('Error updating user:', error);
      return res.status(500).json({
        success: false,
        message: 'Error updating user',
        error: error.message
      });
    }
  }

  // =========================
  // Block/Unblock user
  // =========================
  static async toggleBlockUser(req, res) {
    try {
      const { userId, isBlock } = req.body;

      const user = await User.findOneAndUpdate(
        { _id: userId, role: 1, is_Deleted: false },
        { $set: { isBlock: isBlock } },
        { new: true }
      ).select('-password -fcm_token');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: `User ${isBlock ? 'blocked' : 'unblocked'} successfully`,
        data: user
      });

    } catch (error) {
      console.error('Error toggling user block status:', error);
      return res.status(500).json({
        success: false,
        message: 'Error updating user status',
        error: error.message
      });
    }
  }

  // =========================
  // Delete user (soft delete)
  // =========================
  static async deleteUser(req, res) {
    try {
      const { userId } = req.params;

      const user = await User.findOneAndUpdate(
        { _id: userId, role: 1 },
        { $set: { is_Deleted: true } },
        { new: true }
      ).select('-password -fcm_token');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'User deleted successfully',
        data: user
      });

    } catch (error) {
      console.error('Error deleting user:', error);
      return res.status(500).json({
        success: false,
        message: 'Error deleting user',
        error: error.message
      });
    }
  }
}

export default UserController;
