// core node modules
const path = require('path');

// 3rd party dependencies
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const key = require('./config/keys');
//const expressHbs = require('express-handlebars');

// custom imports
const adminRoutes= require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const errorCtrl = require('./controllers/error');
const User = require('./models/User');
const mongoose = require('mongoose');

const app = express();
const store = new MongoDBStore({
    uri: key.MONGODB_URI,
    collection: 'sessions',

});
const csrfProtection = csrf();

//app.engine('handlebars', expressHbs({layoutsDir: 'views/layouts/', defaultLayout: 'main-layout'}));
app.set('view engine', 'ejs');
//app.set('views', 'views');

app.use(bodyParser.urlencoded({extended: false})); //registers middleware to parse incoming requests
app.use(express.static(path.join(__dirname, 'public'))); //dynamically register css
app.use(
    session({
        secret: key.sessionSecret,
        resave: false,
        saveUninitialized: false,
        store: store
    })
);
app.use(csrfProtection);
app.use(flash());

app.use((req,res, next) => {
    if(!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            if(!user) {
                return next();
            }
            req.user = user;
            next();
        })
        .catch(err => {
            throw new Error(err);
        });
});

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500', errorCtrl.get500);
app.use(errorCtrl.get404);

mongoose.connect(key.MONGODB_URI, {useNewUrlParser: true})
    .then(result => {
        app.listen(3000);
    })
    .catch(err => console.log(err));