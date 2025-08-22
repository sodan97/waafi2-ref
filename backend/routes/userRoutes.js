import express from 'express';
import User from '../models/User.js'; 
import bcrypt from 'bcrypt';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { protect, admin } from '../middleware/authMiddleware.js'; // Assuming you have an auth middleware

const router = express.Router();

// POST /api/users/register
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Invalid email format').notEmpty().withMessage('Email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    console.log('POST /api/users/register route hit');
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    console.log('Register request body:', req.body);

    try {
      // Check if user already exists
      console.log('Checking for existing user with email:', email);
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.log('Existing user found:', existingUser.email);
        return res.status(400).json({ message: 'User with this email already exists' });
      }
      console.log('No existing user found. Proceeding with registration.');

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const newUser = new User({
        email,
        firstName: req.body.firstName, // Assuming firstName and lastName are in the body
        lastName: req.body.lastName,
        password: hashedPassword,
      });

      // Save user to database
      console.log('Saving new user to database...');
      await newUser.save();
      console.log('New user saved successfully.');

      // Return the created user (excluding password) and log the response
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
    console.log('POST /api/users/login route hit');
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    console.log('Login request body (excluding password):', { email });

    try {
      // Find the user by email
      console.log('Finding user with email:', email);
      const user = await User.findOne({ email });
      console.log('User found:', user ? user.email : 'None');

      // Check if user exists and password matches
      if (!user || !(await bcrypt.compare(password, user.password))) {
        console.log('Invalid credentials for email:', email);
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour
      res.json({ token });

    } catch (err) {
      console.log('Error during login process.');
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  });

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => { // Using protect and admin middleware
    // The 'admin' middleware should handle the admin check, but this is an extra safeguard
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    try {
      const users = await User.find({}).select('-password'); // Get all users, exclude password
      res.json(users);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Get a specific user by ID
// @route   GET /api/users/:id
// @access  Private (can be accessed by the user themselves or an admin)
router.get('/:id', protect, async (req, res) => { // Using protect middleware
    try {
      const user = await User.findById(req.params.id).select('-password'); // Find user by ID, exclude password

      // Check if the authenticated user is the requested user or an admin
      if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied.' });
      }
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
});

export default router;