const log = require("log-less-fancy")();
const sqlite3 = require("sqlite3"); //.verbose();

function readTile(file, zoom, column, row) {
  return new Promise((resolve, reject) => {
    let dbRow = Math.pow(2, zoom) - 1 - row;
    log.info(`Read tile ${zoom},${column},${dbRow} from ${file}`);
    const sql =
      "SELECT tile_data from tiles WHERE zoom_level=? AND tile_column=? AND tile_row=?";
    const db = new sqlite3.cached.Database(file, sqlite3.OPEN_READONLY, err => {
      if (err) return reject(err);
      db.get(sql, [zoom, column, dbRow], (err, record) => {
        db.close();
        if (err) {
          return reject("err");
        }
        resolve(record && record.tile_data);
      });
    });
  });
}

function readMetadata(file) {
  log.info("Open " + file);
  return new Promise((resolve, reject) => {
    const sql = "SELECT name, value from metadata";
    const db = new sqlite3.cached.Database(
      file,
      sqlite3.OPEN_READONLY,
      error => {
        if (error) return resolve({ error });
        db.all(sql, (error, records) => {
          if (error || !records) return resolve({ error });

          db.close();
          const meta = records.reduce((acc, row) => {
            acc[row.name] = row.value;
            return acc;
          }, {});
          resolve(meta);
        });
      }
    );
  });
}

function listFiles(file, filter) {
  log.info("Open " + file);
  if (filter.length === 3) filter[2] = Math.pow(2, filter[0]) - 1 - filter[2];
  return new Promise((resolve, reject) => {
    const sql = {
      0: "SELECT DISTINCT zoom_level FROM tiles",
      1: "SELECT DISTINCT tile_column FROM tiles WHERE zoom_level=?",
      2: "SELECT (2 << zoom_level - 1) - 1 - tile_row, length(tile_data) AS size FROM tiles WHERE zoom_level=? AND tile_column=?"
    };
    const db = new sqlite3.cached.Database(file, sqlite3.OPEN_READONLY, err => {
      if (err) return reject(err);
      db.all(sql[filter.length], filter, (err, records) => {
        db.close();
        if (err) return reject(err);

        resolve(records);
      });
    });
  });
}

module.exports = { readTile, readMetadata, listFiles };
