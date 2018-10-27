function readMbtilesMeta(filepath, meta) {
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

module.exports = { readMbtilesMeta };
