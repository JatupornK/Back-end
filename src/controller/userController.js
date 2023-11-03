const { CART_STATUS_UNDONE } = require("../config/constant");
const {
  Address,
  Size,
  Cart,
  UserPayment,
  User,
  Payment,
} = require("../models");
const createError = require("../utills/createError");
const db = require("../models");
const { Op } = require("sequelize");
const { ValidateAddress } = require("../validators/createAddressValidator");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.getLastFourNumber = async (req, res, next) => {
  try {
    const stripePaymentId = await UserPayment.findOne({
      where: { userId: req.user.id, lastest: true },
    });
    if (!stripePaymentId) {
      createError("This user do not have any payment added before", 404);
    }
    const [paymentMethod, allPaymentMethods] = await Promise.all([
      stripe.paymentMethods.retrieve(stripePaymentId.stripePaymentId),
      stripe.paymentMethods.list({
        customer: req.user.stripeCustomerId,
        type: "card",
      }),
    ]);
    let destructuring  = allPaymentMethods.data.map(item=> {return{brand:item.card.brand,last4:item.card.last4}})
    if (!paymentMethod) {
      createError("Old payment method error", 401);
    }
    res.status(201).json({
      last4: paymentMethod.card.last4,
      brand: paymentMethod.card.brand,
      allPaymentMethods: destructuring
    });
  } catch (err) {
    next(err);
  }
};

exports.createStripeCustomer = async (req, res, next) => {
  try {
    console.log(req.body);
    const customer = await stripe.customers.create({
      name: req.body.name,
      payment_method: req.body.paymentMethodId,
      invoice_settings: {
        default_payment_method: req.body.paymentMethodId,
      },
    });
    // ask p'v should have or not?
    if (!customer) {
      createError("create customer fail", 401);
    }
    await User.update(
      { stripeCustomerId: customer.id },
      { where: { id: req.user.id } }
    );
    res.status(201).json({ customerId: customer.id });
  } catch (err) {
    next(err);
  }
};
exports.createNewUserPayment = async (req, res, next) => {
  try {
    if (req.body.customerId) {
      const newPaymentMethod = await stripe.paymentMethods.attach(
        req.body.paymentMethodId,
        {
          customer: req.body.customerId,
        }
      );
      console.log(newPaymentMethod);
    }
    const oldPayment = await UserPayment.findOne({
      where: { userId: req.user.id, lastest: true },
    });
    if (oldPayment) {
      await UserPayment.update(
        { lastest: false },
        { where: { id: oldPayment.id } }
      );
    }
    const payment = await Payment.findOne({ where: { payment: "ONLINE" } });
    console.log(payment);
    const userPayment = await UserPayment.create({
      paymentId: payment.id,
      userId: req.user.id,
      stripePaymentId: req.body.paymentMethodId,
    });
    if (!userPayment) {
      createError("create user payment method fail", 401);
    }
    console.log(userPayment);
    res.status(201).json({ message: "create user payment successfully" });
  } catch (err) {
    next(err);
  }
};
exports.createPaymentIntent = async (req, res, next) => {
  try {
    console.log(req.body);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: req.body.amount,
      currency: req.body.currency,
      payment_method: req.body.paymentMethodId,
      customer: req.body.customerId,
    });
    if (!paymentIntent) {
      createError("create payment intent fail", 401);
    }
    console.log(JSON.stringify(paymentIntent));
    res.status(201).json({ paymentIntent: paymentIntent.client_secret });
  } catch (err) {
    next(err);
  }
};
exports.createAddress = async (req, res, next) => {
  try {
    ValidateAddress(req.body);
    const address = await Address.create({ ...req.body, userId: req.user.id });
    if (!address) {
      createError("Address is not valid", 401);
    }
    // console.log(address)
    // console.log(value)
    // edit old address lastest: true to new one
    const isOldAddress = await Address.findOne({
      where: {
        userId: req.user.id,
        lastest: true,
        [Op.not]: { id: address.id },
      },
    });
    console.log(isOldAddress);
    if (isOldAddress) {
      await Address.update(
        { lastest: false },
        { where: { id: isOldAddress.id, [Op.not]: { id: address.id } } }
      );
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
      await Cart.update(
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
      await Cart.create(req.body);
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
    console.log(req.body);
    const result = await Cart.update(
      { amount: req.body.amount, sumPrice: req.body.sumPrice },
      {
        where: {
          id: req.body.cartId,
        },
      }
    );
    if (!result) {
      createError("Increase quantity fail", 401);
    }
    res.status(201).json({ result });
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
    if (!result) {
      createError("Decrease quantity fail", 401);
    }
    res.status(201).json({ result });
  } catch (err) {
    next(err);
  }
};

exports.updateSelectedAddress = async (req, res, next) => {
  try {
    const oldLastestAddress = await Address.findOne({
      where: { lastest: true, userId: req.user.id },
    });
    if (oldLastestAddress.id === req.body.id) {
      return res.status(202).json("Update same value");
    }
    const [updateOld, result] = await Promise.all([
      await Address.update({ lastest: true }, { where: { id: req.body.id } }),
      await Address.update(
        { lastest: false },
        { where: { id: oldLastestAddress.id } }
      ),
    ]);
    if (result.length < 1 || updateOld.length < 1) {
      createError("Update fail", 401);
    }
    res.status(201).json({ result });
  } catch (err) {
    next(err);
  }
};
