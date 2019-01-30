const User = require('../models/User');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: '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',
    }
}));

exports.getLogin = (req, res, next) => {
  let errorMessage, success;
  const error = req.flash('error');
  const signupSuccess = req.flash('signup-success');

  if(error.length > 0) {
      errorMessage = error[0];
  } else if( signupSuccess.length > 0) {
      success = signupSuccess[0];
  }
  else {
      errorMessage = null;
      success = null;
  }
  res.render('auth/login', {
      docTitle: 'Login', 
      path: '/login',
      errorMessage: errorMessage,
      successMessage: success,

  }); // Allows to send a response and attach a body of type any.
};

exports.getSignup = (req, res, next) => {
    let message = req.flash('signup-error');
    if(message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/signup', {
        path: '/signup',
        docTitle: 'Signup',
        errorMessage: message,
    });
};

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({email: email})
        .then(user => {
            if(!user) {
                req.flash('error', 'Invalid Email or Password');
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
                            req.flash('login-success', 'Login Successful');
                            return res.redirect('/')
                        });
                    }
                    req.flash('error', 'Invalid Email or Password');
                    res.redirect('/login')
                })
                .catch(err => {
                    req.flash('error', 'Invalid Email or Password');
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
                req.flash('signup-error', 'Email Already Exists');
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
                    req.flash('signup-success', 'SignUp Successful');
                    res.redirect('/login');
                    return transporter.sendMail({
                        to: email,
                        from: 'shop@node-complete.com',
                        subject: 'Signup Succeeded!',
                        html: '<h1>You successfully signed up!</h1>'
                    });
                })
                .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
};

exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        console.log(err);
        res.redirect('/');
    })
};