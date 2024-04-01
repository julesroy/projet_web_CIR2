const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const sqlite3 = require("sqlite3").verbose();
const router = express.Router();
const db = require("../config/database");

//importation des fonctions de verif des sessions
const requireNoSession = require("../utils/requireNoSession");
const requireSession = require("../utils/requireSession");

router.get("/settings", requireSession, (req, res) => {
    res.render("settings", { idpp: req.session.user.idpp });
});

router.get("/changepp", requireSession, (req, res) => {
    var idpp = req.query.idpp;
    idpp = parseInt(idpp);
    const query = `UPDATE users SET pp = ? WHERE email = ?`;
    db.run(query, [idpp, req.session.user.email], (err) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        req.session.user.idpp = idpp;
        res.cookie("idpp", idpp, {
            maxAge: 30 * 24 * 60 * 60 * 1000,
            httpOnly: true,
        });
        res.redirect("/settings");
    });
});

module.exports = router;
