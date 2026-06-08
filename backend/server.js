const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({ origin: '*' })); // Explictly allow all traffic for now
app.use(express.json()); 

// MongoDB Connection - CLOUD READY FIX
// It looks for a cloud database first. If it can't find one, it uses your local database!
const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/inventory-system";

mongoose.connect(mongoURI)
    .then(() => console.log("MongoDB connected successfully"))
    .catch((err) => console.log(err));

// Import Routes
const productRoutes = require('./routes/productRoutes');
const salesRoutes = require('./routes/salesRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const customerRoutes = require('./routes/customerRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const authRoutes = require('./routes/authRoutes');

// Use Routes
app.use('/api/products', productRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/auth', authRoutes);

// Base Route
app.get('/', (req, res) => {
    res.send("SmartShop Backend is Live!");
});

// Start Server - CLOUD READY FIX
// Render will assign a random port via process.env.PORT
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});