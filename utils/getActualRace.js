const db = require("../config/database");

function getActualRace() {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM races WHERE actual = 1", (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

module.exports = getActualRace;
