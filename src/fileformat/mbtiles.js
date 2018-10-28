class MbTilesHandler {
  indexContents(filepath, meta) {
    readMetadata(filepath)
      .then(mbmeta => {
        if (mbmeta.error) {
          log.warn(file + ": " + mbmeta.error.message);
          meta.error = mbmeta.error.message;
        }

        delete mbmeta.json;
        meta.content = mbmeta;
      })
      .catch(error => (meta.error = error));
  }

  async get(path, fragment) {
    console.log("mbtiles");
    return "abc";
  }

  listFiles(path, fragment) {
    const r = {};
    if (fragment.length < 2) r.type = "directory";
    return r;
  }
}

module.exports = MbTilesHandler;
