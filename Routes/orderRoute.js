const express = require('express');
const { createOrder, getSalesData } = require('../Controllers/orderController');
const router = express.Router();

router.post('/', createOrder);
router.get('/sales', getSalesData);

module.exports = router;
