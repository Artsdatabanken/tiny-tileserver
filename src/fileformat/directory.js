const fs = require("fs");
var path = require("path");

const statFile = path =>
  new Promise((res, rej) => {
    fs.stat(path, (err, data) => {
      if (err) res({ error: err });
      else res(data);
    });
  });

class DirectoryHandler {
  async load(cursor) {
    if (!cursor.browseFiles)
      if (await this.loadIndexHtml(cursor)) return cursor;
    return this.browseFiles(cursor);
  }

  async loadIndexHtml(cursor) {
    const indexFile = path.join(cursor.physicalDir, "index.html");
    const stat = await statFile(indexFile);
    if (stat.error) return false;
    cursor.stat = stat;
    cursor.physicalDir = indexFile;
    cursor.type = "html";
    cursor.contentType = "text/html";
    cursor.canBrowse = false;
    return true;
  }

  browseFiles(cursor) {
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
      if (stat.isDirectory()) record.type = "directory";
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
