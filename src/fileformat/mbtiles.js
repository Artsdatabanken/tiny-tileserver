const { readTile, readMetadata, listFiles } = require("../mbtileReader");
const { toGeoJson, getCompression } = require("../pbf/protobuf");
const { decodePbf } = require("../pbf/pbf_dump");
const getFormat = require("../tileformat");
const { toObject } = require("../object");

function list(type, items, baseUrl) {
  const files = items.map(item => {
    const f1 = item[Object.keys(item)[0]].toString();
    return {
      type: type,
      name: f1,
      link: f1
    };
  });
  return { type: "directory", files: toObject(files) };
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
        return list("mbtiles", raw, node.link);
      case 3:
        console.log(node);
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
}

module.exports = MbTilesHandler;
