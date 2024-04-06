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

const getActualRace = require("../utils/getActualRace");

router.get("/administration", requireSession, async (req, res) => {
    var ActualRace = await getActualRace();
    res.render("adminDashboard", {
        idpp: req.session.user.idpp,
        racePlace: ActualRace.racePlace,
    });
});

router.post("/update-result", requireSession, async (req, res) => {
    var order = JSON.stringify(req.body.order);
    var idActualRace = await getActualRace();
    idActualRace = idActualRace.idRace;
    db.run(
        "INSERT INTO results(standings, idRace) VALUES(?, ?)",
        [order, idActualRace],
        function (err) {
            if (err) {
                res.send(err.message);
            }
        }
    );
});

router.get("/validate-result", requireSession, (req, res) => {
    getActualRace()
        .then((idActualRace) => {
            idActualRace = idActualRace.idRace;
            return new Promise((resolve, reject) => {
                db.run(
                    "UPDATE races SET actual = 0, finished = 1 WHERE actual = 1",
                    (err) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(idActualRace);
                        }
                    }
                );
            });
        })
        .then((idActualRace) => {
            return new Promise((resolve, reject) => {
                db.run(
                    "UPDATE races SET actual = 1, finished = 0 WHERE idRace = ?",
                    idActualRace + 1,
                    (err) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    }
                );
            });
        })
        .then(() => {
            res.redirect("/administration");
        })
        .catch((err) => {
            res.send(err.message);
        });
});

module.exports = router;
