import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  imageUrls: {
    type: [String],
    default: [],
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  status: {
    type: String,
    required: true,
    default: 'active',
    enum: ['active', 'archived', 'deleted'],
  },
});

// Pre-save hook to generate sequential ID
productSchema.pre('save', async function(next) {
  if (this.isNew) {
    const lastProduct = await this.constructor.findOne({}, {}, { sort: { 'id': -1 } });
    this.id = lastProduct ? lastProduct.id + 1 : 1;
  }
  next();
});

const Product = mongoose.model('Product', productSchema);

export default Product;