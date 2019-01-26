const Product = require('../models/Product');

exports.getProducts = (req, res, next) => {
    Product.fetchAll()
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
    Product.fetchOne(prodId)
        .then( (product) => {
            res.render('shop/product-detail', {
                docTitle: product.title,
                product: product,
                path: '/products'
            });
        })
        .catch( err => console.log(err.message));
};

exports.getCart = (req, res, next) => {
    req.user.getCart()
    .then( products => {
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
    Product.fetchOne(prodId)
    .then(product => {
        return req.user.addToCart(product);
    })
    .then(result => {
        console.log(`Inserted Cart Count: ${result.modifiedCount}`);
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
    Product.fetchAll()
        .then( products => {
            res.render('shop/index', { 
                prods: products,
                docTitle: 'Shop',
                path: '/'
            });
        })
        .catch( err => console.log(err.message));
};

// exports.getOrders = (req, res, next) => {
//     req.user.getOrders({include: ['products'] })
//     .then(orders => {
//         res.render('shop/orders', {
//             docTitle: 'My Orders',
//             path: '/orders',
//             orders: orders
//         });
//     })
//     .catch(err => console.log(err));
// };
//
// exports.postOrder = (req, res, next) => {
//     let fetchedCart;
//     req.user
//     .getCart()
//     .then(cart => {
//         fetchedCart = cart;
//         return cart.getProducts();
//     })
//     .then(products => {
//         return req.user.createOrder()
//         .then(order => {
//             order.addProducts(products.map(product => {
//                 product.orderItem = {quantity: product.cartItem.quantity}
//                 return product;
//             }));
//         })
//         .catch(err => console.log(err));
//     })
//     .then(result => {
//         return fetchedCart.setProducts(null)
//     })
//     .then( result => {
//         res.redirect('/orders');
//     })
//     .catch(err => console.log(err));
// };


// exports.getCheckout = (req, res, next) => {
//     res.render('shop/checkout', {
//         docTitle: 'Checkout',
//         path: '/checkout'
//     })
// }



