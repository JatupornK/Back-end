const express = require("express");
const userController = require("../controller/userController");

const router = express.Router();

router.post("/address", userController.createAddress);
router.post("/cart", userController.addProductsToCart);
router.patch("/cart", userController.deleteProductFromCart);
router.patch("/cart/increase", userController.clickIncreaseProductInCart);
router.patch("/cart/decrease", userController.clickDecreaseProductInCart);
router.patch("/address/update", userController.updateSelectedAddress);
router.post("/stripe/create-customer", userController.createStripeCustomer);
router.post("/payment", userController.createNewUserPayment);
router.post("/stripe/payment-intent", userController.createPaymentIntent);
router.get("/stripe/last/payment-method", userController.getLastFourNumber);
router.patch("/payment/update", userController.updateSelectedPayment);
router.get("/payment/last-update", userController.getUpdatedTime);
router.post('/create-order', userController.createOrder)
router.patch('/payment/success', userController.paymentSuccess)

module.exports = router;
