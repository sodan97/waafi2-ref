import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  customer: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    address: { type: String },
    phone: { type: String, required: true },
  },
  items: [{
    id: { type: Number, required: true }, // Assuming product ID
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    // Add other product details if needed
  }],
  total: { type: Number, required: true },
  userId: { type: String }, // Link to the user who placed the order (if authenticated)
  date: { type: Date, default: Date.now }, // Date of the order
  status: { type: String, default: 'Pas commencé' }, // Order status
  // Add any other relevant fields (e.g., payment status, delivery info)
});

const Order = mongoose.model('Order', orderSchema);

export default Order;