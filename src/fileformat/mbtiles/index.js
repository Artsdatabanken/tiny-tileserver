const { readTile, readMetadata, listFiles } = require("./mbtileReader");
const { toGeoJson, getCompression } = require("./pbf/protobuf");
const { decodePbf } = require("./pbf/pbf_dump");
const { toObject } = require("../../object");
const fs = require("fs");
const tilejson = require("./tilejson");
const mbtilesFormats = require("./mbtilesFormats");

class Index {
  list(cursor, level, fileext, items) {
    const files = items.map(item => {
      const f1 = Object.values(item)[0].toString();
      const r = {
        filesize: item.size,
        name: f1,
        link: f1
      };
      if (fileext === "pbf")
        r.alternateFormats = {
          geojson: f1 + "?geojson",
          pbfjson: f1 + "?pbfjson"
        };
      return r;
    });
    if (level == "zoom")
      files.push({
        name: "tilejson.json"
      });
    cursor.canBrowse = true;
    cursor.files = files;
  }

  async load(cursor) {
    const fragment = cursor.pathSegments;
    if (fragment.join("/") === "tilejson.json") return tilejson(cursor);
    const path = cursor.physicalDir;
    const format = await mbtilesFormats.getContentDescription(
      cursor.physicalDir
    );
    switch (fragment.length) {
      case 0:
      case 1:
      case 2:
        const raw = await listFiles(path, fragment);
        await this.list(
          cursor,
          ["zoom", "column", "row"][fragment.length],
          ["", "", format.extension][fragment.length],
          raw
        );
        break;
      case 3:
        const buffer = await readTile(path, ...fragment);
        if (!buffer) {
          cursor.buffer = format.emptyFile;
          cursor.contentType = format.contentType;
          return;
        }
        const [z, x, y] = fragment;
        const response = this.makeFormat(buffer, cursor.query, format, z, x, y);
        cursor.contentType = response.contentType;
        cursor.buffer = response.buffer;
    }
  }

  makeFormat(buffer, query, format, z, x, y) {
    const ext = Object.keys(query)[0];
    switch (ext) {
      case "pbfjson":
        return {
          contentType: "application/json",
          buffer: decodePbf(buffer)
        };
      case "json":
        return {
          contentType: "application/json",
          buffer: toGeoJson(x, y, z, buffer)
        };
      case "geojson":
        return {
          contentType: "application/json",
          buffer: toGeoJson(x, y, z, buffer)
        };
      default:
        if (!format) throw new Error("Unknown format: " + ext);
        return {
          contentType: format.contentType,
          buffer: buffer
        };
    }
  }
}

module.exports = Index;
