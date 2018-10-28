const log = require("log-less-fancy")();
const { safe, dball } = require("../../sqlite");

async function read(file, table, key) {
  log.info(`Read key ${key} from ${table} in file ${file}`);
  const rows = await dball(
    file,
    "SELECT verdi from " + safe(table) + " WHERE kode=?",
    [key]
  );
  if (rows.length !== 1) return null;
  const row = rows[0];
  return row[Object.keys(row)[0]];
}

async function listRows(file, table) {
  return await dball(file, "SELECT kode FROM " + safe(table) + " LIMIT 100");
}

async function listTables(file, filter) {
  return await dball(
    file,
    "SELECT name FROM sqlite_master WHERE type IN ('table','view') AND name NOT LIKE 'sqlite_%' ORDER BY 1"
  );
}

async function getColumns(file, table) {
  const records = await dball(file, "PRAGMA table_info('" + safe(table) + "')");
  return records.map(rec => rec.name);
}

module.exports = { read, listTables, listRows, getColumns };
