const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const router = express.Router();

// Login route
router.post('/admin/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 3 })
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    
    if (!admin) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    const token = jwt.sign(
      { id: admin._id }, 
      process.env.JWT_SECRET || 'fallback-secret-key', 
      { expiresIn: process.env.JWT_EXPIRES_IN || '90d' }
    );

    res.json({
      success: true,
      token,
      admin: { 
        name: admin.name, 
        email: admin.email 
      }
    });
  } catch (err) {
    next(err);
  }
});

// Register route (for development only)
router.post('/admin/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 3 }),
  body('name').notEmpty().trim()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { name, email, password } = req.body;
    let admin = await Admin.findOne({ email });
    
    if (admin) {
      return res.status(400).json({ 
        success: false, 
        message: 'Admin already exists' 
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    admin = new Admin({ 
      name, 
      email, 
      passwordHash 
    });

    await admin.save();

    res.status(201).json({ 
      success: true, 
      message: 'Admin created successfully' 
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;