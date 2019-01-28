exports.getLogin = (req, res, next) => {
  const isLoggedIn = req.
  get('Cookie')
  .split(';')[1]
  .trim()
  .split('=')[1];
  console.log(isLoggedIn);

  res.render('auth/login', {
      docTitle: 'Login', 
      path: '/login',
      isAuthenticated: isLoggedIn
  }); // Allows to send a response and attach a body of type any.
};

exports.postLogin = (req, res, next) => {
  res.setHeader('Set-Cookie', 'isLoggedIn=true');
  res.redirect('/');
};