const express = require("express");
const productController = require("../controller/productController");
const uploadImage = require("../middlewares/uploadImage");

const router = express.Router();

router.post(
  "/admin",
  uploadImage.fields([
    { name: "productImagesMain", maxCount: 1 },
    { name: "productImageSub", maxCount: 1 },
    { name: "productImageNormal", maxCount: 4 },
  ]),
  productController.createProduct
);
router.get('/', productController.getAllProduct)
router.get('/range', productController.getMaxMin)
router.get('/size', productController.getAllSize)
module.exports = router;
