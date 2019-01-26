const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

// only used internally in this file
let _db;

const mongoConnect  = (callback) => {
    MongoClient.connect('mongodb+srv://aessex_24:2s5j9Q61uPVA1BuG@cluster0-ochml.mongodb.net/shop?retryWrites=true', {useNewUrlParser: true})
        .then(client => {
            console.log('Connected!');
            _db = client.db();
            callback();
        })
        .catch(err => {
            console.log(err);
            throw err;
        });
};


const getDb = () => {
    if(_db) {
        return _db;
    }

    throw 'No database found!'
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
