const User = require('../models/User');
const bcrypt = require('bcryptjs');

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
    const email = req.body.email;
    const password = req.body.password;
    console.log(email);
    console.log(password);
    User.findOne({email: email})
        .then(user => {
            if(!user) {
                return res.redirect('/login');
            }
            bcrypt
                .compare(password, user.password)
                .then(doMatch => {
                    if(doMatch) {
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        return req.session.save(err => {
                            console.log('error is:', err);
                            return res.redirect('/')
                        });
                    }
                    res.redirect('/login')
                })
                .catch(err => {
                    console.log(err);
                    res.redirect('/login');
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
            return bcrypt.hash(password, 12)
                .then(hashedPassword => {
                    const user = new User({
                        username: username,
                        email: email,
                        password: hashedPassword,
                        cart: { items:[], cartTotal: 0 }
                    });
                    return user.save();
                })
                .then(result => {
                    res.redirect('/login');
                })
        })
        .catch(err => console.log(err));
};

exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        console.log(err);
        res.redirect('/');
    })
};