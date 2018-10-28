const { readTile, readMetadata, listFiles } = require("../mbtileReader");

function list(type, items, baseUrl) {
  const files = items
    .map(item => {
      const f1 = item[Object.keys(item)[0]].toString();
      return {
        type: "sqlite",
        name: f1,
        link: f1
      };
    })
    .reduce((acc, c) => {
      acc[c.name] = c;
      return acc;
    }, {});
  return { type: "directory", files: files };
}

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

  async get(node, fragment) {
    console.log("node", node);
    console.log("frag", fragment);
    const path = node.filepath;
    switch (fragment.length) {
      case 0:
      case 1:
      case 2:
        const raw = await listFiles(path, fragment);
        return list(null, raw, node.link);
      case 3:
        const buffer = await readTile(path, ...fragment);
        if (!buffer) return null;
        const r = {
          contentType: "application/pbf",
          buffer: buffer
        };
        return r;
    }
    return null;
  }

  listFiles(path, fragment) {
    const r = {};
    if (fragment.length < 2) r.type = "directory";
    return r;
  }
}

module.exports = MbTilesHandler;
