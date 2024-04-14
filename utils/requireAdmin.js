const db = require("../config/database");

async function requireAdminAccess(req, res, next) {
    var adminAccess;
    await new Promise((resolve, reject) => {
        db.get(
            `SELECT adminAccess FROM users WHERE email = ?`,
            [req.session.user.email],
            (err, row) => {
                if (err) {
                    reject();
                } else {
                    adminAccess = row.adminAccess;
                    resolve();
                }
            }
        );
    });
    if (adminAccess == 1) {
        next();
    } else {
        res.redirect("/");
    }
}

module.exports = requireAdminAccess;
