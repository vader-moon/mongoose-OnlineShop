// core node modules
const path = require('path');
const fs = require('fs');

// 3rd party dependencies
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const uniqid = require('uniqid');
const isAuth = require('./middleware/is-auth');
const shopCtrl = require('./controllers/shop'); 
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const multer = require('multer');
const flash = require('connect-flash');
const mongoose = require('mongoose');
//const expressHbs = require('express-handlebars');

// custom imports
const adminRoutes= require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const errorCtrl = require('./controllers/error');
const key = require('./config/keys');
const User = require('./models/User');

const app = express();
const store = new MongoDBStore({
    uri: key.MONGODB_URI,
    collection: 'sessions',

});
const csrfProtection = csrf();

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};
//app.engine('handlebars', expressHbs({layoutsDir: 'views/layouts/', defaultLayout: 'main-layout'}));
app.set('view engine', 'ejs');
//app.set('views', 'views');

app.use(bodyParser.urlencoded({extended: false})); //registers middleware to parse incoming requests
app.use(
    multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(express.static(path.join(__dirname, 'public'))); //dynamically register css
app.use(
    session({
        secret: key.sessionSecret,
        resave: false,
        saveUninitialized: false,
        store: store
    })
);
app.use(flash());

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    next();
});

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
            next(new Error(err));
        });
});

app.post('/create-order', isAuth, shopCtrl.postOrder);

app.use(csrfProtection);
app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500', errorCtrl.get500);
app.use(errorCtrl.get404);
app.use((error, req, res, next) => {
    console.log(error);
    res.status(404).render('500', { 
        docTitle:'500 Error', 
        path: '/500',
        isAuthenticated: req.session.isLoggedIn, 
    });
});

mongoose.connect(key.MONGODB_URI, {useNewUrlParser: true})
    .then(result => {
        app.listen(3000);
        console.log('Connected!');
    })
    .catch(err => console.log(err));