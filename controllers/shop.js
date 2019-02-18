// Core node modules
const fs = require('fs');
const path = require('path');

// custom modules
const Product = require('../models/Product');
const Order = require('../models/Order');

//third part modules
const PDFDocument = require('pdfkit');

const ITEMS_PER_PAGE = 4;

exports.getProducts = (req, res, next) => {
    const page = +req.query.page || 1;
    let totalItems;
    Product.find().countDocuments()
    .then(numDocs => {
        totalItems = numDocs;
        return Product.find().skip((page -1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE);
    }) 
    .then( products => {
        res.render('shop/product-list', { 
            prods: products,
            docTitle: 'All Products',
            path: '/products',
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < totalItems,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
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
    const page = +req.query.page || 1;
    let totalItems;
    console.log(`Page number:${page}`);
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
    Product.find().countDocuments()
    .then(numDocs => {
        totalItems = numDocs;
        return Product.find().skip((page -1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE);
    }) 
    .then( products => {
        res.render('shop/index', { 
            prods: products,
            docTitle: 'Shop',
            path: '/',
            message: message,
            errorMessage: errorMessage,
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < totalItems,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
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

exports.getCheckout = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then( user => {
            const products = user.cart.items;
            const total = user.cart.cartTotal;
            res.render('shop/checkout', {
                docTitle: 'Checkout',
                path: '/checkout',
                products: products,
                total: total,
            });
        })
        .catch( err => {
            console.log(err);
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postOrder = (req, res, next) => {
    // Set your secret key: remember to change this to your live secret key in production
    // See your keys here: https://dashboard.stripe.com/account/apikeys
    const stripe = require("stripe")("sk_test_IJ9xYeE67TuEZlYHWRPqZhHo");

    // Token is created using Checkout or Elements!
    // Get the payment token ID submitted by the form:
    const token = req.body.stripeToken; // Using Express
    let cartTotal;
    req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            const total = user.calculateCart();
            cartTotal = total;
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
            (async () => {
                const charge = await stripe.charges.create({
                    amount: cartTotal * 100,
                    currency: 'usd',
                    description: 'Example charge',
                    source: token,
                    metadata: { order_id: result._id.toString(), user_email: result.user.email }
                });
                })();
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





