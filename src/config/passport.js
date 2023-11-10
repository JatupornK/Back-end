const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const passport = require("passport");
const { User, Address,UserPayment,Membership } = require("../models");
const createError = require("../utills/createError");
const { currentTime } = require("../utills/getDate");
const option = {
  secretOrKey: process.env.JWT_SECRET_KEY || "SECRET_KEY",
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};
const { Op } = require("sequelize");
const extractFunction = async (payload, done) => {
  try {
    console.log(payload)
    const user = await User.findOne({
      where: {
        id: payload.id,
      },
      attributes: {
        exclude: "password",
      },
      include: [
        {
          model: Address,
          attributes: {
            exclude: ["userId"],
          },
          required: false, //Set for if don't have any data in the table (1st test) won't be error,
          //ถ้าไม่ใส่ required false ถ้าตารางนั้นไม่มีข้อมูลใดๆ เลย จะ error แต่ถ้าตารางมีข้อมูลอยู่แต่เป็นของ user คนอื่นก็จะไ่ม่ error
          // ใส่ ไว้ ดีกว่า กันไว้
        },
        {
          model: UserPayment,
          where: {
            lastest: true,
          },
          attributes: ["stripePaymentId"],
          required: false
        },
        {
          model: Membership,
          where:{
            expiredIn:{
              [Op.gt]: currentTime
            }
          },
          attributes: ['id'],
          required: false
        }
      ],
    });
    // console.log(user)
    if (!user) {
      done(createError("you are unauthorized", 401), false);
    }
    done(null, user);
  } catch (err) {
    done(err, false);
  }
};

passport.use(new JwtStrategy(option, extractFunction));
