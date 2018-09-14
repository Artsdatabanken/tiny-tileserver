const sqlite3 = require("sqlite3"); //.verbose();

function readTile(file, zoom, column, row) {
  return new Promise((resolve, reject) => {
    const sql =
      "SELECT tile_data from tiles WHERE zoom_level=? AND tile_column=? AND tile_row=?";
    let db = createDb(file);
    db.get(sql, [zoom, column, row], (err, record) => {
      if (err) return reject(err);
      resolve(record ? record.tile_data : null);
      db.close();
    });
  });
}

function readMetadata(file){
  return new Promise((resolve, reject) => {
  const sql =
      "SELECT name, value from metadata";
  let db = createDb(file);
  db.all(sql, (err, records) => {
    if (err) return reject(err);
    resolve(records ? records : null);
    db.close();
  });
});
}

function createDb(file){
  return new sqlite3.Database("./" + file + ".mbtiles");
}


module.exports = { readTile, readMetadata };
