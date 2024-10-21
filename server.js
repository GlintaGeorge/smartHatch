const express = require('express');
const morgan = require('morgan');
require('dotenv').config();

const connectDB = require('./config/database');

const userRoutes = require('./Routes/userRoutes');
const productRoutes = require('./Routes/productRoutes');
const orderRoutes = require('./Routes/orderRoute');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

connectDB();


app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
