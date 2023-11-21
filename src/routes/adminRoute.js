const express = require("express");
// const authenticateWithPassport = require("../middlewares/passportJwt");
const uploadImage = require("../middlewares/uploadImage");
const adminController = require('../controller/adminController')
const router = express.Router();

router.post(
  "/create-product",
  uploadImage.fields([
    { name: "productImageMain", maxCount: 1 },
    { name: "productImageSub", maxCount: 1 },
    { name: "productImagesNormal", maxCount: 4 },
  ]),
  adminController.createProduct
);
router.get('/orders', adminController.fetchOrder)
router.patch('/order/update', adminController.updateOrderStatus);
router.patch('/product/update', adminController.updateProductStatus);

module.exports = router;