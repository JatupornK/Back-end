const Joi = require("joi");
const validate = require("./validate");

const productSchema = Joi.object({
  name: Joi.string().required().trim().messages({
    "any.required": "Please input the name of this product",
    "string.base": "This input must be a string type",
    "string.empty": "Product name can't be only blank space",
  }),
  price: Joi.number().greater(0).integer().messages({
    "number.base": "Price must not contain with float number",
    "number.greater": "Price must more than zero",
    "number.base": "Price must be a number type",
  }),
  description: Joi.string().required().trim().messages({
    "any.required": "Please input the name of this product",
    "string.base": "This input must be a string type",
    "string.empty": "Product name can't be only blank space",
  }),
  type: Joi.string().required().messages({
    "any.required" :"Type is required",
    "string.base" : "Type must be a string type",
    "string.empty" : "Type cann't be a blank space"
  }),
  // size: Joi.array().items(Joi.number()).required().messages({
  //   "any.required": "Size is required",
  //   "array.base": "Size must be an array type"
  // })
});

exports.ValidateProduct = validate(productSchema);
