import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js'; // Import user routes
import productRoutes from './routes/productRoutes.js'; // Import product routes
import reservationRoutes from './routes/reservationRoutes.js'; // Import reservation routes
import orderRoutes from './routes/orderRoutes.js'; // Import order routes

const app = express();
const PORT = process.env.PORT || 5001;

const MONGODB_URI = process.env.MONGODB_URI;

app.use(helmet());
app.use(cors());

app.use(express.json()); // Add middleware to parse JSON request bodies
app.use('/api/orders', orderRoutes); // Use order routes
app.use('/api/users', userRoutes); // Use user routes
app.use('/api/products', productRoutes); // Use product routes
app.use('/api/reservations', reservationRoutes); // Use reservation routes

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
.then(() => {
  console.log('MongoDB connected successfully!');
  // Start the server only after successful database connection
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})
.catch(err => {
  console.error('MongoDB connection error:', err);
});

app.get('/', (req, res) => {
  res.send('Backend is running!');
});