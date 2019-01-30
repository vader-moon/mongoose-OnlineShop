const Product = require('../models/Product');
const User = require('../models/User');

exports.getAddProduct = (req, res, next) => {
    const editMode = req.query.edit;
    res.render('admin/edit-product', {
        docTitle: 'Add Product', 
        path: '/admin/add-product',
        editing: false,
    }); // Allows to send a response and attach a body of type any.
};

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const price = req.body.price;
    const description = req.body.description;
    const imageUrl = req.body.imageUrl;
    const product = new Product({
        title:title,
        price:price,
        description:description,
        imageUrl:imageUrl,
        userId: req.user,
    });
    product.save()
    .then( (result) => {
        req.flash('add-success', "Product added SuccessFully");
        console.log('Product was created!!!');
        res.redirect('/admin/products');
    })
    .catch( err => console.log(err.message));    
};

exports.getProducts = (req, res, next) => {
    let message;
    const editSuccess = req.flash('edit-success');
    const deleteSuccess = req.flash('delete-success');
    const addSuccess = req.flash('add-success');
    if(editSuccess.length > 0) {
        message = editSuccess[0];
    } else if (deleteSuccess.length > 0) {
        message = deleteSuccess[0];
    } else if(addSuccess.length > 0) {
        message = addSuccess[0];
    }
    else {
        message = null;
    }
    Product.find({userId: req.user._id})
    .then(products => {
        res.render('admin/products', {
            prods: products,
            docTitle: 'Admin Products',
            path: '/admin/products',
            message: message,
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
    Product.findById(prodId)
    .then(product => {
        if(!product) {
            return res.redirect('/');
        }
        res.render('admin/edit-product', {
            docTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: editMode,
            product: product,
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
    Product.findById(prodId)
    .then(product => {
        if(product.userId.toString() !== req.user._id.toString()) {
            req.flash('permission-denied', 'Edit Permission Denied');
            return res.redirect('/');
        }
        product.title = title;
        product.price = price;
        product.imageUrl = imageUrl;
        product.description = description;
        product.save()
        .then(result => {
            req.flash('edit-success', 'Product Edited Successfully');
            console.log(`Product edited: ${result._id}`);
            res.redirect('/admin/products');
        });
    })
    .catch(err => console.log(err));

};

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    Product.deleteOne({_id: prodId, userId: req.user._id})
    .then(result => {
        if(result.deletedCount === 0) {
            req.flash('delete-denied', 'Delete Permission Denied');
            res.redirect('/');
        } else {
            req.flash('delete-success', 'Product Deleted Successfully');
            console.log('DESTROYED PRODUCT');
            res.redirect('/admin/products');
        }
    })
    .catch( err => console.log(err));
};
