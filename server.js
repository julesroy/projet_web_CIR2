const express = require("express");
const app = express();
const session = require("express-session");
const cookieParser = require("cookie-parser");
const sqlite3 = require("sqlite3").verbose();
const db = require("./config/database");
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public/"));

//importation des fonctions de verif des sessions
const requireNoSession = require("./utils/requireNoSession");
const requireSession = require("./utils/requireSession");

//config du parseur de cookies
app.use(cookieParser());

//config des sessions
app.use(
    session({
        secret: "ration",
        resave: false,
        saveUninitialized: false,
        cookie: { secure: true },
    })
);

app.get("/", requireSession, async (req, res) => {
    var race = await getActualRace();
    res.render("index", {
        idpp: req.session.user.idpp,
        nextRaceInformation: race,
    });
});

const userAuthentification = require("./routes/authentification");
app.use("/", userAuthentification);

app.get("/pilotes", requireSession, async (req, res) => {
    res.render("pilotes", { idpp: req.session.user.idpp });
});

app.get("/teams", requireSession, async (req, res) => {
    res.render("teams", { idpp: req.session.user.idpp });
});

app.get("/circuits", requireSession, async (req, res) => {
    var results;
    await new Promise((resolve, reject) => {
        db.all("SELECT * FROM tracks", function (err, row) {
            if (err) {
                reject(err);
            } else {
                results = row;
                resolve(row);
            }
        });
    });
    res.render("circuits", { idpp: req.session.user.idpp, tracks: results });
});

app.get("/classement", requireSession, async (req, res) => {
    var data;
    await new Promise((resolve, reject) => {
        db.all(`SELECT * FROM points`, function (err, rows) {
            if (err) {
                reject(err);
            } else {
                data = rows;
                resolve(rows);
            }
        });
    });

    // Calculer le total de points pour chaque utilisateur
    const userPoints = {};
    data.forEach((entry) => {
        if (userPoints[entry.idUser]) {
            userPoints[entry.idUser] += entry.points;
        } else {
            userPoints[entry.idUser] = entry.points;
        }
    });

    const sortedUserPoints = Object.entries(userPoints).sort(
        (a, b) => b[1] - a[1]
    );

    res.render("classement", {
        idpp: req.session.user.idpp,
        tableauClassement: sortedUserPoints,
    });
});

const predictions = require("./routes/prediction");
app.use("/", predictions);

const settingsRoutes = require("./routes/settings");
app.use("/", settingsRoutes);

const adminRoutes = require("./routes/admin");
const getActualRace = require("./utils/getActualRace");
app.use("/", adminRoutes);

app.listen(3000, () => {
    console.log("Serveur connecté");
});
