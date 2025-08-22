import express from 'express';
const router = express.Router();
import Order from '../models/Order.js'; // Assuming your Order model is in ../models/Order
// If using auth middleware, uncomment these imports:
// import { protect } from '../middleware/authMiddleware.js';
// import { admin } from '../middleware/authMiddleware.js';

// @desc    Add a new order
// @route   POST /api/orders
// @access  Public (or Private if users must be logged in to order)
router.post('/', /* protect, */ async (req, res) => {
  const { customer, items, total, userId } = req.body;

  // Basic validation
  if (!customer || !items || items.length === 0 || total === undefined) {
    return res.status(400).json({ message: 'Invalid order data' });
  }

  try {
    const newOrder = new Order({
      customer,
      items,
      total,
      userId,
      // status will default to 'Pas commencé'
    });

    const createdOrder = await newOrder.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get all orders (for admin)
// @route   GET /api/orders
// @access  Private/Admin (implement admin middleware if needed)
router.get('/', /* protect, admin, */ async (req, res) => {
  try {
    const orders = await Order.find({});
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get orders for a specific user
// @route   GET /api/orders/myorders
// @access  Private (implement protect middleware if needed)
router.get('/myorders', /* protect, */ async (req, res) => {
    try {
        // This assumes userId is passed in the query parameters, adjust if using auth middleware
         const userId = req.query.userId; 
         if (!userId) {
             return res.status(400).json({ message: 'User ID is required' });
         }
        const orders = await Order.find({ userId: userId });
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});


// @desc    Update order status (for admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
router.put('/:id/status', /* protect, admin, */ async (req, res) => {
    const orderId = req.params.id;
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({ message: 'Status is required' });
    }

    try {
        const order = await Order.findById(orderId);

        if (order) {
            order.status = status;
            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;