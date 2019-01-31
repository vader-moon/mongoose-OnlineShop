// Node Core Modules

// 3rd Party Modules
const express = require('express');
const { check, body } = require('express-validator/check');

// Custom Modules
const authCtrl = require('../controllers/auth');
const User = require('../models/User');

const router = express.Router();

router.get('/login', authCtrl.getLogin);

router.post('/login', 
[
  check('email')
  .isEmail()
  .withMessage('Email is not valid')
  .normalizeEmail(),

  check('password')
  .isLength( {min: 8} )
  .withMessage('Password must be 8 characters long')
  .trim(),
]
,authCtrl.postLogin);

router.get('/signup', authCtrl.getSignup);

router.post('/signup', 
[
    check('username')
    .isAlphanumeric()
    .withMessage('Required and special charaters are not allowed')
    .trim(),

    check('email')
    .isEmail().withMessage('Please Enter A valid email')
    .custom((value, { req }) => {
      return User.findOne({email: value}).then(userDoc => {
          if(userDoc){
              return Promise.reject('Email already exists');
          };
      });
    })
    .normalizeEmail(),

    check('password', 'Please enter a password at least 8 characters long')
    .isLength({ min: 8, max: undefined }),

    check('confirmPassword').custom((value, {req}) => {
      if(value !== req.body.password) {
        throw new Error('Passwords have to match!');
      } 
      return true;
    })
    .trim(),
], 
authCtrl.postSignup);

router.post('/logout', authCtrl.postLogout);

router.get('/reset', authCtrl.getReset);

router.post('/reset', authCtrl.postReset);

router.get('/reset/:token', authCtrl.getNewPassword);

router.post('/new-password', authCtrl.postNewPassword);

router.get('/sent-email/:id', authCtrl.getEmailAwait);

module.exports = router;