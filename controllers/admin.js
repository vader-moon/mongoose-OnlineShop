const mongodb = require('mongodb');

const Product = require('../models/Product');
const User = require('../models/User');


//const ObjectId = mongodb.ObjectId;

exports.getAddProduct = (req, res, next) => {
    const editMode = req.query.edit;

    res.render('admin/edit-product', {
        docTitle: 'Add Product', 
        path: '/admin/add-product',
        editing: false
    }); // Allows to send a response and attach a body of type any.
};

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const price = req.body.price;
    const description = req.body.description;
    const imageUrl = req.body.imageUrl;
    const userId = req.user._id;
    console.log(`associated user id: ${userId}`);
    const product = new Product(title, price, description, imageUrl, userId);
    product.save()
    .then( (result) => {
        console.log('Product was created!!!');
        res.redirect('/admin/products');
    })
    .catch( err => console.log(err.message));    
};

exports.getProducts = (req, res, next) => {
    Product.fetchAll()
    .then(products => {
        res.render('admin/products', {
            prods: products,
            docTitle: 'Admin Products',
            path: '/admin/products'
        });
    })
    .catch( err => console.log(err.message));
};

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if(!editMode) {
        return res.redirect('/');
    }
    const prodId = req.params.productId;
    console.log(`product id: ${prodId}`);
    console.log(`editing mode: ${editMode}`);
    Product.fetchOne(prodId)
    .then(product => {
        if(!product) {
            return res.redirect('/');
        }
        res.render('admin/edit-product', {
            docTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: editMode,
            product: product
        });
    })
    .catch(err => console.log(err.message));
};

exports.postEditProduct = (req, res, next) => {
    const title = req.body.title;
    const price = req.body.price;
    const imageUrl = req.body.imageUrl;
    const description = req.body.description;
    const prodId = req.body.productId;
    const product = new Product(title, price, description, imageUrl);
    product.update(prodId)
    .then(result => {
        console.log('Product Updated!');
        res.redirect('/admin/products');
    })
    .catch(err => console.log(err));

};

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    Product.delete(prodId)
    .then(result => {
        console.log('DESTROYED PRODUCT');
        res.redirect('/admin/products');

    })
    .catch( err => console.log(err));
};
