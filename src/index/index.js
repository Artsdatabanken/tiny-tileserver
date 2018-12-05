const fs = require("fs");
var path = require("path");
const fileformat = require("../fileformat");
const { toObject } = require("../object");

const walkSync = (dir, filelist = {}, mapFile) =>
  toObject(
    fs.readdirSync(dir).map(file =>
      fs.statSync(path.join(dir, file)).isDirectory()
        ? {
            name: file,
            canBrowse: true,
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
  constructor(index) {
    this.index = index;
  }

  async get(relativePath) {
    if (!relativePath) return null;
    const parts = relativePath.split("/");
    while (parts.length > 0 && parts[0] == "") parts.shift();
    let node = this.index;
    while (true) {
      if (parts.length === 0) return node;
      const part = parts.shift();
      node = await fileformat.get(node, [part]);
      if (!node) return null;
      if (node.type) break;
    }

    if (parts[parts.length - 1] === "") parts.pop();
    const query = evictFileExtension(parts);
    return await fileformat.get(node, query.fragments, query.extension);
  }
}

// Move any file extension into a separate element
function evictFileExtension(parts) {
  const r = { fragments: [], extension: "" };
  if (parts.length < 1) return r;
  const fragments = [...parts];
  const final = fragments.pop();
  const [name, ext] = final.split(".");
  r.fragments = fragments.concat(name);
  r.extension = ext;
  return r;
}

function index(rootDirectory) {
  const index = walkSync(rootDirectory, {}, mapFile);
  index["MBTiles_metadata.json"] = {};
  return new Index({ canBrowse: true, files: index });
}

module.exports = index;
