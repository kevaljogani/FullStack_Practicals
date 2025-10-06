const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');

const MONGO_URI = 'mongodb+srv://kevaljogani150:TXHkCoo2qyPaRaMW@cluster0.lsybipu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const JWT_SECRET = 'mysecretkey';
const PORT = 5000;

// Make JWT_SECRET available globally
global.JWT_SECRET = JWT_SECRET;

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})
.catch((err) => console.error('MongoDB connection error:', err));
