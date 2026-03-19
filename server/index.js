const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const authRoutes = require('./routes/auth');
const documentRoutes = require('./routes/documents');
const analyzeRoutes = require('./routes/analyze');

app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/analyze', analyzeRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Medical Translator API is running' });
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error('MongoDB connection error:', err.message));