const sqlite3 = require("sqlite3"); //.verbose();

function readTile(kode, zoom, column, row) {
  return new Promise((resolve, reject) => {
    const sql =
      "SELECT tile_data from tiles WHERE zoom_level=? AND tile_column=? AND tile_row=?";
    let db = new sqlite3.Database("./" + kode + ".mbtiles");
    db.get(sql, [zoom, column, row], (err, record) => {
      if (err) return reject(err);
      resolve(record ? record.tile_data : null);
      db.close();
    });
  });
}

module.exports = { readTile };
