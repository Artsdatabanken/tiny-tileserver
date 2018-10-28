const log = require("log-less-fancy")();
const sqlite3 = require("sqlite3"); //.verbose();

function safe(arg) {
  return arg.replace(/[^0-9a-z]/gi, "");
}

function read(file, table, key) {
  return new Promise((resolve, reject) => {
    log.info(`Read key ${key} from ${table} in file ${file}`);
    const sql = "SELECT verdi from " + safe(table) + " WHERE kode=?";
    const db = new sqlite3.Database(file, sqlite3.OPEN_READONLY, err => {
      if (err) return reject(err);
      db.get(sql, [key], (err, record) => {
        db.close();
        if (err) return reject(err);
        resolve(record && record.verdi);
      });
    });
  });
}

async function listRows(file, filter) {
  console.log(file, filter);
  return _listRows(file, filter);
}

function _listRows(file, table) {
  return new Promise((resolve, reject) => {
    log.info("Open " + file);
    const sql = "SELECT kode FROM " + safe(table) + " LIMIT 10";
    const db = new sqlite3.Database(file, sqlite3.OPEN_READONLY, err => {
      if (err) reject(err);
      db.all(sql, [], (err, records) => {
        db.close();
        if (err) reject(err);
        resolve(records);
      });
    });
  });
}

function listTables(file, filter) {
  log.info("Open " + file);
  return new Promise((resolve, reject) => {
    const sql =
      "SELECT name FROM sqlite_master WHERE type IN ('table','view') AND name NOT LIKE 'sqlite_%' ORDER BY 1";
    const db = new sqlite3.Database(file, sqlite3.OPEN_READONLY, err => {
      if (err) return reject(err);
      db.all(sql, filter, (err, records) => {
        db.close();
        if (err) return reject(err);

        resolve(records);
      });
    });
  });
}

function getColumns(file, table) {
  log.info("Open " + file);
  return new Promise((resolve, reject) => {
    const sql = "PRAGMA table_info('" + table + "')";
    const db = new sqlite3.Database(file, sqlite3.OPEN_READONLY, err => {
      if (err) return reject(err);
      db.all(sql, [], (err, records) => {
        db.close();
        if (err) return reject(err);
        const r = records.map(rec => rec.name);
        resolve(r);
      });
    });
  });
}

module.exports = { read, listTables, listRows, getColumns };
