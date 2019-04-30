const log = require("log-less-fancy")();
const { dball } = require("../../sqlite");

async function readTile(file, zoom, column, row) {
  let dbRow = Math.pow(2, zoom) - 1 - row;
  log.info(`Read tile ${zoom},${column},${dbRow} from ${file}`);
  const sql =
    "SELECT tile_data from tiles WHERE zoom_level=? AND tile_column=? AND tile_row=?";
  const records = await dball(file, sql, [zoom, column, dbRow]);
  if (records.length !== 1) return null;
  const record = records[0];
  return record && record.tile_data;
}

async function readMetadata(file) {
  const sql = "SELECT name, value from metadata";
  const records = await dball(file, sql);
  const meta = records.reduce((acc, row) => {
    acc[row.name] = row.value;
    return acc;
  }, {});
  return meta;
}

async function listFiles(file, filter) {
  if (filter.length > 2) return null;
  const sql = {
    0: "SELECT DISTINCT zoom_level FROM tiles",
    1: "SELECT DISTINCT tile_column FROM tiles WHERE zoom_level=?",
    2: "SELECT (2 << zoom_level - 1) - 1 - tile_row AS row, length(tile_data) AS size FROM tiles WHERE zoom_level=? AND tile_column=?"
  };
  return await dball(file, sql[filter.length], filter);
}

module.exports = { readTile, readMetadata, listFiles };
