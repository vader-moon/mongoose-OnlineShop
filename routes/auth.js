// Node Core Modules

// 3rd Party Modules
const express = require('express');
const { check, body } = require('express-validator/check');

// Custom Modules
authCtrl = require('../controllers/auth');

const router = express.Router();

router.get('/login', authCtrl.getLogin);

router.post('/login', authCtrl.postLogin);

router.get('/signup', authCtrl.getSignup);

router.post('/signup', 
[
    check('username')
    .isAlphanumeric()
    .withMessage('Required and special charaters are not allowed'),

    check('email')
    .isEmail().withMessage('Please Enter A valid email'),

    check('password', 'Please enter a password at least 8 characters long')
    .isLength({ min: 8, max: undefined }),

    check('confirmPassword').custom((value, {req}) => {
      if(value !== req.body.password) {
        throw new Error('Passwords have to match!');
      } 
      return true;
    })
], 
authCtrl.postSignup);

router.post('/logout', authCtrl.postLogout);

router.get('/reset', authCtrl.getReset);

router.post('/reset', authCtrl.postReset);

router.get('/reset/:token', authCtrl.getNewPassword);

router.post('/new-password', authCtrl.postNewPassword);

router.get('/sent-email/:id', authCtrl.getEmailAwait);

module.exports = router;