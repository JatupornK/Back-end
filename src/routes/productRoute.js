const express = require("express");
const productController = require("../controller/productController");
// const uploadImage = require("../middlewares/uploadImage");
const router = express.Router();

router.get('/', productController.getAllProduct)
router.get('/range', productController.getMaxMin)
router.get('/size', productController.getAllSize)
router.get('/type', productController.getAllType)

module.exports = router;
