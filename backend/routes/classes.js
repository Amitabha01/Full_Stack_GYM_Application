import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import Class from '../models/Class.js';

const router = express.Router();

// Get all classes
router.get('/', async (req, res) => {
  try {
    const classes = await Class.find().populate('trainer', 'name email');
    res.json({
      success: true,
      count: classes.length,
      data: classes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get single class
router.get('/:id', async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id).populate('trainer', 'name email');
    
    if (!classItem) {
      return res.status(404).json({
        success: false,
        error: 'Class not found'
      });
    }
    
    res.json({
      success: true,
      data: classItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create class (trainer/admin only)
router.post('/', protect, authorize('trainer', 'admin'), async (req, res) => {
  try {
    const classItem = await Class.create({
      ...req.body,
      trainer: req.user.id
    });
    
    res.status(201).json({
      success: true,
      data: classItem
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Update class (trainer/admin only)
router.put('/:id', protect, authorize('trainer', 'admin'), async (req, res) => {
  try {
    const classItem = await Class.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!classItem) {
      return res.status(404).json({
        success: false,
        error: 'Class not found'
      });
    }
    
    res.json({
      success: true,
      data: classItem
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Delete class (admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const classItem = await Class.findByIdAndDelete(req.params.id);
    
    if (!classItem) {
      return res.status(404).json({
        success: false,
        error: 'Class not found'
      });
    }
    
    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
