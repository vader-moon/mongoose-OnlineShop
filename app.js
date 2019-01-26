// core node modules
const path = require('path');

// 3rd party dependencies
const express = require('express');
const bodyParser = require('body-parser');
//const expressHbs = require('express-handlebars');

// custom imports
const adminRoutes= require('./routes/admin');
const shopRoutes = require('./routes/shop');
const errorCtrl = require('./controllers/error');
const mongoConnect = require('./util/database').mongoConnect;
const User = require('./models/User');



const app = express();

//app.engine('handlebars', expressHbs({layoutsDir: 'views/layouts/', defaultLayout: 'main-layout'}));
app.set('view engine', 'ejs');
//app.set('views', 'views');

app.use(bodyParser.urlencoded({extended: false})); //registers middleware to parse incoming requests
app.use(express.static(path.join(__dirname, 'public'))); //dynamically register css
app.use( (req, res, next) => {
    User.fetchUser('5c3d4d13269c0936f236d489')
    .then(user => {
        req.user = new User(user.name, user.email, user.cart, user._id);
        next();
    })
    .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorCtrl.get404);

mongoConnect( () => {
    app.listen(3000);
});
