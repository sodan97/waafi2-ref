import express from 'express';
import mongoose from 'mongoose';

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/belleza_db';

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