const express = require("express");
const userController = require("../controller/userController");

const router = express.Router();

router.post("/address", userController.createAddress);
router.post("/cart", userController.addProductsToCart);
router.delete("/cart", userController.deleteProductFromCart);
router.patch("/cart/increase", userController.clickIncreaseProductInCart);
router.patch("/cart/decrease", userController.clickDecreaseProductInCart);
router.patch("/address/update", userController.updateSelectedAddress);
router.post("/stripe/create-customer", userController.createStripeCustomer);
router.post('/payment', userController.createNewUserPayment);
router.post('/stripe/payment-intent', userController.createPaymentIntent);
router.get('/stripe/last/payment-method', userController.getLastFourNumber);

module.exports = router;
