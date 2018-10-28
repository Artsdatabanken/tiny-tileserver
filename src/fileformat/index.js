const log = require("log-less-fancy")();
const MbTilesHandler = require("./mbtiles");
const SqliteHandler = require("./sqlite");
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

function get(node, fragment, ext) {
  return new Promise((resolve, reject) => {
    const handler = getHandler(node.type);
    handler
      .get(node, fragment, ext)
      .then(r => {
        resolve(r);
      })
      .catch(err => {
        log.error(err);
      });
  });
}

function listFiles(type, path, fragment) {
  const handler = getHandler(type);
  return handler.listFiles(path, fragment);
}

function getTypeFromFileExt(ext) {
  if (formats[ext]) return ext;
  return "file";
}

module.exports = { get, listFiles, indexContents, getTypeFromFileExt };
