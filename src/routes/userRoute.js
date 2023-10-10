const express = require('express');
const userController = require('../controller/userController');

const router = express.Router();

router.post('/address', userController.createAddress);

module.exports = router;