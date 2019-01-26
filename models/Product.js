const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },

    imageUrl: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Product', productSchema);
// const mongodb = require('mongodb');
// const getDb = require('../util/database').getDb;
// //const User = require('./User');
//
//
// class Product {
//     constructor(title, price, description, imageUrl, userId) {
//         this.title = title;
//         this.price = price;
//         this.description = description;
//         this.imageUrl = imageUrl;
//         this.userId = userId;
//     }
//
//     save() {
//         const db = getDb();
//         return db.collection('products')
//             .insertOne(this)
//                 .then(result => {
//                     console.log(`Inserted Count ${result.insertedCount}`);
//                 })
//                 .catch(err => console.log(err));
//     }
//
//     update(id) {
//         const db = getDb();
//         return db.collection('products')
//             .updateOne({_id: new mongodb.ObjectId(id)}, {$set: this})
//             .then(product => {
//                 console.log(`Updated Count: ${product.modifiedCount}`);
//                 return product;
//             })
//             .catch(err => console.log(err));
//     }
//
//     static fetchAll() {
//         const db = getDb();
//         return db.collection('products')
//             .find()
//             .toArray()
//             .then(products => {
//                 return products;
//             })
//             .catch(err => console.log(err));
//     }
//
//     static fetchOne(id) {
//         const db = getDb();
//         return db.collection('products')
//             .find({_id: new mongodb.ObjectId(id)})
//             .next()
//             .then(product => {
//                 if(product) {
//                     return product;
//                 }
//             })
//             .catch(err => console.log(err));
//     }
//
//     static delete(id) {
//         const db = getDb();
//         return db.collection('products')
//             .deleteOne({_id: new mongodb.ObjectId(id)})
//             .then(result => {
//                console.log(`Deleted Count: ${result.deletedCount}`);
//             })
//             .catch(err => console.log(err));
//     }
// }
//
//
// module.exports = Product;