const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const router = express.Router();
const db = require("../config/database");

router.get("/signin", (req, res) => {
    res.render("signin");
});

router.get("/signup", (req, res) => {
    res.render("signup");
});

router.post("/signupProcess", (req, res) => {
    const { username, email, password } = req.body;
    const query = `INSERT INTO users(username, email, password) VALUES(?, ?, ?)`;
    db.run(query, [username, email, password], (err) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        //si réussite
        res.status(201).send("Utilisateur créé avec succès");
    });
});

module.exports = router;
