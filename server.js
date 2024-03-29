const express = require("express");
const app = express();
const session = require("express-session");
const cookieParser = require("cookie-parser");
const sqlite3 = require("sqlite3").verbose();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public/"));

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

app.get("/", (req, res) => {
    res.render("index");
});

const userAuthentification = require("./routes/authentification");
app.use("/", userAuthentification);

app.listen(3000, () => {
    console.log("Serveur connecté");
});
