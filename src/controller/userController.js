const {Address} = require('../models');
const createError = require('../utills/createError');

exports.createAddress = async (req, res, next) => {
  try {
    const oldAddress = await Address.findOne({
        where: {
            userId: req.user.id,
            latest: true
        }
    })
    if(oldAddress) {
        await oldAddress.update({latest: false});
    }
    const address = await Address.create({...req.body, userId: req.user.id});
    if(!address) {
        createError('Address is not valid', 401);
    }
    res.status(201).json({message: address});
  } catch (err) {
    next(err);
  }
};
