const Order = require('../models/orderModel');
const Product = require('../models/productModel')
const createOrder = async (req, res) => {
    try {
      const { userId, products, totalPrice } = req.body;
  console.log('====================================');
  console.log(req.body);
  console.log('====================================');
      // Create a new order
      const newOrder = new Order({
        userId,
        products,
        totalPrice,
        orderDate: Date.now(), // automatically set the current date
      });


  
      // Save the order to the database
      await newOrder.save();
  
      // Update the sold count and reduce total count for each product
      for (const productId of products) {
        const product = await Product.findById(productId);
        
        if (product.total > 0) {
          product.sold += 1;
          product.total -= 1; // Reduce the total count by 1
  
          await product.save();
        } else {
          return res.status(400).json({ message: `Product ${product.name} is out of stock` });
        }
      }
  
      res.status(201).json({ message: 'Order created successfully', newOrder });
    } catch (error) {
      res.status(400).json({ message: 'Error creating order', error });
    }
  };
  

// Controller to get sales statistics
const getSalesData = async (req, res) => {
  try {
    // 1. Total number of orders placed
    const totalOrders = await Order.countDocuments();

    // 2. Total revenue broken down by product category
    const revenueByCategory = await Order.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'products',
          foreignField: '_id',
          as: 'productDetails',
        },
      },
      { $unwind: '$productDetails' }, // Flatten the product details array
      {
        $group: {
          _id: '$productDetails.category', // Group by product category
          totalRevenue: { $sum: '$productDetails.price' }, // Sum up the prices
        },
      },
    ]);

    // 3. Top 3 most popular products (by units sold)
    const topProducts = await Product.find()
      .sort({ sold: -1 }) // Sort by the 'sold' field in descending order
      .limit(3); // Limit to top 3 products

    // 4. Average revenue per user
    const totalRevenueAndUsers = await Order.aggregate([
      {
        $group: {
          _id: '$userId', // Group by user ID
          totalSpent: { $sum: '$totalPrice' }, // Sum up totalPrice for each user
        },
      },
      {
        $group: {
          _id: null, // Group all users together
          totalRevenue: { $sum: '$totalSpent' }, // Calculate total revenue
          userCount: { $sum: 1 }, // Count total number of users
        },
      },
      {
        $project: {
          _id: 0,
          averageRevenuePerUser: { $divide: ['$totalRevenue', '$userCount'] }, // Calculate average revenue per user
        },
      },
    ]);

    const averageRevenuePerUser = totalRevenueAndUsers.length
      ? totalRevenueAndUsers[0].averageRevenuePerUser
      : 0;

    // Send the results back
    res.json({
      totalOrders,
      revenueByCategory,
      topProducts,
      averageRevenuePerUser,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sales statistics', error });
  }
};

module.exports = {
  createOrder,
  getSalesData,
};