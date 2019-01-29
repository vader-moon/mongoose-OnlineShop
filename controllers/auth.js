const User = require('../models/User');
exports.getLogin = (req, res, next) => {
  res.render('auth/login', {
      docTitle: 'Login', 
      path: '/login',
      isAuthenticated: false,
  }); // Allows to send a response and attach a body of type any.
};

exports.postLogin = (req, res, next) => {
    User.findById('5c4f374143a4f92e004d05e1')
        .then(user => {
            req.session.isLoggedIn = true;
            req.session.user = user;
            res.redirect('/');
        })
        .catch(err => console.log(err));
};

exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        console.log(err);
        res.redirect('/');
    })
};