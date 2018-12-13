const log = require("log-less-fancy")();
const MbTilesHandler = require("./mbtiles/");
const SqliteHandler = require("./sqlite/");
const FileHandler = require("./file");
const DirectoryHandler = require("./directory");

const formats = {
  file: new FileHandler(),
  directory: new DirectoryHandler(),
  mbtiles: new MbTilesHandler(),
  sqlite: new SqliteHandler()
};

function getHandler(type) {
  if (!type) return formats["directory"];
  const handler = formats[type];
  if (!handler) throw new Error("No handler for type " + type);
  return handler;
}

function indexContents(type, path, meta) {
  const handler = getHandler(type);
  return handler.indexContents(path, meta);
}

async function load(cursor, fragment) {
  const handler = getHandler(cursor.type);
  return await handler.load(cursor, fragment);
}

async function navigate(cursor) {
  const handler = getHandler(cursor.type);
  return await handler.navigate(cursor);
}

function getTypeFromFileExt(ext) {
  if (formats[ext]) return ext;
  return "file";
}

module.exports = { load, navigate, getTypeFromFileExt };
