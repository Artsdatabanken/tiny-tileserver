const log = require("log-less-fancy")();
const sqlite3 = require("sqlite3"); //.verbose();

function safe(arg) {
  return arg.replace(/[^0-9a-z]/gi, "");
}

async function read(file, table, key) {
  log.info(`Read key ${key} from ${table} in file ${file}`);
  const rows = await execute(
    file,
    "SELECT verdi from " + safe(table) + " WHERE kode=?",
    [key]
  );
  if (rows.length !== 1) return null;
  const row = rows[0];
  return row[Object.keys(row)[0]];
}

async function listRows(file, table) {
  return await execute(file, "SELECT kode FROM " + safe(table) + " LIMIT 10");
}

async function listTables(file, filter) {
  return await execute(
    file,
    "SELECT name FROM sqlite_master WHERE type IN ('table','view') AND name NOT LIKE 'sqlite_%' ORDER BY 1"
  );
}

async function getColumns(file, table) {
  const records = await execute(
    file,
    "PRAGMA table_info('" + safe(table) + "')"
  );
  return records.map(rec => rec.name);
}

function execute(file, sql, args) {
  log.info("Open " + file);
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

module.exports = { read, listTables, listRows, getColumns };
