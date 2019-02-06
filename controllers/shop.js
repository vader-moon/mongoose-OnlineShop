// Core node modules
const fs = require('fs');
const path = require('path');

// custom modules
const Product = require('../models/Product');
const Order = require('../models/Order');

//third part modules
const PDFDocument = require('pdfkit');

exports.getProducts = (req, res, next) => {
    Product.find()
        .then( products => {
            res.render('shop/product-list', { 
                prods: products,
                docTitle: 'All Products',
                path: '/products' ,
            });
        })
        .catch( err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getProduct = (req, res, next) => {
    const prodId = req.params.productId;
    Product.findById(prodId)
        .then( (product) => {
            res.render('shop/product-detail', {
                docTitle: product.title,
                product: product,
                path: '/products',
            });
        })
        .catch( err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getCart = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then( user => {
            const products = user.cart.items;
            const total = user.cart.cartTotal;
            res.render('shop/cart', {
                docTitle: 'Your Cart',
                path: '/cart',
                products: products,
                total: total,
            });
        })
        .catch( err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postCart = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findById(prodId)
    .then(product => {
        return req.user.addToCart(product);
    })
    .then(result => {
        res.redirect('/cart');
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });

};

exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    req.user.deleteCartItem(prodId)
    .then(result => {
        res.redirect('/cart');
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });

};

exports.getIndex = (req, res, next) => {
    let message, errorMessage;
    const login = req.flash('login-success');
    const edit = req.flash('permission-denied');
    const deletion = req.flash('delete-denied');
    if(login.length > 0) {
        message = login[0];
    } else if(edit.length > 0) {
        errorMessage = edit[0];
    } else if(deletion.length > 0) {
        errorMessage = deletion[0];
    }
    else {
        message = null;
        errorMessage = null;
    }
    Product.find()
        .then( products => {
            res.render('shop/index', { 
                prods: products,
                docTitle: 'Shop',
                path: '/',
                message: message,
                errorMessage: errorMessage,
            });
        })
        .catch( err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getOrders = (req, res, next) => {
    Order.find({"user.userId": req.user._id})
        .then(orders => {
            res.render('shop/orders', {
                docTitle: 'My Orders',
                path: '/orders',
                orders: orders,
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postOrder = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            const total = user.calculateCart();
            const products = user.cart.items.map(i => {
                return { quantity: i.quantity, product: { ...i.productId._doc } };
            });
            const order = new Order({
                user: {
                    email: req.user.email,
                    username: req.user.username,
                    userId: req.user._id,
                },
                products: products,
                total: total,
            });
            return order.save();
        })
        .then(result => {
            return req.user.clearCart();
        })
        .then(() => {
            res.redirect('/orders');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getInvoice = (req, res, next) => {
    const orderId = req.params.orderId;
    Order.findById(orderId)
    .then(order => {
        if(!order) {
            return next(new Error('No order found'));
        }
        if(order.user.userId.toString() !== req.user._id.toString()) {
            return next(new Error('Not authorized'));
        }
        const invoiceName = `invoice-${orderId}.pdf`;
        const invoicePath = path.join('data', 'invoices', invoiceName);
        const pdfDoc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename=" '+ invoiceName +' "');
        pdfDoc.pipe(fs.createWriteStream(invoicePath));
        pdfDoc.pipe(res);
        pdfDoc.fontSize(26).text(`Invoice - #${order._id}`);
        pdfDoc.text('----------------------------------------------------------', { width: 1000});
        pdfDoc.fontSize(16);
        let count = 0;
        order.products.forEach(prod => {
            count += 1;
            pdfDoc.text(`Item ${count}: ${prod.product.title}  --  ${prod.quantity} X $ ${prod.product.price}`, { align: 'left', columns: 3, width: 1000 });
        });
        pdfDoc.text('-------------------------------------------------------------------------------------------------', {width: 1000});
        pdfDoc.text(`Total: $ ${order.total}`, {align: 'right'});
        pdfDoc.end();
        // fs.readFile(invoicePath, (err, data) => {
            //     if(err) {
                //         console.log(err);
                //         return next(err);
                //     }
                //     res.setHeader('Content-Type', 'application/pdf');
                //     res.setHeader('Content-Disposition', 'inline; filename=" '+ invoiceName +' "')
                //     res.send(data);
                // });
        // const file = fs.createReadStream(invoicePath);        

        // file.pipe(res);
    })
    .catch(err => {
        console.log(err);
        next(err)
    });
};

// exports.getCheckout = (req, res, next) => {
//     res.render('shop/checkout', {
//         docTitle: 'Checkout',
//         path: '/checkout'
//     })
// }



