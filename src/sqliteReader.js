const log = require("log-less-fancy")();
const sqlite3 = require("sqlite3"); //.verbose();

function read(file, key) {
  return new Promise((resolve, reject) => {
    log.info(`Read key ${key} from ${file}`);
    const sql = "SELECT value from meta WHERE kode=?";
    const db = new sqlite3.cached.Database(file, sqlite3.OPEN_READONLY, err => {
      if (err) return reject(err);
      db.get(sql, [zoom, column, dbRow], (err, record) => {
        db.close();
        if (err) return reject("err");
        resolve(record && record.value);
      });
    });
  });
}

function listFiles(file, filter) {
  log.info("Open " + file);
  return new Promise((resolve, reject) => {
    const sql = "SELECT kode FROM meta LIMIT 1000";
    const db = new sqlite3.cached.Database(file, sqlite3.OPEN_READONLY, err => {
      if (err) return reject(err);
      db.all(sql, filter, (err, records) => {
        db.close();
        if (err) return reject(err);

        resolve(records);
      });
    });
  });
}

module.exports = { read, listFiles };
