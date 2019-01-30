// Node Core Modules

// 3rd Party Modules
const express = require('express');

// Custom Modules
authCtrl = require('../controllers/auth');

const router = express.Router();

router.get('/login', authCtrl.getLogin);

router.get('/signup', authCtrl.getSignup);

router.post('/signup', authCtrl.postSignup);

router.post('/login', authCtrl.postLogin);

router.post('/logout', authCtrl.postLogout);

router.get('/reset', authCtrl.getReset);

// router.post('/reset-password', authCtrl.postReset);

module.exports = router;