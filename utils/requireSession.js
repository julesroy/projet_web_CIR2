function requireSession(req, res, next) {
    if (req.session.user) {
        next();
    } else if (
        !req.session.user &&
        req.cookies.username &&
        req.cookies.email &&
        req.cookies.idpp
    ) {
        req.session.user = {
            idUser: req.cookies.idUser,
            username: req.cookies.username,
            email: req.cookies.email,
            idpp: req.cookies.idpp,
        };
        next();
    } else {
        res.redirect("/signin");
    }
}

module.exports = requireSession;
