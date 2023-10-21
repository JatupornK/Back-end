const { Address, Size, Cart } = require("../models");
const createError = require("../utills/createError");

exports.createAddress = async (req, res, next) => {
  try {
    const oldAddress = await Address.findOne({
      where: {
        userId: req.user.id,
        latest: true,
      },
    });
    if (oldAddress) {
      await oldAddress.update({ latest: false });
    }
    const address = await Address.create({ ...req.body, userId: req.user.id });
    if (!address) {
      createError("Address is not valid", 401);
    }
    res.status(201).json({ message: address });
  } catch (err) {
    next(err);
  }
};

exports.addProductsToCart = async (req, res, next) => {
  try {
    // *********************need to validate data if have more time
    // console.log(req.body)
    // console.log(req.body.amount,req.body.productPrice)
    req.body.sumPrice = req.body.amount * req.body.productPrice;
    // console.log(req.body.price)
    let sizeId;
    if (req.body.size) {
      sizeId = await Size.findOne({
        where: {
          size: req.body.size,
        },
        attributes: ["id"],
      });
      req.body.sizeId = +sizeId.id;
    }
    console.log(JSON.stringify(sizeId, null, 2));
    // console.log(req.body.sizeId)
    req.body.userId = req.user.id;
    console.log(req.body);
    // console.log(req.body.userId)
    if (!sizeId) {
      createError("Size is invalid", 401);
    }
    const product = await Cart.create(req.body);
    res.status(201).json({ product });
  } catch (err) {
    next(err);
  }
};
