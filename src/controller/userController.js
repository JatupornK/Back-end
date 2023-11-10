const {
  CART_STATUS_UNDONE,
  STATUS_WAITING,
  STATUS_SUCCESS,
  CART_STATUS_DONE,
} = require("../config/constant");
const {
  Address,
  Size,
  Cart,
  UserPayment,
  User,
  Payment,
  Order,
  OrderItem,
  Membership,
} = require("../models");
const createError = require("../utills/createError");
const db = require("../models");
const { Op } = require("sequelize");
const { ValidateAddress } = require("../validators/createAddressValidator");
const { currentTime, nextOneYear } = require("../utills/getDate");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.paymentSuccess = async (req, res, next) => {
  try {
    // console.log(req.body);
    const [updateOrder, updateCart, sumTotalBought] = await Promise.all([
      Order.update(
        { paymentStatus: STATUS_SUCCESS },
        { where: { userId: req.user.id, id: req.body.orderId } }
      ),
      Cart.update(
        { status: CART_STATUS_DONE },
        {
          where: {
            isDeleted: false,
            status: CART_STATUS_UNDONE,
            userId: req.user.id,
          },
        }
      ),
      User.update(
        { totalBought: req.body.totalBought + req.body.sumTotalPrice },
        { where: { id: req.user.id } }
      ),
    ]);
    if (!updateOrder || !updateCart || !sumTotalBought) {
      createError("update fail", 401);
    }
    if (req.body.totalBought < 10000) {
      if (req.body.totalBought + req.body.sumTotalPrice > 10000) {
        const isCreateMember = await Membership.update(
          { memberTypeId: 2, startedAt: currentTime, expiredIn: nextOneYear },
          { where: { userId: req.user.id } }
        );
        if (isCreateMember) {
          const membership = await Membership.findOne({
            where: { userId: req.user.id },
            attributes: ["id"],
          });
          return res.status(201).json({Membership:membership});
        }
      }
    }
    res.status(201).json({ message: "success" });
  } catch (err) {
    next(err);
  }
};

exports.createOrder = async (req, res, next) => {
  try {
    console.log(req.body)
    const [paymentId, cartId] = await Promise.all([
      UserPayment.findOne({
        where: { userId: req.user.id, stripePaymentId: req.body.paymentId },
        attributes: ["id"],
      }),
      Cart.findAll({
        where: {
          userId: req.user.id,
          status: CART_STATUS_UNDONE,
          isDeleted: false,
        },
        attributes: ["id"],
      }),
    ]);
    if (!paymentId || !cartId) {
      createError("Create order fail", 401);
    }
    // console.log(cartId,paymentId);
    const order = await Order.create({
      paymentStatus: STATUS_WAITING,
      orderStatus: STATUS_WAITING,
      userPaymentId: paymentId.id,
      userId: req.user.id,
      addressId: req.body.addressId,
    });
    if (!order) {
      createError("Create order fail", 401);
    }
    const orderItems = cartId.map((item) => {
      return { orderId: order.id, cartId: item.id };
    });
    const result = await OrderItem.bulkCreate(orderItems);
    if (!result) {
      createError("Create order item fail", 401);
    }
    res.status(201).json({ orderId: order.id });
  } catch (err) {
    next(err);
  }
};

exports.updateSelectedPayment = async (req, res, next) => {
  try {
    console.log(req.body);
    const [oldPayment, newPayment] = await Promise.all([
      UserPayment.findOne({
        where: { userId: req.user.id, lastest: true },
      }),
      UserPayment.findOne({
        where: { userId: req.user.id, stripePaymentId: req.body.id },
        // where: { userId: req.user.id, id: req.body.id },
      }),
    ]);
    if (!oldPayment) {
      createError("Update payment fail", 401);
    }
    console.log(oldPayment)
    if(oldPayment.stripePaymentId===req.body.id) {
      return res.status(202).json({message:'update same payment'})
    }
    const [result1, result2] = await Promise.all([
      UserPayment.update({ lastest: true }, { where: { id: newPayment.id } }),
      UserPayment.update({ lastest: false }, { where: { id: oldPayment.id } }),
    ]);
    res.status(201).json({ message: result1 });
  } catch (err) {
    next(err);
  }
};
exports.getUpdatedTime = async (req, res, next) => {
  try {
    const time = await UserPayment.findAll({
      where: { userId: req.user.id },
      attributes: ["updatedAt", "stripePaymentId", "id", 'lastest'],
      order: [["updatedAt", "DESC"]],
    });
    if (!time) {
      createError("get update payment time fail", 401);
    }
    res.status(201).json({ time });
  } catch (err) {
    next(err);
  }
};
exports.getLastFourNumber = async (req, res, next) => {
  try {
    const stripePaymentId = await UserPayment.findOne({
      where: { userId: req.user.id, lastest: true },
    });
    console.log(stripePaymentId)
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
    // console.log(allPaymentMethods);
    let destructuring = allPaymentMethods.data.map((item) => {
      return {
        brand: item.card.brand,
        last4: item.card.last4,
        // createdAt: item.created,
        id: item.id,
      };
    });
    if (!paymentMethod) {
      createError("Old payment method error", 401);
    }
    res.status(201).json({
      lastestPayment: {
        lastest: true,
        last4: paymentMethod.card.last4,
        brand: paymentMethod.card.brand,
        id: paymentMethod.id,
        // userPaymentId: stripePaymentId.id
      },
      allPaymentMethods: destructuring,
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
    if (!req.body.customerId) {
      createError("Unauthorized can not create user payment", 401);
    }
    const newPaymentMethod = await stripe.paymentMethods.attach(
      req.body.paymentMethodId,
      {
        customer: req.body.customerId,
      }
    );
    console.log(newPaymentMethod);
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
    res.status(201).json({ paymentIntentId: paymentIntent.client_secret });
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
        isDeleted: 0,
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
    console.log(req.body);
    const result = await Cart.update(
      { isDeleted: true },
      {
        where: {
          id: req.body.cartId,
        },
      }
    );
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
      Address.update({ lastest: true }, { where: { id: req.body.id } }),
      Address.update(
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
