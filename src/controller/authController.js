const createError = require("../utills/createError");
const { User, Membership } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  validateRegister,
  validateLogin,
} = require("../validators/authValidator");
exports.login = async (req, res, next) => {
  try {
    const value = validateLogin(req.body);
    const result = await User.findOne({
      where: {
        username: value.username,
      },
    });
    if (!result) {
      createError("username or password is incorrect", 401);
    }
    const isCorrect = await bcrypt.compare(value.password, result.password);
    if (!isCorrect) {
      createError("username or password is incorrect", 401);
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
        username: value.username,
      },
    });
    if (user) {
      createError("This username is already use", 401);
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
      createError("membership fail to create", 401);
    }
    res.status(201).json({
      message: "register success login to continue.",
      membership: membership.id,
    });
  } catch (err) {
    next(err);
  }
};

exports.getUserData = async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: {
        id: req.user.id,
      },
      attributes: {
        exclude: ["password"],
      },
      include: {
        model: Membership,
        attributes: { exclude: ["userId"] },
      },
    });
    if (!user) {
      createError("User not found", 401);
    }
    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
};
