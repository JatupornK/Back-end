const Joi = require("joi");
const validate = require("./validate");

const registerSchema = Joi.object({
  // username: Joi.string().required().trim().alphanum().messages({
  //   "string.empty": "username is required",
  //   "any.required": "username is required", // in case don't have key username sent in req.body
  //   "string.base": "username must be a string type",
  //   "string.alphanum": "username must contain number or alphabet",
  // }),
  firstName: Joi.string().required().trim().alphanum().messages({
    "string.empty": "firstname is required",
    "any.required": "firstname is required", 
    "string.base": "firstname must be a string type",
    "string.alphanum": "firstname must contain number or alphabet",
  }),
  lastName: Joi.string().required().trim().alphanum().messages({
    "string.empty": "lastname is required",
    "any.required": "lastname is required", 
    "string.base": "lastname must be a string type",
    "string.alphanum": "lastname must contain number or alphabet",
  }),
  password: Joi.string().alphanum().min(6).trim().required().messages({
    "string.empty": "password is required",
    "string.min": "password length must have at least 6 characters",
    "string.alphanum": "password must contain number or alphabet",
    "any.required": "password is required",
    "string.base": "password must be a string type",
  }),
  email: Joi.string().email({ tlds: false }).messages({
    "string.email": "email should be like this pattern ex:a@gmail.com",
    "string.empty": "email cann't be an empty string",
  }),
  mobile: Joi.string()
    .required()
    .pattern(/^[0-9]{10}$/)
    .messages({
      "string.pattern.base": "please put a mobile number in this blank",
      "any.required": "mobile is required",
      "string.empty": "mobile is required",
    }),
});

const loginSchema = Joi.object({
  email: Joi.string().required().messages({
    "string.empty": "email is required",
    "any.required": "email is required", 
  }),
  password: Joi.string().required().messages({
    "string.empty": "password is required",
    "any.required": "password is required",
  }),
});

exports.validateRegister = validate(registerSchema);

exports.validateLogin = validate(loginSchema);
