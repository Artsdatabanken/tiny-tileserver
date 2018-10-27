const log = require("log-less-fancy")();
const mbTileReader = require("../mbtileReader");
const sqliteReader = require("../sqliteReader");
const fs = require("fs");
var path = require("path");
const readMbtilesMeta = require("./mbtiles");
const { readSqliteMeta } = require("./sqlite");

const walkSync = (dir, filelist = {}, mapFile) =>
  fs
    .readdirSync(dir)
    .map(
      file =>
        fs.statSync(path.join(dir, file)).isDirectory()
          ? {
              name: file,
              isDirectory: true,
              files: walkSync(path.join(dir, file), filelist, mapFile)
            }
          : mapFile(dir, file)
    )
    .reduce((o, item) => {
      o[item.name] = item;
      return o;
    }, {});

function mapFile(dir, file) {
  const ext = path.extname(file).toLowerCase();
  const filepath = path.join(dir, file);
  const parsed = path.parse(file);
  const stat = fs.statSync(filepath);
  const meta = {
    name: parsed.name,
    link: parsed.base.replace(".mbtiles", "").replace(".sqlite", ""),
    content: {
      format: ext.substring(1)
    },
    file: {
      ext: parsed.ext,
      path: filepath,
      size: stat.size,
      modified: stat.mtime
    }
  };
  switch (ext) {
    case ".mbtiles":
      readMbtilesMeta(filepath, meta);
      break;
    case ".sqlite":
      readSqliteMeta(filepath, meta);
      break;
  }
  return meta;
}

class Index {
  constructor(index) {
    this.index = index;
  }

  jsonSummarySubtree(node, path, target) {
    if (node.isDirectory) {
      Object.keys(node.files).forEach(file =>
        this.jsonSummarySubtree(node.files[file], path + "/" + file, target)
      );
      return;
    }

    const content = node.content || {};
    target[path] = { ...content, modified: node.file.modified };
  }

  jsonSummary() {
    const r = {};
    this.jsonSummarySubtree(this.index, "", r);
    return r;
  }

  get(relativePath) {
    if (!relativePath) return { node: null };
    const parts = relativePath.replace(/\/$/, "").split("/");
    let node = this.index;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (part) {
        if (node.isDirectory) {
          if (!node.files[part]) {
            return { node: null };
          } else node = node.files[part];
        } else {
          return { node: node, fragment: parts.slice(i) };
        }
      }
    }
    return { node: node, fragment: [] };
  }

  scanMbTiles(file, fragment) {
    switch (fragment.length) {
      case 1:
        mbtil;
    }
  }

  async listFileContent(node, fragment) {
    let list = [];
    let isDirectory = false;
    console.log(node);
    switch (node.file.ext) {
      case ".mbtiles":
        list = await mbTileReader.listFiles(node.file.path, fragment);
        isDirectory = fragment.length < 2;
        break;
      case ".sqlite":
        list = await sqliteReader.listFiles(node.file.path, fragment);
        break;
      default:
        return fragment.length === 0 ? node : null;
    }
    const files = list.reduce((files, row) => {
      const fn = row[Object.keys(row)[0]].toString();
      files[fn] = {
        isDirectory: isDirectory,
        name: fn,
        link: fn,
        file: {
          modified: node.file.modified,
          ext: isDirectory ? "" : node.content.format,
          size: isDirectory ? "" : row.size
        }
      };
      return files;
    }, {});
    node = { isDirectory: true, files: files };
    return node;
  }
}

function index(rootDirectory) {
  const index = walkSync(rootDirectory, {}, mapFile);
  return new Index({ isDirectory: true, files: index });
}

module.exports = index;
