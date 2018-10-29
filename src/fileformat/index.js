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
  const handler = formats[type];
  if (!handler) throw new Error("No handler for type " + type);
  return handler;
}

function indexContents(type, path, meta) {
  const handler = getHandler(type);
  return handler.indexContents(path, meta);
}

async function get(node, fragment, ext) {
  const handler = getHandler(node.type);
  return await handler.get(node, fragment, ext);
}

function getTypeFromFileExt(ext) {
  if (formats[ext]) return ext;
  return "file";
}

module.exports = { get, indexContents, getTypeFromFileExt };
