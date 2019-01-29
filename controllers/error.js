exports.get404 = (req, res, next) => { // Catch all 404 error page
    res.status(404).render('page-not-found',
    { 
        docTitle:'404 Error', path: '/404',
        isAuthenticated: req.session.isLoggedIn, });
};