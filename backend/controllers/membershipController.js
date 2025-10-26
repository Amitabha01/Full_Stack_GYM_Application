import Membership from '../models/Membership.js';

// @desc    Get all membership plans
// @route   GET /api/memberships
// @access  Public
export const getMemberships = async (req, res) => {
  try {
    const memberships = await Membership.find({ isActive: true }).sort('price');

    res.status(200).json({
      status: 'success',
      data: { memberships }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching memberships',
      error: error.message
    });
  }
};

// @desc    Get single membership plan
// @route   GET /api/memberships/:id
// @access  Public
export const getMembership = async (req, res) => {
  try {
    const membership = await Membership.findById(req.params.id);

    if (!membership) {
      return res.status(404).json({
        status: 'error',
        message: 'Membership plan not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { membership }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching membership',
      error: error.message
    });
  }
};

// @desc    Create membership plan
// @route   POST /api/memberships
// @access  Private/Admin
export const createMembership = async (req, res) => {
  try {
    const membership = await Membership.create(req.body);

    res.status(201).json({
      status: 'success',
      message: 'Membership plan created successfully',
      data: { membership }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error creating membership',
      error: error.message
    });
  }
};

// @desc    Update membership plan
// @route   PUT /api/memberships/:id
// @access  Private/Admin
export const updateMembership = async (req, res) => {
  try {
    const membership = await Membership.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!membership) {
      return res.status(404).json({
        status: 'error',
        message: 'Membership plan not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Membership plan updated successfully',
      data: { membership }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error updating membership',
      error: error.message
    });
  }
};

// @desc    Delete membership plan
// @route   DELETE /api/memberships/:id
// @access  Private/Admin
export const deleteMembership = async (req, res) => {
  try {
    const membership = await Membership.findById(req.params.id);

    if (!membership) {
      return res.status(404).json({
        status: 'error',
        message: 'Membership plan not found'
      });
    }

    await membership.deleteOne();

    res.status(200).json({
      status: 'success',
      message: 'Membership plan deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error deleting membership',
      error: error.message
    });
  }
};
