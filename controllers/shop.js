const Product = require('../models/Product');
const Order = require('../models/Order');

exports.getProducts = (req, res, next) => {
    Product.find()
        .then( products => {
            res.render('shop/product-list', { 
                prods: products,
                docTitle: 'All Products',
                path: '/products' ,
                isAuthenticated: req.session.isLoggedIn,
            });
        })
        .catch( err => console.log(err.message));
};

exports.getProduct = (req, res, next) => {
    const prodId = req.params.productId;
    Product.findById(prodId)
        .then( (product) => {
            console.log(product);
            res.render('shop/product-detail', {
                docTitle: product.title,
                product: product,
                path: '/products',
                isAuthenticated: req.session.isLoggedIn,
            });
        })
        .catch( err => console.log(err.message));
};

exports.getCart = (req, res, next) => {
    req.session.user
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
                isAuthenticated: req.session.isLoggedIn,
            });
        })
        .catch( err => console.log(err));
};

exports.postCart = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findById(prodId)
    .then(product => {
        return req.session.user.addToCart(product);
    })
    .then(result => {
        res.redirect('/cart');
    })
    .catch(err => console.log(err));

};

exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    req.session.user.deleteCartItem(prodId)
    .then(result => {
        console.log(result);
        res.redirect('/cart');
    })
    .catch(err => console.log(err.message));

};

exports.getIndex = (req, res, next) => {
    Product.find()
        .then( products => {
            res.render('shop/index', { 
                prods: products,
                docTitle: 'Shop',
                path: '/',
                isAuthenticated: req.session.isLoggedIn,
            });
        })
        .catch( err => console.log(err.message));
};

exports.getOrders = (req, res, next) => {
    Order.find({"user.userId": req.session.user._id})
        .then(orders => {
            res.render('shop/orders', {
                docTitle: 'My Orders',
                path: '/orders',
                orders: orders,
                isAuthenticated: req.session.isLoggedIn,
            });
        })
        .catch(err => console.log(err));
};

exports.postOrder = (req, res, next) => {
    req.session.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            const total = user.calculateCart();
            const products = user.cart.items.map(i => {
                return { quantity: i.quantity, product: { ...i.productId._doc } };
            });
            const order = new Order({
                user: {
                    name: req.session.user.username,
                    userId: req.session.user._id,
                },
                products: products,
                total: total,
            });
            return order.save();
        })
        .then(result => {
            return req.session.user.clearCart();
        })
        .then(() => {
            res.redirect('/orders');
        })
        .catch(err => console.log(err));
};


// exports.getCheckout = (req, res, next) => {
//     res.render('shop/checkout', {
//         docTitle: 'Checkout',
//         path: '/checkout'
//     })
// }



