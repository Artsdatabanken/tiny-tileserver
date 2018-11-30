const { readTile, readMetadata, listFiles } = require("./mbtileReader");
const { toGeoJson, getCompression } = require("./pbf/protobuf");
const { decodePbf } = require("./pbf/pbf_dump");
const getFormat = require("./tileformat");
const { toObject } = require("../../object");
const fs = require("fs");

function list(type, fileext, items, baseUrl) {
  const files = items.map(item => {
    const f1 = Object.values(item)[0].toString();
    const r = {
      filesize: item.size,
      fileext: type,
      name: f1 + fileext,
      link: f1
    };
    if (fileext === ".pbf")
      r.alternateFormats = {
        geojson: f1 + ".geojson",
        pbfjson: f1 + ".pbfjson"
      };
    return r;
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
        return await list(
          ["zoom", "column", "row"][fragment.length],
          ["", "", "." + node.content.format][fragment.length],
          raw,
          node.link
        );
      case 3:
        const format = getFormat(node.content.format);
        const buffer = await readTile(path, ...fragment);
        if (!buffer)
          return {
            buffer: format.emptyFile,
            contentType: format.contentType
          };

        const [z, x, y] = fragment;
        return this.makeFormat(buffer, ext, format, z, x, y);
    }
  }

  async readFile(path) {
    return new Promise((resolve, reject) =>
      fs.readFile(path, (err, data) => {
        if (err) reject(err);
        resolve(data);
      })
    );
  }

  makeFormat(buffer, ext, format, z, x, y) {
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
