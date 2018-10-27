const sqliteReader = require("../sqliteReader");

function readSqliteMeta(filepath, meta) {
  return {};
  /*  sqliteReader
    .readMetadata(filepath)
    .then(mbmeta => {
      if (mbmeta.error) {
        log.warn(file + ": " + mbmeta.error.message);
        meta.error = mbmeta.error.message;
      }

      delete mbmeta.json;
      meta.content = mbmeta;
    })
    .catch(error => (meta.error = error));*/
}

module.exports = { readSqliteMeta };
