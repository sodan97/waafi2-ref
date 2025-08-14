import express from 'express';
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';

const router = express.Router();

// POST /api/users/register
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Invalid email format').notEmpty().withMessage('Email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new user
      const newUser = new User({
        email,
        password: hashedPassword,
      });

      // Save user to database
      await newUser.save();

      // Return the created user (excluding password)
      const userResponse = newUser.toObject();
      delete userResponse.password;

      res.status(201).json(userResponse);

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// POST /api/users/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Invalid email format').notEmpty().withMessage('Email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Find the user by email
      const user = await User.findOne({ email });

      // Check if user exists and password matches
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour

      res.json({ token });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  });

export default router;