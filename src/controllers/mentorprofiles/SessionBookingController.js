
import SessionBooking from '../../models/sessions.js';
import mongoose from 'mongoose';

class SessionBookingController {
  static async getSessionBookings(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        status = '',
        paymentStatus = '',
        sessionType = '',
        startDate = '',
        endDate = ''
      } = req.query;

      const filter = {};

      if (search) {
        filter.$or = [
          { menteeName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { menteeEmail: { $regex: search, $options: 'i' } },
          { topic: { $regex: search, $options: 'i' } },
          { zoomMeetingId: { $regex: search, $options: 'i' } }
        ];
      }

      if (status) {
        filter.status = status;
      }

      if (paymentStatus) {
        filter.paymentStatus = paymentStatus;
      }

      if (sessionType) {
        filter.sessionType = sessionType;
      }

      if (startDate || endDate) {
        filter.sessionDate = {};
        if (startDate) {
          filter.sessionDate.$gte = new Date(startDate);
        }
        if (endDate) {
          filter.sessionDate.$lte = new Date(endDate);
        }
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const bookings = await SessionBooking.find(filter)
        .populate('userId', 'name email')
        .populate('mentorId', 'name email expertise')
        .populate('menteeId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await SessionBooking.countDocuments(filter);

      res.status(200).json({
        success: true,
        data: bookings,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching session bookings:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching session bookings',
        error: error.message
      });
    }
  }

  // Get single session booking by ID
  static async getSessionBookingById(req, res) {
    try {
      const { bookingId } = req.params;

      // Validate MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(bookingId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid booking ID'
        });
      }

      const booking = await SessionBooking.findById(bookingId)
        .populate('userId', 'name email phone')
        .populate('mentorId', 'name email expertise profileImage')
        .populate('menteeId', 'name email phone');

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Session booking not found'
        });
      }

      res.status(200).json({
        success: true,
        data: booking
      });
    } catch (error) {
      console.error('Error fetching session booking:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching session booking',
        error: error.message
      });
    }
  }

  // Update session booking
  static async updateSessionBooking(req, res) {
    try {
      const { bookingId } = req.params;
      const updateData = req.body;

      // Validate MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(bookingId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid booking ID'
        });
      }

      // Remove fields that shouldn't be updated directly
      delete updateData._id;
      delete updateData.__v;
      delete updateData.createdAt;

      // Update the booking
      const updatedBooking = await SessionBooking.findByIdAndUpdate(
        bookingId,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      )
        .populate('userId', 'name email')
        .populate('mentorId', 'name email expertise')
        .populate('menteeId', 'name email');

      if (!updatedBooking) {
        return res.status(404).json({
          success: false,
          message: 'Session booking not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Session booking updated successfully',
        data: updatedBooking
      });
    } catch (error) {
      console.error('Error updating session booking:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating session booking',
        error: error.message
      });
    }
  }

  // Update session status
  static async updateSessionStatus(req, res) {
    try {
      const { bookingId, status } = req.body;

      // Validate inputs
      if (!bookingId || !status) {
        return res.status(400).json({
          success: false,
          message: 'Booking ID and status are required'
        });
      }

      // Validate status value
      const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled', 'rescheduled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Valid statuses are: ${validStatuses.join(', ')}`
        });
      }

      // Validate MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(bookingId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid booking ID'
        });
      }

      const updatedBooking = await SessionBooking.findByIdAndUpdate(
        bookingId,
        { status, updatedAt: new Date() },
        { new: true }
      );

      if (!updatedBooking) {
        return res.status(404).json({
          success: false,
          message: 'Session booking not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Session status updated successfully',
        data: updatedBooking
      });
    } catch (error) {
      console.error('Error updating session status:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating session status',
        error: error.message
      });
    }
  }

  // Update payment status
  static async updatePaymentStatus(req, res) {
    try {
      const { bookingId, paymentStatus, paymentMethod } = req.body;

      // Validate inputs
      if (!bookingId || !paymentStatus) {
        return res.status(400).json({
          success: false,
          message: 'Booking ID and payment status are required'
        });
      }

      // Validate payment status value
      const validPaymentStatuses = ['unpaid', 'paid', 'refunded', 'failed'];
      if (!validPaymentStatuses.includes(paymentStatus)) {
        return res.status(400).json({
          success: false,
          message: `Invalid payment status. Valid statuses are: ${validPaymentStatuses.join(', ')}`
        });
      }

      // Validate MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(bookingId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid booking ID'
        });
      }

      const updateData = { paymentStatus, updatedAt: new Date() };
      if (paymentMethod) {
        updateData.paymentMethod = paymentMethod;
      }

      const updatedBooking = await SessionBooking.findByIdAndUpdate(
        bookingId,
        updateData,
        { new: true }
      );

      if (!updatedBooking) {
        return res.status(404).json({
          success: false,
          message: 'Session booking not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Payment status updated successfully',
        data: updatedBooking
      });
    } catch (error) {
      console.error('Error updating payment status:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating payment status',
        error: error.message
      });
    }
  }

  // Delete session booking
  static async deleteSessionBooking(req, res) {
    try {
      const { bookingId } = req.params;

      // Validate MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(bookingId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid booking ID'
        });
      }

      const deletedBooking = await SessionBooking.findByIdAndDelete(bookingId);

      if (!deletedBooking) {
        return res.status(404).json({
          success: false,
          message: 'Session booking not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Session booking deleted successfully',
        data: deletedBooking
      });
    } catch (error) {
      console.error('Error deleting session booking:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting session booking',
        error: error.message
      });
    }
  }

  // Get booking statistics
  static async getBookingStats(req, res) {
    try {
      const { startDate, endDate } = req.query;

      // Build date filter
      const dateFilter = {};
      if (startDate || endDate) {
        dateFilter.sessionDate = {};
        if (startDate) {
          dateFilter.sessionDate.$gte = new Date(startDate);
        }
        if (endDate) {
          dateFilter.sessionDate.$lte = new Date(endDate);
        }
      }

      // Get total bookings
      const totalBookings = await SessionBooking.countDocuments(dateFilter);

      // Get bookings by status
      const statusStats = await SessionBooking.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      // Get bookings by payment status
      const paymentStats = await SessionBooking.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: '$paymentStatus',
            count: { $sum: 1 },
            totalAmount: { $sum: '$price' }
          }
        }
      ]);

      // Get bookings by session type
      const sessionTypeStats = await SessionBooking.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: '$sessionType',
            count: { $sum: 1 }
          }
        }
      ]);

      // Get revenue statistics
      const revenueStats = await SessionBooking.aggregate([
        { $match: { ...dateFilter, paymentStatus: 'paid' } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$price' },
            averagePrice: { $avg: '$price' }
          }
        }
      ]);

      res.status(200).json({
        success: true,
        data: {
          totalBookings,
          statusBreakdown: statusStats,
          paymentBreakdown: paymentStats,
          sessionTypeBreakdown: sessionTypeStats,
          revenue: revenueStats[0] || { totalRevenue: 0, averagePrice: 0 }
        }
      });
    } catch (error) {
      console.error('Error fetching booking statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching booking statistics',
        error: error.message
      });
    }
  }
}

export default SessionBookingController;