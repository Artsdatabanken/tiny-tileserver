const fs = require("fs");
var path = require("path");
const fileformat = require("../fileformat");

const statFile = path =>
  new Promise((res, rej) => {
    fs.stat(path, (err, data) => {
      if (err) res({ error: err });
      else res(data);
    });
  });

class DirectoryHandler {
  async load(cursor) {
    const files = fs.readdirSync(cursor.physicalDir);
    const entries = files.map(file => {
      const fullPath = path.join(cursor.physicalDir, file);
      const ext = path.parse(fullPath).ext;
      const stat = fs.statSync(fullPath);
      const record = {
        name: file,
        modified: stat.mtime,
        size: stat.size,
        canBrowse: ext && ".sqlite.mbtiles".indexOf(ext) >= 0
      };
      if (stat.nlink > 0) record.type = "directory";
      if (ext === ".mbtiles") {
        record.alternateFormats = {
          tilejson: file + "?tilejson"
        };
      }
      return record;
    });
    cursor.files = entries;
    cursor.canBrowse = true;
  }

  async navigate(cursor) {
    const segment = cursor.pathSegments.shift();
    cursor.name = segment;
    cursor.fileRelPath += "/" + segment;
    cursor.physicalDir = path.join(cursor.physicalDir, segment);
    cursor.stat = null;
    await this.getStat(cursor);
    const stat = cursor.stat;
    if (stat.error) {
      cursor.notfound = true;
      return;
    }
    if (!stat.isDirectory()) {
      cursor.type = this.detectFiletype(segment);
      cursor.final = true;
    }
  }

  async getStat(cursor) {
    cursor.stat = cursor.stat || (await statFile(cursor.physicalDir));
  }

  detectFiletype(filename) {
    return path.parse(filename).ext.substring(1);
  }
}

module.exports = DirectoryHandler;
