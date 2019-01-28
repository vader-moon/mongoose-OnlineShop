// Node Core Modules

// 3rd Party Modules
const express = require('express');

// Custom Modules
authCtrl = require('../controllers/auth');

const router = express.Router();

router.get('/login', authCtrl.getLogin);

router.post('/login', authCtrl.postLogin);

module.exports = router;