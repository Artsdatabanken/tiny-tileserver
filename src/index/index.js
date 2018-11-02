const fs = require("fs");
var path = require("path");
const fileformat = require("../fileformat");
const { toObject } = require("../object");

const walkSync = (dir, filelist = {}, mapFile) =>
  toObject(
    fs.readdirSync(dir).map(
      file =>
        fs.statSync(path.join(dir, file)).isDirectory()
          ? {
              name: file,
              type: "directory",
              link: file,
              files: walkSync(path.join(dir, file), filelist, mapFile)
            }
          : mapFile(dir, file)
    )
  );

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
  if (meta.type === "mbtiles") {
    meta.alternateFormats = {
      mbtiles: parsed.base
    };
  }
  fileformat.indexContents(meta.type, filepath, meta);
  return meta;
}

class Index {
  constructor(index) {
    this.index = index;
  }

  async get(relativePath, ext) {
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
      if (!node) return null;
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
