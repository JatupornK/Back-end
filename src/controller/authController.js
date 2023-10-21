const createError = require("../utills/createError");
const { User, Membership, Cart, Size, Product } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  validateRegister,
  validateLogin,
} = require("../validators/authValidator");
const { CART_STATUS_UNDONE } = require("../config/constant");
exports.login = async (req, res, next) => {
  try {
    const value = validateLogin(req.body);
    const result = await User.findOne({
      where: {
        email: value.email,
      },
    });
    if (!result) {
      createError("email or password is invalid", 401);
    }
    const isCorrect = await bcrypt.compare(value.password, result.password);
    if (!isCorrect) {
      createError("email or password is invalid", 401);
    }
    const payload = {
      id: result.id,
      username: result.username,
      mobile: result.mobile,
    };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
      expiresIn: process.env.JWT_EXPIRED_IN,
    });
    res.status(201).json({ accessToken });
  } catch (err) {
    next(err);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const value = validateRegister(req.body);
    const user = await User.findOne({
      where: {
        email: value.email,
      },
    });
    if (user) {
      createError("This email is already use.", 401);
    }
    const hashedPassword = await bcrypt.hash(value.password, 10);
    value.password = hashedPassword;
    const result = await User.create(value);
    if (!result) {
      createError("fail", 401);
    }
    const membership = await Membership.create({ userId: result.id });
    if (!membership) {
      User.destroy({ where: { id: result.id } });
      createError("membership fail to create.", 401);
    }
    res.status(201).json({
      message: "register success, please login to continue.",
      // membership: membership.id,
    });
  } catch (err) {
    next(err);
  }
};

exports.getUserData = async (req, res, next) => {
  try {
    res.status(201).json({ user: req.user });
  } catch (err) {
    next(err);
  }
};

exports.getProductsInCart = async (req, res, next) => {
  try {
    const productsInCart = await Cart.findAll({
      where: {
        status: CART_STATUS_UNDONE,
        userId: req.user.id,
      },
      attributes: { exclude: ["status", "userId"] },
      include: [
        { model: Size, attributes: ["size"] },
        { model: Product, attributes: ["name", "price"] },
      ],
    });
    if (!productsInCart) {
      createError("Cannot fetch user's cart data", 401);
    }
    res.status(201).json({ productsInCart });
  } catch (err) {
    next(err);
  }
};
