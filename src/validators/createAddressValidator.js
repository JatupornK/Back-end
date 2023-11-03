const Joi = require("joi");
const validate = require("./validate");

const addressSchema = Joi.object({
  addressTitle: Joi.string().trim().required().messages({
    "any.required": "Please input the title of the address",
    "string.base": "This input must be a string type",
    "string.empty": "Address title can't be only blank space",
  }),
  firstName: Joi.string().trim().required().messages({
    "any.required": "Please input the first name",
    "string.base": "This input must be a string type",
    "string.empty": "First name can't be only blank space",
  }),
  lastName: Joi.string().trim().required().messages({
    "any.required": "Please input the last name",
    "string.base": "This input must be a string type",
    "string.empty": "Last name can't be only blank space",
  }), // key of message depend on type of error
  address: Joi.string().trim().required().messages({
    "any.required": "Please input the address",
    "string.base": "This input must be a string type",
    "string.empty": "Address can't be only blank space",
  }),
  postCode: Joi.string()
    .pattern(/^[0-9]{5}$/)
    .trim()
    .required()
    .messages({
      "any.required": "Please input the first name",
      "string.base": "This input must be a string type",
      "string.empty": "First name can't be only blank space",
      "string.pattern.base": "The pattern of posstcode is invalid",
    }),
  phoneNumber: Joi.string()
    .trim()
    .required()
    .pattern(/^[0-9]{10}$/)
    .messages({
      "string.empty": "phonenumber is required",
      "string.pattern.base": "The pattern of phonenumber is invalid",
      "any.required": "Please input the phone number",
    }),
});

exports.ValidateAddress = validate(addressSchema);
