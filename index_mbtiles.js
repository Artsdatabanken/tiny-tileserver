const log = require("log-less-fancy")()
const { readMetadata, listFiles } = require("./mbtileReader")
const fs = require("fs")
var path = require("path")

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
      o[item.name] = item
      return o
    }, {})

function readMbtilesMeta(filepath, meta) {
  readMetadata(filepath).then(mbmeta => {
    if (mbmeta.error) {
      log.warn(file + ": " + mbmeta.error.message)
      meta.error = mbmeta.error.message
    }

    delete mbmeta.json
    meta.mbtiles = mbmeta
  })
}

function mapFile(dir, file) {
  const ext = path.extname(file).toLowerCase()
  const filepath = path.join(dir, file)
  const parsed = path.parse(file)
  const stat = fs.statSync(filepath)
  const meta = {
    name: parsed.name,
    link: parsed.base.replace(".mbtiles", ""),
    file: {
      ext: parsed.ext,
      path: filepath,
      size: stat.size,
      modified: stat.mtime
    }
  }
  switch (ext) {
    case ".mbtiles":
      readMbtilesMeta(filepath, meta)
  }
  log.info(meta)
  return meta
}

class Index {
  constructor(index) {
    this.index = index
  }

  jsonSummarySubtree(node, path, target) {
    if (node.isDirectory) {
      Object.keys(node.files).forEach(file =>
        this.jsonSummarySubtree(node.files[file], path + "/" + file, target)
      )
      return
    }

    const mbtiles = node.mbtiles || {}
    target[path] = { ...mbtiles, modified: node.file.modified }
  }

  jsonSummary() {
    const r = {}
    this.jsonSummarySubtree(this.index, "", r)
    return r
  }

  get(relativePath) {
    const parts = relativePath.replace(/\/$/, "").split("/")
    let node = this.index
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      if (part) {
        if (node.isDirectory) {
          if (!node.files[part]) {
            return { node: null }
          } else node = node.files[part]
        } else {
          return { node: node, fragment: parts.slice(i) }
        }
      }
    }
    return { node: node, fragment: [] }
  }

  scanMbTiles(file, fragment) {
    switch (fragment.length) {
      case 1:
        mbtil
    }
  }

  async listFileContent(node, fragment) {
    if (node.file.ext !== ".mbtiles") {
      return fragment.length === 0 ? node : null
    }
    const list = await listFiles(node.file.path, fragment)
    const isDirectory = fragment.length < 2
    const files = list.reduce((files, row) => {
      const fn = row[Object.keys(row)[0]].toString()
      files[fn] = {
        isDirectory: isDirectory,
        name: fn,
        link: fn,
        file: {
          modified: node.file.modified,
          ext: isDirectory ? "" : node.mbtiles.format,
          size: isDirectory ? "" : row.size
        }
      }
      return files
    }, {})
    node = { isDirectory: true, files: files }
    return node
  }
}

function index(mbtilesPath) {
  const index = walkSync(mbtilesPath, {}, mapFile)
  return new Index({ isDirectory: true, files: index })
}

module.exports = index
