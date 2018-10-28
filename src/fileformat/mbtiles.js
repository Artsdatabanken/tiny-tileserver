const { readTile, readMetadata, listFiles } = require("../mbtileReader");
const { toGeoJson, getCompression } = require("../protobuf");
const { decodePbf } = require("../pbf_dump");
const getFormat = require("../tileformat");

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

  async get(node, fragment, ext) {
    ext = ext || ".pbf";
    const path = node.filepath;
    switch (fragment.length) {
      case 0:
      case 1:
      case 2:
        const raw = await listFiles(path, fragment);
        return list(null, raw, node.link);
      case 3:
        const buffer = await readTile(path, ...fragment);
        const format = getFormat(node.content.format);
        if (!buffer) {
          res.sendFile("data/empty." + format.extension, {
            root: __dirname
          });
          return;
        }
        const [z, x, y] = fragment;
        return this.makeFormat(buffer, ext, format, x, y, z);
    }
    return null;
  }

  makeFormat(buffer, ext, format, x, y, z) {
    switch (ext) {
      case ".pbf":
        return {
          contentType: format.contentType,
          buffer: buffer
        };
      case ".pbfjson":
        return {
          contentType: "application/json",
          buffer: decodePbf(buffer)
        };
      case ".json":
      case ".geojson":
        return {
          contentType: "application/json",
          buffer: toGeoJson(x, y, z, buffer)
        };
      default:
        return null;
    }
  }

  listFiles(path, fragment) {
    const r = {};
    if (fragment.length < 2) r.type = "directory";
    return r;
  }
}

module.exports = MbTilesHandler;
