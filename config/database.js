const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./database.sqlite", (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log("Connecté à la db");
});

module.exports = db;
