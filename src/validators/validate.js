const createError = require("../utills/createError");

module.exports = schema => input => {
    const {value, error} = schema.validate(input);
    // console.log(value, error)
    if(error) createError(error.message, 400);
    return value
}