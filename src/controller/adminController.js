const createError = require("../utills/createError");
const { ValidateProduct } = require("../validators/productValidator");
const {
  Product,
  Type,
  Image,
  Size,
  ProductSize,
  OrderItem,
  Order,
  Address,
  Cart,
  UserPayment,
  Payment,
  User,
  Membership,
  MemberType,
} = require("../models");
const { Op } = require("sequelize");
const cloudinary = require("../utills/cloudinary");
const fs = require("fs");
const { currentTime } = require("../utills/getDate");

exports.updateOrderStatus = async (req, res, next) => {
  try {
    if (!req.user.admin || req.user.admin.role !== "admin") {
      createError("unauthorized", 401);
    }
    const newStatus = await Order.update(
      { orderStatus: req.body.status },
      { where: { id: req.body.id } }
    );
    if(!newStatus) {
      createError('Update order status fail', 401);
    }
    res.status(201).json('Update order status success')
  } catch (err) {
    next(err);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    if (!req.user.admin || req.user.admin.role !== "admin") {
      createError("unauthorized", 401);
    }
    req.body.size = req.body.size.split(",");
    console.log(req.body.size)
    const value = ValidateProduct(req.body);
    let image = [];
    let imageMain = {};
    let imageSub = {};
    const [type, size] = await Promise.all([
      Type.findOne({
        where: {
          type: req.body.type,
        },
      }),
      Size.findAll({
        where: {
          size: req.body.size,
        },
      }),
    ]);
    if (!type) {
      createError("Type of product is invalid", 401);
    } else if (size.length < 1) {
      createError("Size number is invalid", 401);
    }
    value.typeId = type.id;
    const product = await Product.create(value);
    if (!req.files.productImageMain) {
      createError("Please attach main image", 401);
    }
    if (req.files.productImageMain) {
      const value2 = await cloudinary.upload(
        req.files.productImageMain[0].path
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
    if (imageMain) {
      image.push(imageMain);
      if (imageSub) image.push(imageSub);
    }
    let sizes = [];
    for (let item of size) {
      sizes.push({
        sizeId: item.id,
        productId: product.id,
      });
    }
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
    if (req.files.productImageMain) {
      fs.unlinkSync(req.files.productImageMain[0].path);
    }
    if (req.files.productImageSub) {
      fs.unlinkSync(req.files.productImageSub[0].path);
    }
  }
};

exports.fetchOrder = async (req, res, next) => {
  try {
    if (!req.user.admin || req.user.admin.role !== "admin") {
      createError("unauthorized", 401);
    }
    const orders = await OrderItem.findAll({
      include: [
        {
          model: Order,
          attributes: {
            exclude: ["userId"],
          },
          include: [
            {
              model: Address,
              attributes: {
                exclude: [
                  "lastest",
                  "userId",
                  "createdAt",
                  "updatedAt",
                  "isDeleted",
                ],
              },
            },
            {
              model: UserPayment,

              attributes: ["paymentId"],
              include: [{ model: Payment }],
            },
            {
              model: User,
              attributes: ["id",'firstName','lastName'],
              include: [
                {
                  model: Membership,
                  where: {
                    [Op.or]: [
                      {
                        [Op.and]: [
                          { expiredIn: { [Op.gt]: currentTime } },
                          { memberTypeId: 2 },
                        ],
                      },
                      { memberTypeId: 1 },
                    ],
                  },
                  attributes: ["memberTypeId"],
                  include: [{ model: MemberType }],
                },
              ],
            },
          ],
        },
        {
          model: Cart,
          attributes: {
            exclude: [
              "status",
              "createdAt",
              "updatedAt",
              "isDeleted",
              "userId",
            ],
          },
          include: [
            { model: Size },
            {
              model: Product,
              attributes: {
                exclude: [
                  "description",
                  "bestSeller",
                  "createdAt",
                  "updatedAt",
                  "collectionId",
                  "typeId",
                ],
              },
            },
          ],
        },
      ],
      // order: [
      //   [Order, 'createdAt', 'DESC']
      // ]
    });
    res.status(201).json({ orders });
  } catch (err) {
    next(err);
  }
};
