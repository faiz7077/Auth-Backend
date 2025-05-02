const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const {signUp} = require('../controllers/authController');

router.post('/sign-up', signUp);
router.post('/sign-up/otp', authController.verifyOtp);
router.post('/login', authController.login);
module.exports = router;