const Joi = require("joi");
const validate = require("./validate");

const productSchema = Joi.object({
  name: Joi.string().required().trim().messages({
    "any.required": "Please input the name of this product",
    "string.base": "This input must be a string type",
    "string.empty": "Product name can't be only blank space",
  }),
  price: Joi.number().greater(0).integer().messages({
    "number.greater": "Price must more than zero",
    "number.base": "Price must be a number type and not be float number",
  }),
  description: Joi.string().min(50).max(255).required().trim().messages({
    "any.required": "Please input the name of this product",
    "string.base": "This input must be a string type",
    "string.empty": "Product name can't be only blank space",
    "string.max": "Product description have limit at 255 words",
    "string.min": 'Product descriptioni should have more word'
  }),
  type: Joi.string().required().messages({
    "any.required": "Type is required",
    "string.base": "Type must be a string type",
    "string.empty": "Type cann't be a blank space",
  }),
  size: Joi.array().items(Joi.string().required()).required().messages({
    "any.required": "Size is required",
    "array.base": "Size must be an array type",
  }),
  // productImageMain: Joi.string()
  //   .regex(/^data:image\/(jpeg|jpg|png|webp);base64,/i)
  //   .required()
  //   .messages({
  //     "any.required": "Product image main is required",
  //     "string.base": "Please add image file as product image main",
  //     "string.empty": "Please add image file as product image main",
  //     "string.pattern.base":
  //       "product image main must be jpeg,jpg,png,webp file",
  //   }),
  // productImageSub: Joi.string()
  //   .regex(/^data:image\/(jpeg|jpg|png|webp);base64,/i)
  //   .required()
  //   .messages({
  //     "any.required": "Product image sub is required",
  //     "string.base": "Please add image file as product image sub",
  //     "string.empty": "Please add image file as product image sub",
  //     "string.pattern.base": "product image sub must be jpeg,jpg,png,webp file",
  //   }),
});

exports.ValidateProduct = validate(productSchema);
