const Order = require('../models/orderModel');
const Product = require('../models/productModel')
const createOrder = async (req, res) => {
    try {
      const { userId, products, totalPrice } = req.body;
  
  console.log(req.body);
  
      
      const newOrder = new Order({
        userId,
        products,
        totalPrice,
        orderDate: Date.now(), 
      });


  
      
      await newOrder.save();
  
      
      for (const productId of products) {
        const product = await Product.findById(productId);
        
        if (product.total > 0) {
          product.sold += 1;
          product.total -= 1; 
  
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
  


const getSalesData = async (req, res) => {
  try {
    
    const totalOrders = await Order.countDocuments();

    
    const revenueByCategory = await Order.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'products',
          foreignField: '_id',
          as: 'productDetails',
        },
      },
      { $unwind: '$productDetails' }, 
      {
        $group: {
          _id: '$productDetails.category', 
          totalRevenue: { $sum: '$productDetails.price' },
        },
      },
    ]);

    
    const topProducts = await Product.find()
      .sort({ sold: -1 }) 
      .limit(3); 

    
    const totalRevenueAndUsers = await Order.aggregate([
      {
        $group: {
          _id: '$userId', 
          totalSpent: { $sum: '$totalPrice' }, 
        },
      },
      {
        $group: {
          _id: null, 
          totalRevenue: { $sum: '$totalSpent' }, 
          userCount: { $sum: 1 }, 
        },
      },
      {
        $project: {
          _id: 0,
          averageRevenuePerUser: { $divide: ['$totalRevenue', '$userCount'] }, 
        },
      },
    ]);

    const averageRevenuePerUser = totalRevenueAndUsers.length
      ? totalRevenueAndUsers[0].averageRevenuePerUser
      : 0;

    
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