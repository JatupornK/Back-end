const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const passport = require("passport");
const { User } = require("../models");
const createError = require("../utills/createError");
const option = {
  secretOrKey: process.env.JWT_SECRET_KEY || "SECRET_KEY",
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const extractFunction = async (payload, done) => {
  try {
    const user = await User.findOne({
      where: {
        id: payload.id,
      },
    });
    if (!user) {
      done(createError("you are unauthorized", 401), false);
    }
    done(null, user);
  } catch (err) {
    done(err, false);
  }
};

passport.use(new JwtStrategy(option, extractFunction));
