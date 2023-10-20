const createError = require("../utills/createError");
const { ValidateProduct } = require("../validators/productValidator");
const { Product, Type, Image, Size, ProductSize } = require("../models");
const cloudinary = require("../utills/cloudinary");
const fs = require("fs");
const db = require("../models/index");
exports.createProduct = async (req, res, next) => {
  try {
    req.body.size = req.body.size.split(' ')
    // console.log(req.body.size)
    // console.log(req.body)
    // req.body.size = [14,15,16] // how to convert '[14,15,16]'ในpostman เป็น array
    const value = ValidateProduct(req.body);
    let image = [];
    let imageMain = {};
    let imageSub = {};
    const type = await Type.findOne({
      where: {
        type: req.body.type,
      },
    });
    const size = await Size.findAll({
      where: {
        size: req.body.size,
      },
    });
    if (!type) {
      createError("Type of product is wrong", 401);
    }
    value.typeId = type.id;
    const product = await Product.create(value);
    if (!req.files.productImagesMain) {
      createError("Please attach main image", 401);
    }
    if (req.files.productImagesMain) {
      const value2 = await cloudinary.upload(
        req.files.productImagesMain[0].path
      );
      imageMain.image = value2;
      imageMain.priorityId = 1;
      imageMain.productId = product.id;
    }
    if (req.files.productImageSub) {
      const value2 = await cloudinary.upload(req.files.productImageSub[0].path);
      imageSub.image = value2;
      imageSub.priorityId = 2;
      imageSub.productId = product.id;
    }
    if(imageMain) {
      image.push(imageMain);
      if(imageSub) image.push(imageSub)
    }
    let sizes = [];
    for (let item of size) {
      sizes.push({
        sizeId: JSON.stringify(item.id),
        productId: JSON.stringify(product.id),
      });
    }
    console.log(sizes)
    for (let i = 0; i < sizes.length; i++) {
      const productSize = await ProductSize.create(sizes[i]);
      if (!productSize) {
        createError("Cannot create product size", 404);
      }
    }
    const result = await Image.bulkCreate(image);
    res.status(201).json({ result });
  } catch (err) {
    next(err);
  } finally {
    if (req.files.productImagesMain) {
      fs.unlinkSync(req.files.productImagesMain[0].path);
    }
  }
};

exports.getAllProduct = async (req, res, next) => {
  try {
    const product = await Product.findAll({
      include: [
        {
          model: Image,
          attributes: ["image", "priorityId"],
        },
        {
          model: Type,
          attributes: ["type"],
        },
        {
          model: ProductSize,
          attributes: ["sizeId"],
          include: {
            model: Size,
            attributes: ["size"],
          },
        },
      ],
      order: [["createdAt", "Desc"]],
    });
    // console.log(product)
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

exports.getMaxMin = async (req, res, next) => {
  try {
    const [max, min] = await Promise.all([
      Product.findOne({
        order: [["price", "DESC"]],
        attributes: ["price"],
      }),
      Product.findOne({
        order: [["price", "Asc"]],
        attributes: ["price"],
      }),
    ]);
    if (!max || !min) {
      createError("Can't find max or min price", 404);
    }
    res.status(201).json({ max: max.price, min: min.price });
  } catch (err) {
    next(err);
  }
};

exports.getAllSize = async (req, res, next) => {
  try {
    const size = await Size.findAll({
      order: [["id", "Asc"]],
      attributes: ["size"],
    });
    if (!size) {
      createError("Cann't find product size", 404);
    }

    res.status(201).json({ size });
  } catch (err) {
    next(err);
  }
};
