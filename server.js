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

app.get("/", requireSession, (req, res) => {
    //console.log(req.session.user.idUser);
    res.render("index", { idpp: req.session.user.idpp });
});

app.post("/update-order", requireSession, (req, res) => {
    var order = JSON.stringify(req.body.order);
    var idUser = req.session.user.idUser;
    db.run(
        "INSERT INTO standings(standing, idUser) VALUES(?, ?)",
        [order, idUser],
        function (err) {
            if (err) {
                res.send(err.message);
            }
        }
    );
});

app.get("/get-order", requireSession, function (req, res) {
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

const userAuthentification = require("./routes/authentification");
app.use("/", userAuthentification);

const settingsRoutes = require("./routes/settings");
app.use("/", settingsRoutes);

app.listen(3000, () => {
    console.log("Serveur connecté");
});
