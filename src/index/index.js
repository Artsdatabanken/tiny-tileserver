const log = require("log-less-fancy")();
const mbTileReader = require("../mbtileReader");
const sqliteReader = require("../sqliteReader");
const fs = require("fs");
var path = require("path");
const fileformat = require("../fileformat");

const walkSync = (dir, filelist = {}, mapFile) =>
  fs
    .readdirSync(dir)
    .map(
      file =>
        fs.statSync(path.join(dir, file)).isDirectory()
          ? {
              name: file,
              type: "directory",
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
    type: fileformat.getTypeFromFileExt(ext.substring(1)),
    fileext: parsed.ext,
    filepath: filepath,
    filesize: stat.size,
    filemodified: stat.mtime
  };
  fileformat.indexContents(meta.type, filepath, meta);
  return meta;
}

class Index {
  constructor(index) {
    this.index = index;
  }

  jsonSummarySubtree(node, path, target) {
    if (node.type === "directory") {
      Object.keys(node.files).forEach(file =>
        this.jsonSummarySubtree(node.files[file], path + "/" + file, target)
      );
      return;
    }

    const content = node.content || {};
    target[path] = { ...content, modified: node.filemodified };
  }

  jsonSummary() {
    const r = {};
    this.jsonSummarySubtree(this.index, "", r);
    return r;
  }

  async get(relativePath, ext) {
    console.log(relativePath, ext);
    return new Promise((resolve, reject) => {
      this.get2(relativePath, ext).then(node => {
        resolve(node);
      });
    });
  }

  async get2(relativePath, ext) {
    if (!relativePath) return null;
    const parts = relativePath.replace(/\/$/, "").split("/");
    let node = this.index;
    while (true) {
      if (parts.length === 0) return node;
      const part = parts.shift();
      node = await fileformat.get(node, part);
      if (node.type !== "directory") break;
    }
    return await fileformat.get(node, parts, ext);
  }
}

function index(rootDirectory) {
  const index = walkSync(rootDirectory, {}, mapFile);
  return new Index({ type: "directory", files: index });
}

module.exports = index;
