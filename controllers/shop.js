const Product = require('../models/Product');
const Order = require('../models/Order');

exports.getProducts = (req, res, next) => {
    Product.find()
        .then( products => {
            res.render('shop/product-list', { 
                prods: products,
                docTitle: 'All Products',
                path: '/products'
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
                path: '/products'
            });
        })
        .catch( err => console.log(err.message));
};

exports.getCart = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then( user => {
            products = user.cart.items;
            res.render('shop/cart', {
                docTitle: 'Your Cart',
                path: '/cart',
                products: products
            });
        })
        .catch( err => console.log(err));
};

exports.postCart = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findById(prodId)
    .then(product => {
        return req.user.addToCart(product);
    })
    .then(result => {
        console.log('Item Added To Cart!');
        res.redirect('/cart');
    })
    .catch(err => console.log(err));

};

exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    req.user.deleteCartItem(prodId)
    .then(result => {
        console.log(`Deleted Product: ${result.deletedCount}`);
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
                path: '/'
            });
        })
        .catch( err => console.log(err.message));
};

exports.getOrders = (req, res, next) => {
    req.user.getOrders({include: ['products'] })
    .then(orders => {
        res.render('shop/orders', {
            docTitle: 'My Orders',
            path: '/orders',
            orders: orders
        });
    })
    .catch(err => console.log(err));
};

exports.postOrder = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            console.log('User products', user.cart.items);
            const products = user.cart.items.map(i => {
                return {quantity: i.quantity, product: { ...i.productId._doc } };
            });
            console.log('transformed products array', products);
            const order = new Order({
                user: {
                    name: req.user.username,
                    userId: req.user._id,
                },
                products: products
            });

            return order.save();
        })
        .then( result => {
            return req.user.clearCart();
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



