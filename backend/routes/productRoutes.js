import express from 'express';
import Product from '../models/Product.js';
import { body, validationResult, param } from 'express-validator';
import { protect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET all active products
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find({ status: 'active' });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET a single product by ID
router.get('/products/:id', async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const product = await Product.findOne({ id: req.params.id });
    if (product == null) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST add a new product
router.post('/products', protect, admin, [
  body('name').isString().notEmpty().withMessage('Name is required and must be a string'),
  body('description').isString().notEmpty().withMessage('Description is required and must be a string'),
  body('price').isFloat({ gt: 0 }).withMessage('Price is required and must be a positive number'),
  body('imageUrls').isArray().withMessage('Image URLs must be an array'),
  body('imageUrls.*').isURL().withMessage('Each image URL must be a valid URL'), // Added validation for each URL in the array
  body('category').isString().notEmpty().withMessage('Category is required and must be a string'),
  body('stock').isInt({ gt: -1 }).withMessage('Stock is required and must be a non-negative integer'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const lastProduct = await Product.findOne().sort({ id: -1 }).limit(1);
  const newId = lastProduct ? lastProduct.id + 1 : 1;

  const product = new Product({
    id: newId,
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    imageUrls: req.body.imageUrls,
    category: req.body.category,
    stock: req.body.stock,
    status: req.body.status || 'active',
  });

  try {
    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update an existing product
router.put('/products/:id', protect, admin, [
  param('id').isInt({ gt: 0 }).withMessage('Product ID must be a positive integer'),
  body('name').optional().isString().notEmpty().withMessage('Name must be a non-empty string'),
  body('description').optional().isString().notEmpty().withMessage('Description must be a non-empty string'),
  body('price').optional().isFloat({ gt: 0 }).withMessage('Price must be a positive number'),
  body('imageUrls').optional().isArray().withMessage('Image URLs must be an array'),
  body('imageUrls.*').optional().isURL().withMessage('Each image URL must be a valid URL'),
  body('category').optional().isString().notEmpty().withMessage('Category must be a non-empty string'),
  body('stock').optional().isInt({ gt: -1 }).withMessage('Stock must be a non-negative integer'),
], protect, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const product = await Product.findOne({ id: req.params.id });
    if (product == null) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (req.body.name != null) product.name = req.body.name;
    if (req.body.description != null) product.description = req.body.description;
    if (req.body.price != null) product.price = req.body.price;
    if (req.body.imageUrls != null) product.imageUrls = req.body.imageUrls;
    if (req.body.category != null) product.category = req.body.category;
    if (req.body.stock != null) product.stock = req.body.stock;
    // Note: Status updates are handled by dedicated routes below

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE soft delete a product (set status to 'deleted')
router.delete('/products/:id', protect, admin, [
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { return res.status(400).json({ errors: errors.array() }); }
    
    try {
        const product = await Product.findOne({ id: req.params.id });
        if (product == null) {
          return res.status(404).json({ message: 'Product not found' });
        }

        product.status = 'deleted';
        await product.save();
        res.json({ message: 'Product soft deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT restore a deleted product (set status to 'active')
router.put('/products/:id/restore', protect, admin, [
 param('id').isInt({ gt: 0 }).withMessage('Product ID must be a positive integer'),
], async (req, res) => {
    try {
        const product = await Product.findOne({ id: req.params.id });
        if (product == null) {
          return res.status(404).json({ message: 'Product not found' });
        }

        product.status = 'active';
        await product.save();
        res.json({ message: 'Product restored' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE permanently delete a product
router.delete('/products/:id/permanent', protect, admin, [
 param('id').isInt({ gt: 0 }).withMessage('Product ID must be a positive integer'),
], async (req, res) => {
    try {
        const result = await Product.deleteOne({ id: req.params.id });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product permanently deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


export default router;