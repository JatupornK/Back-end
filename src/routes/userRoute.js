const express = require("express");
const userController = require("../controller/userController");

const router = express.Router();

router.post("/address", userController.createAddress);
router.post("/cart", userController.addProductsToCart);
router.delete("/cart", userController.deleteProductFromCart);
router.patch('/cart/increase', userController.clickIncreaseProductInCart);
router.patch('/cart/decrease', userController.clickDecreaseProductInCart);
module.exports = router;
