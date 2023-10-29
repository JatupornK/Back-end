const { CART_STATUS_UNDONE } = require("../config/constant");
const { Address, Size, Cart, Image, Product } = require("../models");
const createError = require("../utills/createError");
const db = require("../models");
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
    let sizeId;
    let cart;
    if (req.body.size) {
      sizeId = await Size.findOne({
        where: {
          size: req.body.size,
        },
        attributes: ["id"],
      });
      req.body.sizeId = +sizeId.id;
    }
    if (!sizeId) {
      createError("Size is invalid", 401);
    }
    const isInCart = await Cart.findOne({
      where: {
        userId: req.user.id,
        sizeId: req.body.sizeId,
        productId: req.body.productId,
        status: CART_STATUS_UNDONE,
      },
    });
    if (isInCart) {
      cart = await Cart.update(
        {
          amount: isInCart.amount + +req.body.amount,
          sumPrice: isInCart.sumPrice + req.body.amount * req.body.productPrice,
        },
        { where: { id: isInCart.id } }
      );
    } else {
      req.body.sumPrice = req.body.amount * req.body.productPrice;
      // console.log(req.body.price)
      // console.log(JSON.stringify(sizeId, null, 2));
      // console.log(req.body.sizeId)
      req.body.userId = req.user.id;
      // console.log(req.body);
      // console.log(req.body.userId)
      cart = await Cart.create(req.body);
    }
    // console.log(cart)
    const [addedProduct] = await db.sequelize.query(`
    SELECT
      c.id ,
      c.product_id,
      SUM(c.amount) AS amount,
      SUM(c.sum_price) AS sumPrice,
      p.name AS name,
      p.price AS price,
      i.image AS image,
      s.size,
      max(c.updated_At) As lastUpdateCart
    FROM
      carts AS c
    LEFT OUTER JOIN
      products AS p ON p.id = c.product_id
    LEFT OUTER JOIN
      images AS i ON i.product_id = p.id
    LEFT OUTER JOIN
      sizes AS s ON s.id = c.size_id
    WHERE
      c.user_id = ${req.user.id}
    AND i.priority_id = 1 And c.status='UNDONE'
    GROUP BY
      i.image, c.id
    order by lastUpdateCart DESC
  `);
    res.status(201).json({ addedProduct });
  } catch (err) {
    next(err);
  }
};

exports.deleteProductFromCart = async (req, res, next) => {
  try {
    const result = await Cart.destroy({
      where: {
        id: req.body.cartId,
      },
    });
    if (!result) {
      createError("Delete item from cart fail", 401);
    }
    res.status(201).json({ message: "delete item from cart success" });
  } catch (err) {
    next(err);
  }
};

exports.clickIncreaseProductInCart = async (req, res, next) => {
  try {
    console.log(req.body)
    const result = await Cart.update(
      { amount: req.body.amount, sumPrice: req.body.sumPrice },
      {
        where: {
          id: req.body.cartId,
        },
      }
    );
    if(!result) {
      createError('Increase quantity fail', 401)
    }
    res.status(201).json({result})
  } catch (err) {
    next(err);
  }
};

exports.clickDecreaseProductInCart = async (req, res, next) => {
  try {
    const result = await Cart.update(
      { amount: req.body.amount, sumPrice: req.body.sumPrice },
      {
        where: {
          id: req.body.cartId,
        },
      }
    );
    if(!result) {
      createError('Decrease quantity fail', 401)
    }
    res.status(201).json({result})
  } catch (err) {
    next(err);
  }
};
