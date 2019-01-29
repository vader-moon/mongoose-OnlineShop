// core node modules
const path = require('path');

// 3rd party dependencies
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
//const expressHbs = require('express-handlebars');

// custom imports
const adminRoutes= require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const errorCtrl = require('./controllers/error');
const User = require('./models/User');
const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb+srv://aessex_24:2s5j9Q61uPVA1BuG@cluster0-ochml.mongodb.net/shop';

const app = express();
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions',

});

//app.engine('handlebars', expressHbs({layoutsDir: 'views/layouts/', defaultLayout: 'main-layout'}));
app.set('view engine', 'ejs');
//app.set('views', 'views');

app.use(bodyParser.urlencoded({extended: false})); //registers middleware to parse incoming requests
app.use(express.static(path.join(__dirname, 'public'))); //dynamically register css
app.use(
    session({
        secret: 'asdfdaslkjdijwfalkjdfssnlkd@##$355v/',
        resave: false,
        saveUninitialized: false,
        store: store
    })
);

app.use((req,res, next) => {
    if(!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorCtrl.get404);

mongoose.connect(MONGODB_URI, {useNewUrlParser: true})
    .then(result => {
        app.listen(3000);
    })
    .catch(err => console.log(err));