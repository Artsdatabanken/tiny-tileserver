const fs = require("fs");
var path = require("path");
const fileformat = require("../fileformat");

class Index {
  constructor(rootDir) {
    this.rootDir = rootDir;
  }

  async get(path, query) {
    const cursor = {
      physicalDir: this.rootDir,
      fileRelPath: "",
      pathSegments: this.parsePath(path),
      type: "directory",
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
