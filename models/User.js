const mongoose = require('mongoose');
const Product = require('./Product');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    cart: {
        items: [
            {
                productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
                quantity: { type: Number, required: true },
                productPrice: { type: Number, ref:'Product', required: true}
            }
        ],
        cartTotal: { type: Number, required: true }
    }
});

userSchema.methods.addToCart = function (product) {
    const cartProductIndex = this.cart.items.findIndex(cp => {
        return cp.productId.toString() === product._id.toString();
    });
    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];
    if(cartProductIndex >= 0) {
        newQuantity = this.cart.items[cartProductIndex].quantity + 1;
        updatedCartItems[cartProductIndex].quantity = newQuantity;
        this.cart.items = updatedCartItems;
        this.cart.cartTotal = this.calculateCart();
    }
    else {
        updatedCartItems.push({
            productId: product._id,
            productPrice: product.price,
            quantity: newQuantity,
        });
        this.cart.items = updatedCartItems;
        this.cart.cartTotal = this.calculateCart();
    }

    return this.save();

};

userSchema.methods.calculateCart = function() {
    let total = 0;
    if(this.cart.items.length === 0) {
        total = 0;
    } else {
        this.cart.items.forEach(element => {
            let productTotal = element.productPrice * element.quantity;
            total += productTotal;
        });
    }
    return total;
}

userSchema.methods.deleteCartItem = function(productId) {
    let newQuantity;
    let cartTotal;
    const updatedCartItems = [...this.cart.items];

    const productIndex = this.cart.items.findIndex(item => {
        return item.productId.toString() === productId.toString();
    });
    console.log(`Product Index ${productIndex}`);
    if(this.cart.items[productIndex].quantity <= 1) {

        const items = this.cart.items.filter( item => {
            return item.productId.toString() !== productId.toString();
        });

        cartTotal = this.calculateCart();
        const cart = {items: items, cartTotal: cartTotal};
        this.cart = cart;

    } else {
        newQuantity =  this.cart.items[productIndex].quantity - 1;
        updatedCartItems[productIndex].quantity = newQuantity;
        cartTotal = this.calculateCart();
        const cart = {items: updatedCartItems, cartTotal: cartTotal};
        this.cart = cart;
    }
    return this.save();
    
};

userSchema.methods.clearCart = function() {
    this.cart = { items: [], cartTotal: 0 };
    return this.save();

};

module.exports = mongoose.model('User', userSchema);

// const mongodb = require('mongodb');
// const getDb = require('../util/database').getDb;
//
// const ObjectId = mongodb.ObjectId;
//
// class User {
//     constructor(username, email, cart, id) {
//         this.username = username;
//         this.email = email;
//         this.cart = cart; //{items: []}
//         this._id = id;
//     }
//
//     save() {
//         const db = getDb();
//         return db.collection('users')
//             .insertOne(this)
//             .then(result => {
//                 console.log(`Inserted Count ${result.insertedCount}`);
//             })
//             .catch(err => console.log(err));
//     }
//
//     addToCart(product) {
//         const cartProductIndex = this.cart.items.findIndex(cp => {
//             return cp.productId.toString() === product._id.toString();
//         });
//         let newQuantity = 1;
//         const updatedCartItems = [...this.cart.items];
//
//         if(cartProductIndex >= 0) {
//             newQuantity = this.cart.items[cartProductIndex].quantity + 1;
//             updatedCartItems[cartProductIndex].quantity = newQuantity;
//         }
//         else {
//             updatedCartItems.push({
//                 productId: new ObjectId(product._id),
//                 quantity: newQuantity
//             });
//         }
//
//         const updatedCart = {items: updatedCartItems };
//         const db = getDb();
//
//         return db.collection('users').updateOne(
//             { _id: new ObjectId(this._id) },
//             { $set: {cart: updatedCart} }
//         );
//
//     }
//
//     getCart() {
//         const db = getDb();
//         const productIds = this.cart.items.map(i => {
//             return i.productId;
//         });
//         return db.collection('products').find({_id: {$in: productIds}})
//             .toArray()
//             .then(products => {
//                 return products.map(p => {
//                     return { ...p, quantity: this.cart.items.find(i => {
//                         return i.productId.toString() === p._id.toString();
//                         }).quantity
//                     };
//                 });
//             })
//             .catch(err => console.log(err));
//     }
//
//     deleteCartItem(productId) {
//         const db = getDb();
//         let newQuantity;
//         const updatedCartItems = [...this.cart.items];
//
//         const productIndex = this.cart.items.findIndex(item => {
//             return item.productId.toString() === productId.toString();
//         });
//
//         if(this.cart.items[productIndex].quantity <= 1) {
//
//             const items = this.cart.items.filter( item => {
//                 return item.productId.toString() !== productId.toString();
//             });
//
//             return db.collection('users').updateOne(
//                 {_id: new ObjectId(this._id) },
//                 { $set: { cart: { items: items } }}
//             );
//         } else {
//             newQuantity =  this.cart.items[productIndex].quantity - 1;
//             updatedCartItems[productIndex].quantity = newQuantity;
//
//             return db.collection('users').updateOne(
//                 { _id: new ObjectId(this._id) },
//                 { $set: { cart: { items: updatedCartItems } }}
//             );
//         }
//     }
//
//     static fetchUser(id) {
//         const db = getDb();
//         return db.collection('users')
//             .findOne({_id: new mongodb.ObjectId(id)})
//             .then(user => {
//                 if(user) {
//                     return user;
//                 }
//             })
//             .catch(err => console.log(err));
//     }
//
// }
//
// module.exports = User;