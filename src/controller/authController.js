const createError = require("../utills/createError");
const { User, Membership, Cart, Size, Product, Image } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../models");
const {
  validateRegister,
  validateLogin,
} = require("../validators/authValidator");
// const { CART_STATUS_UNDONE } = require("../config/constant");
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
    
    const [productsInCart] = await db.sequelize.query(`
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
    AND i.priority_id = 1 And c.status='UNDONE' And c.is_deleted != 1
    GROUP BY
      i.image, c.id
    order by lastUpdateCart DESC
  `);
    if (!productsInCart) {
      createError("Cannot fetch user's cart data", 401);
    }
    res.status(201).json({ productsInCart });
  } catch (err) {
    next(err);
  }
};
// exports.getProductsInCart = async (req, res, next) => {
//   try {
    
//     const productsInCart = await Cart.findAll({
//       attributes: [
//         'productId',
//         'sizeId',
//         [db.sequelize.fn('SUM', db.sequelize.col('amount')), 'amount'],
//         [db.sequelize.fn('SUM', db.sequelize.col('sum_price')), 'sumPrice'],
//       ],
//       where: {
//         userId: 19, // Your user_id value
//         status: CART_STATUS_UNDONE
//       },
//       include: [
//         {
//           model: Product, // Include the Product model
//           attributes: ['name', 'price'], // Specify the attributes you want from the Product model
//           include: [
//             {
//               model: Image, // Include the Image model
//               where: {
//                 priority_id: 1,
//               },
//               attributes: ['image'], // Specify the attributes you want from the Image model
//             },
//           ],
//         },
//         {
//           model: Size,
//           attributes: ['size']
//         }
//       ],
//       group: ['productId', 'sizeId', 'image'],
//       raw: true, // return raw data ไม่ทำเป็น {} ซ้อน ในกรณีที่เป็น model ที่ include มา
//       // nest: true, // ทำให้ return ค่าแบบปกติมี {} ซ้อน ถ้าเป็น true
//       subQuery: false, //ทำให้ไม่ดึงข้อมูลที่ซ้ำซ้อน แต่ประสิทธิภาพจะแย่ในกรณีที่ใช้ดึงข้อมูลที่ซับซ้อนมากๆ
//     });
    
    
//     if (!productsInCart) {
//       createError("Cannot fetch user's cart data", 401);
//     }
//     res.status(201).json({ productsInCart });
//   } catch (err) {
//     next(err);
//   }
// };
// exports.getProductsInCart = async (req, res, next) => {
//   try {
//     // const productsInCartt = await Cart.findAll({
//     //   where: {
//     //     userId: req.user.id,
//     //     productId: 36
//     //   },
//     //   attributes: [[db.sequelize.fn('sum',db.sequelize.col('amount')),'total'],'userId','productId']
//     // })
//     const productsInCart = await Cart.findAll({
//       where: {
//         status: CART_STATUS_UNDONE,
//         userId: req.user.id,
//       },
//       attributes: {
//         exclude: ["userId"],
//       //   // include: [
//       //     [db.sequelize.fn("sum", db.sequelize.col("amount")), "amount"],
//       //     [db.sequelize.fn("sum", db.sequelize.col("sum_price")), "sumPrice"],
//       //     "sizeId",
//       //     "productId",
//       //   // ],
//       },
//       include: [
//         { model: Size, attributes: ["size"] },
//         {
//           model: Product,
//           attributes: ["name", "price"],
//           include: [
//             {
//               model: Image,
//               where: {
//                 priorityId: 1,
//               },
//               attributes: ["image"],
//             },
//           ],
//         },
//       ],
//       order: [['updatedAt','DESC']],
//     });
    
//     if (!productsInCart) {
//       createError("Cannot fetch user's cart data", 401);
//     }
//     res.status(201).json({ productsInCart });
//   } catch (err) {
//     next(err);
//   }
// };





