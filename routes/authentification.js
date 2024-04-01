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

router.get("/signin", requireNoSession, (req, res) => {
    res.render("signin");
});

router.get("/signup", requireNoSession, (req, res) => {
    res.render("signup");
});

router.post("/signinProcess", async (req, res) => {
    const { email, password } = req.body;

    await new Promise((resolve, reject) => {
        db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    })
        .then(async (row) => {
            if (row && (await bcrypt.compare(password, row.password))) {
                //session
                req.session.user = {
                    idUser: row.idUser,
                    username: row.username,
                    email: email,
                    idpp: row.pp,
                };
                //cookies (valables un mois)
                res.cookie("idUser", row.idUser, {
                    maxAge: 30 * 24 * 60 * 60 * 1000,
                    httpOnly: true,
                });
                res.cookie("username", row.username, {
                    maxAge: 30 * 24 * 60 * 60 * 1000,
                    httpOnly: true,
                });
                res.cookie("email", email, {
                    maxAge: 30 * 24 * 60 * 60 * 1000,
                    httpOnly: true,
                });
                res.cookie("idpp", row.pp, {
                    maxAge: 30 * 24 * 60 * 60 * 1000,
                    httpOnly: true,
                });
                res.redirect("/");
            } else {
                res.redirect("/signin?msg=mdporemailincorrect");
            }
        })
        .catch((err) => {
            // Gérer l'erreur
            console.error(err);
        });
});

router.post("/signupProcess", async (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const query = `INSERT INTO users(username, email, password) VALUES(?, ?, ?)`;

    try {
        // Insert user into the database
        await new Promise((resolve, reject) => {
            db.run(query, [username, email, hashedPassword], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            });
        });

        // Retrieve last inserted ID
        const lastInsertedID = await new Promise((resolve, reject) => {
            db.get("SELECT last_insert_rowid() AS lastID", (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row.lastID);
                }
            });
        });

        // Store user information in session and cookies
        req.session.user = {
            idUser: lastInsertedID,
            username: username,
            email: email,
            idpp: 9,
        };

        res.cookie("idUser", lastInsertedID, {
            maxAge: 30 * 24 * 60 * 60 * 1000,
            httpOnly: true,
        });
        res.cookie("username", username, {
            maxAge: 30 * 24 * 60 * 60 * 1000,
            httpOnly: true,
        });
        res.cookie("email", email, {
            maxAge: 30 * 24 * 60 * 60 * 1000,
            httpOnly: true,
        });
        res.cookie("idpp", 9, {
            maxAge: 30 * 24 * 60 * 60 * 1000,
            httpOnly: true,
        });

        res.redirect("/");
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//déconnexion
router.get("/logout", (req, res) => {
    // Détruire la session
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        }

        // Supprimer les cookies
        res.clearCookie("idUser");
        res.clearCookie("username");
        res.clearCookie("email");
        res.clearCookie("idpp");

        // Rediriger vers la page de connexion
        res.redirect("/signin");
    });
});

module.exports = router;
