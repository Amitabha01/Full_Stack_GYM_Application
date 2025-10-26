import Booking from '../models/Booking.js';
import Class from '../models/Class.js';

// @desc    Get all bookings for logged in member
// @route   GET /api/bookings
// @access  Private
export const getBookings = async (req, res) => {
  try {
    const { status, startDate, endDate, page = 1, limit = 10 } = req.query;

    const query = { member: req.user._id };

    if (status) query.status = status;
    
    if (startDate || endDate) {
      query.bookingDate = {};
      if (startDate) query.bookingDate.$gte = new Date(startDate);
      if (endDate) query.bookingDate.$lte = new Date(endDate);
    }

    const bookings = await Booking.find(query)
      .sort('-bookingDate')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('class', 'name category duration trainer image')
      .populate({
        path: 'class',
        populate: {
          path: 'trainer',
          select: 'name avatar'
        }
      });

    const count = await Booking.countDocuments(query);

    res.status(200).json({
      status: 'success',
      data: {
        bookings,
        pagination: {
          total: count,
          page: Number(page),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching bookings',
      error: error.message
    });
  }
};

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
export const createBooking = async (req, res) => {
  try {
    const { classId, bookingDate, timeSlot } = req.body;

    // Check if class exists
    const classItem = await Class.findById(classId);
    if (!classItem) {
      return res.status(404).json({
        status: 'error',
        message: 'Class not found'
      });
    }

    // Check capacity
    if (classItem.currentEnrollment >= classItem.maxCapacity) {
      return res.status(400).json({
        status: 'error',
        message: 'Class is fully booked'
      });
    }

    // Check if already booked
    const existingBooking = await Booking.findOne({
      member: req.user._id,
      class: classId,
      bookingDate: new Date(bookingDate),
      status: { $in: ['confirmed', 'completed'] }
    });

    if (existingBooking) {
      return res.status(400).json({
        status: 'error',
        message: 'You have already booked this class for this date'
      });
    }

    const booking = await Booking.create({
      member: req.user._id,
      class: classId,
      bookingDate: new Date(bookingDate),
      timeSlot,
      paymentAmount: classItem.price,
      paymentStatus: classItem.price === 0 ? 'paid' : 'pending'
    });

    // Update class enrollment
    classItem.currentEnrollment += 1;
    await classItem.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate('class', 'name category duration trainer image')
      .populate({
        path: 'class',
        populate: {
          path: 'trainer',
          select: 'name avatar'
        }
      });

    res.status(201).json({
      status: 'success',
      message: 'Booking created successfully',
      data: { booking: populatedBooking }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error creating booking',
      error: error.message
    });
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    if (booking.member.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to cancel this booking'
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        status: 'error',
        message: 'Booking already cancelled'
      });
    }

    booking.status = 'cancelled';
    booking.cancellationReason = req.body.reason || '';
    booking.cancelledAt = new Date();
    await booking.save();

    // Update class enrollment
    const classItem = await Class.findById(booking.class);
    if (classItem) {
      classItem.currentEnrollment = Math.max(0, classItem.currentEnrollment - 1);
      await classItem.save();
    }

    res.status(200).json({
      status: 'success',
      message: 'Booking cancelled successfully',
      data: { booking }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error cancelling booking',
      error: error.message
    });
  }
};

// @desc    Get booking statistics
// @route   GET /api/bookings/stats
// @access  Private
export const getBookingStats = async (req, res) => {
  try {
    const stats = await Booking.aggregate([
      { $match: { member: req.user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const total = await Booking.countDocuments({ member: req.user._id });
    const upcoming = await Booking.countDocuments({
      member: req.user._id,
      status: 'confirmed',
      bookingDate: { $gte: new Date() }
    });

    res.status(200).json({
      status: 'success',
      data: {
        total,
        upcoming,
        byStatus: stats
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching booking statistics',
      error: error.message
    });
  }
};
