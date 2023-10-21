const express = require('express');
const userController = require('../controller/userController');

const router = express.Router();

router.post('/address', userController.createAddress);
router.post('/cart', userController.addProductsToCart);
module.exports = router;