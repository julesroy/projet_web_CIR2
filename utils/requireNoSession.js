// Middleware pour vérifier si une session n'existe pas
function requireNoSession(req, res, next) {
    if (
        !req.session.user &&
        !req.cookies.username &&
        !req.cookies.email &&
        !req.cookies.idpp
    ) {
        next();
    } else {
        req.session.user = {
            idUser: req.cookies.idUser,
            username: req.cookies.username,
            email: req.cookies.email,
            idpp: req.cookies.idpp,
        };
        res.redirect("/");
    }
}

module.exports = requireNoSession;
