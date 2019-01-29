// node core modules
const path  = require('path');

// 3rd Party Modules
const express = require('express');

// Custom imports
const adminCtrl = require('../controllers/admin');

const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/products', isAuth, adminCtrl.getProducts);

// implicitly this route is reached under /admin/add-product => GET
router.get('/add-product', isAuth, adminCtrl.getAddProduct);

// implicitly this route is reached under /admin/add-product => POST
router.post('/add-product', isAuth, adminCtrl.postAddProduct);

router.get('/edit-product/:productId', isAuth, adminCtrl.getEditProduct);

router.post('/edit-product', isAuth, adminCtrl.postEditProduct);

router.post('/delete-product', isAuth, adminCtrl.postDeleteProduct);

module.exports = router;
