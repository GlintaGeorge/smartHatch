const express = require('express');
const { createProduct, getAllProducts } = require('../Controllers/productController');
const router = express.Router();

router.post('/', createProduct);
router.get('/', getAllProducts);

module.exports = router;
