const crypto = require('crypto');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { validationResult } = require('express-validator/check');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const key = require('../config/keys');

const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: key.sendGrid,
    }
}));

exports.getLogin = (req, res, next) => {
  let errorMessage, success;
  const error = req.flash('error');
  const signupSuccess = req.flash('signup-success');
  const updatedPasswordSuccess = req.flash('update-password-success');

  if(error.length > 0) {
      errorMessage = error[0];
  } else if( signupSuccess.length > 0) {
      success = signupSuccess[0];
  } else if(updatedPasswordSuccess.length > 0){
      success = updatedPasswordSuccess[0];  
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
    const errors = validationResult(req);
    console.log(errors.array());
    if(!errors.isEmpty()) {
        return res.status(422).render('auth/signup', {
            path: '/signup',
            docTitle: 'Signup',
            errorMessage: errors.array()[0].msg,
        });
    }
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
    });
};

exports.getReset = (req, res, next) => {
    let message = req.flash('error');
    if(message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/reset', {
        path: '/reset',
        docTitle: 'Reset Password',
        errorMessage: message,
    });
};

exports.postReset = (req, res, next) => {
    let user;
    crypto.randomBytes(32, (err, buffer) => {
        if(err) {
            console.log(err);
            return res.redirect('/reset');
        }

        const token = buffer.toString('hex');

        User.findOne({email: req.body.email})
            .then(foundUser => {
                if(!foundUser){
                    req.flash('error', 'Email does not exist');
                    res.redirect('/reset');
                }
                user = foundUser;
                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 3600000;
                return user.save();
            })
            .then(result => {
                transporter.sendMail({
                    to: req.body.email,
                    from: 'shop@node-complete.com',
                    subject: 'Password reset',
                    html: `
                        <p>You requested a password reset</p>
                        <p>Click this <a href="http://localhost:3000/new-password/${token}">link</a> to set a new password</p>
                `
                })
                    .then(result => {
                        console.log(`email is on its way to ${req.body.email}`);
                        console.log(result);
                        req.flash('email-sent', 'Email Sent!');
                        res.redirect(`/sent-email/${user._id}`);
                    })
                    .catch(err => console.log(err));

            })
            .catch(err => console.log(err));

    })
};

exports.getNewPassword = (req, res, next ) => {
    const token = req.params.token;
    User.findOne({resetToken: token, resetTokenExpiration: {$gt: Date.now()}})
    .then(user => {
        res.render('auth/new-password', {
            path: '/new-password',
            docTitle: 'New Password',
            userId: user._id.toString(),
            passwordToken: token,
        });
    })
    .catch(err => console.log(err));
};

exports.postNewPassword = (req, res, next) => {
    const userId = req.body.userId;
    const updatedPassword = req.body.password;
    const passwordToken = req.body.passwordToken;
    let resetUser;
    User.findOne({
        resetToken: passwordToken, 
        resetTokenExpiration: {$gt: Date.now()},
        _id: userId 
    })
    .then(user => {
        resetUser = user;
        return bcrypt.hash(updatedPassword, 12);
    })
    .then(hashedPassword => {
        resetUser.password = hashedPassword;
        resetUser.resetToken = undefined;
        resetUser.resetTokenExpiration = undefined;
        return resetUser.save();
    })
    .then(result => {
        req.flash('update-password-success', 'Password Update Successful');
        res.redirect('/login');
        transporter.sendMail({
            to: resetUser.email,
            from: 'shop@node-complete.com',
            subject: 'Password reset',
            html: '<p>Your password was reset!</p>',
        })
        .then(result => {
            console.log(`email is on its way to ${resetUser.email}`);
            console.log(result);
        })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
};

exports.getEmailAwait = (req, res, next) => {
    const userId = req.params.id;
    let email;
    let message = req.flash('email-sent');
    if(message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    User.findById(userId)
    .then(user => {
        res.render('auth/sent-email' , {
            path: '/sent-email',
            docTitle:'Email Sent',
            successMessage: message,
            emailAddress: user.email,
        });
    })
    .catch(err => console.log(err));
}