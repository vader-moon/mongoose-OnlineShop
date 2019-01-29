const User = require('../models/User');

exports.getLogin = (req, res, next) => {
  res.render('auth/login', {
      docTitle: 'Login', 
      path: '/login',
      isAuthenticated: false,
  }); // Allows to send a response and attach a body of type any.
};

exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
        path: '/signup',
        docTitle: 'Signup',
        isAuthenticated: false
    });
};

exports.postLogin = (req, res, next) => {
    User.findById('5c4f374143a4f92e004d05e1')
        .then(user => {
            req.session.isLoggedIn = true;
            req.session.user = user;
            req.session.save((err) => {
                console.log(err);
                res.redirect('/');
            });
        })
        .catch(err => console.log(err));
};

exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const username = req.body.username;
    User.findOne({email: email})
        .then(userDoc => {
            if(userDoc){
                return res.redirect('/signup');
            }
            const user = new User({
                username: username,
                email: email,
                password: password,
                cart: { items:[], cartTotal: 0 }
            });
            return user.save();
        })
        .then(result => {
            res.redirect('/login');
        })
        .catch(err => console.log(err));
};

exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        console.log(err);
        res.redirect('/');
    })
};