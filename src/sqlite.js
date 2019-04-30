const log = require("log-less-fancy")();
const sqlite3 = require("sqlite3");

// Strip injection unsafe characters from argument
function safe(arg) {
  return arg.replace(/[^0-9a-z_%\-]/gi, "");
}

function dball(file, sql, args = []) {
  log.info("Open " + file);
  log.debug("SQL   : " + sql);
  log.debug("  args: " + args);
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(file, sqlite3.OPEN_READONLY, err => {
      if (err) return reject(err);
      db.all(sql, args, (err, records) => {
        db.close();
        if (err) return reject(err);
        resolve(records);
      });
    });
  });
}

module.exports = { safe, dball };
