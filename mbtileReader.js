const log = require("log-less-fancy")();
const sqlite3 = require("sqlite3"); //.verbose();

function readTile(file, zoom, column, row) {
	return new Promise((resolve, reject) => {
		let dbRow = Math.pow(2, zoom) - 1 - row;
		log.info(`Read tile ${zoom},${column},${dbRow} from ${file}`);
		const sql =
      "SELECT tile_data from tiles WHERE zoom_level=? AND tile_column=? AND tile_row=?";
		const db = new sqlite3.Database(file, sqlite3.OPEN_READONLY, err => {
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
		const db = new sqlite3.Database(file, sqlite3.OPEN_READONLY, error => {
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
		});
	});
}

module.exports = { readTile, readMetadata };