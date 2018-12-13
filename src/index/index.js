const fs = require("fs");
var path = require("path");
const fileformat = require("../fileformat");
const { toObject } = require("../object");

function mapFile(dir, file) {
  const ext = path.extname(file).toLowerCase();
  const filepath = path.join(dir, file);
  const parsed = path.parse(file);
  const stat = fs.statSync(filepath);
  const meta = {
    name: parsed.base,
    link: parsed.base,
    type: fileformat.getTypeFromFileExt(ext.substring(1)),
    fileext: parsed.ext,
    filepath: filepath,
    filesize: stat.size,
    canBrowse: stat.isDirectory(),
    filemodified: stat.mtime
  };
  fileformat.indexContents(meta.type, filepath, meta);
  return meta;
}

class Index {
  constructor(rootDir) {
    this.rootDir = rootDir;
  }

  async get(path, query) {
    const cursor = {
      physicalDir: this.rootDir,
      fileRelPath: "",
      pathSegments: this.parsePath(path),
      query: query
    };
    while (cursor.pathSegments.length > 0) {
      await fileformat.navigate(cursor);
      if (cursor.final) break;
      if (cursor.notfound) return null;
    }
    await this.load(cursor);
    return cursor;
  }

  parsePath(relativePath) {
    if (!relativePath) return [];
    const parts = relativePath.split("/");
    while (parts.length > 0 && parts[0] == "") parts.shift();
    if (parts[parts.length - 1] === "") parts.pop();
    return parts;
  }

  async load(cursor) {
    await fileformat.load(cursor);
  }
}

module.exports = Index;
