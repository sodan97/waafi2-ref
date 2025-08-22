import express from 'express';
const router = express.Router();
import Reservation from '../models/Reservation.js'; // Import the Reservation model
import { protect, admin } from '../middleware/authMiddleware.js'; // Assuming authMiddleware is used

// @route   POST /api/reservations
// @access  Public (or Private if users must be logged in)
router.post('/', async (req, res) => {
  const { productId, userId } = req.body;

  // Basic validation
  if (!productId || !userId) {
    res.status(400).json({ message: 'Product ID and User ID are required' });
    return;
  }

  try {
    // Optional: Check if a reservation for this product/user already exists

    const newReservation = new Reservation({
      productId,
      userId,
      // date will default to Date.now
    });

    const createdReservation = await newReservation.save();
    res.status(201).json(createdReservation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get all reservations (for admin)
// @route   GET /api/reservations
// @access  Private/Admin (uncomment admin middleware if needed)
router.get('/', protect, admin, async (req, res) => {
  try {
    const reservations = await Reservation.find({});
    // Optionally populate product and user details
    // .populate('productId', 'name')
    // .populate('userId', 'firstName lastName email');
    res.json(reservations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get reservations for a specific user
// @route   GET /api/reservations/user/:userId
// @access  Private (user can get their own, admin can get any) (uncomment protect middleware if needed)
router.get('/user/:userId', protect, async (req, res) => {
    const userId = req.params.userId;

    try {
        // Optional: Check if req.user.id matches userId if not admin
        const reservations = await Reservation.find({ userId: userId });
        // Optionally populate product details
        // .populate('productId', 'name');
        res.json(reservations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Remove reservations for a specific product (e.g., when stock is back)
// @route   DELETE /api/reservations/product/:productId
// @access  Private/Admin (uncomment admin middleware if needed)
router.delete('/product/:productId', protect, admin, async (req, res) => {
    const productId = req.params.productId;

    try {
        // Delete all reservations for this product
        await Reservation.deleteMany({ productId: productId });
        res.json({ message: 'Reservations removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});


export default router;