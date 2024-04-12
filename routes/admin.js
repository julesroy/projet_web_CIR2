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
                db.all(
                    `SELECT s.*
                    FROM standings s
                    INNER JOIN (
                        SELECT idUser, MAX(idStanding) as MaxId
                        FROM standings
                        WHERE idRace = ?
                        GROUP BY idUser
                    ) ss ON s.idUser = ss.idUser AND s.idStanding = ss.MaxId WHERE s.idRace = ?`,
                    [idActualRace, idActualRace],
                    (err, rows) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve({ rows, idActualRace });
                        }
                    }
                );
            });
        })
        .then(({ rows, idActualRace }) => {
            return new Promise((resolve, reject) => {
                db.get(
                    `SELECT * FROM results WHERE idRace = ? ORDER BY idResult DESC LIMIT 1`,
                    [idActualRace],
                    (err, resultRace) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve({
                                rows,
                                idActualRace,
                                resultRace,
                            });
                        }
                    }
                );
            });
        })
        .then(({ rows, idActualRace, resultRace }) => {
            var referenceResultat = JSON.parse(resultRace.standings);
            return Promise.all(
                rows.map((element) => {
                    var score = 0;
                    const standing = JSON.parse(element.standing);

                    for (let i = 0; i < standing.length; i++) {
                        const expectedIndex = referenceResultat.indexOf(
                            standing[i]
                        );

                        // Vérifier les positions autour de l'index attendu dans une plage de ±2
                        for (
                            let j = expectedIndex - 2;
                            j <= expectedIndex + 2;
                            j++
                        ) {
                            if (
                                j >= 0 &&
                                j < standing.length &&
                                standing[j] === referenceResultat[i]
                            ) {
                                // Calculer les points en fonction de la distance par rapport à l'index attendu
                                const distance = Math.abs(expectedIndex - j);
                                const pointsToAdd = Math.max(0, 10 - distance);
                                score += pointsToAdd;
                                break; // Sortir de la boucle si on a trouvé un élément correspondant
                            }
                        }
                    }

                    return new Promise((resolve, reject) => {
                        db.run(
                            `INSERT INTO points(points, idRace, idUser) VALUES(?, ?, ?)`,
                            [score, element.idRace, element.idUser],
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
            );
        })
        .then((idActualRace) => {
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
                    (idActualRace = idActualRace[0] + 1),
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
        .then(() => {
            res.redirect("/administration");
        })
        .catch((err) => {
            res.send(err.message);
        });
});

module.exports = router;
