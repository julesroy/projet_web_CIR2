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

router.post("/update-order", requireSession, async (req, res) => {
    var idActualRace;
    await new Promise((resolve, reject) => {
        db.get(
            `SELECT idRace FROM races WHERE actual = 1`,
            function (err, row) {
                if (err) {
                    reject(err);
                } else {
                    idActualRace = row.idRace;
                    resolve(row);
                }
            }
        );
    });

    var order = JSON.stringify(req.body.order);
    var idUser = req.session.user.idUser;
    db.run(
        "INSERT INTO standings(standing, idUser, idRace) VALUES(?, ?, ?)",
        [order, idUser, idActualRace],
        function (err) {
            if (err) {
                res.send(err.message);
            }
        }
    );
});

router.get("/get-order", requireSession, function (req, res) {
    var idUser = req.session.user.idUser;
    db.get(
        "SELECT standing FROM standings WHERE idUser = ? ORDER BY idStanding DESC LIMIT 1",
        [idUser],
        function (err, row) {
            if (err) {
                res.send(err.message);
            } else {
                var order = row ? JSON.parse(row.standing) : [];
                res.send({ order: order });
            }
        }
    );
});

module.exports = router;
