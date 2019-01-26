// node core modules
const path  = require('path');

// 3rd Party Modules
const express = require('express');

// Custom imports
const adminCtrl = require('../controllers/admin');

const router = express.Router();

// router.get('/products', adminCtrl.getProducts);

// implicitly this route is reached under /admin/add-product => GET
router.get('/add-product', adminCtrl.getAddProduct);

// implicitly this route is reached under /admin/add-product => POST
router.post('/add-product', adminCtrl.postAddProduct);

// router.get('/edit-product/:productId', adminCtrl.getEditProduct);

// router.post('/edit-product', adminCtrl.postEditProduct);

// router.post('/delete-product', adminCtrl.postDeleteProduct);

module.exports = router;
