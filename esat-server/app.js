// app.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connected');

  // Start server
  app.listen(3000, () => {
    console.log('🚀 Server running at http://localhost:3000');
  });
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err);
});

// Routes
const questionRoutes = require('./routes/questions');
const recordRoutes = require('./routes/records');

app.use('/api/questions', questionRoutes);
app.use('/api/records', recordRoutes);
