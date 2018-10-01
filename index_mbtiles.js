const log = require("log-less-fancy")()
const { readMetadata, listFiles } = require("./mbtileReader")
const fs = require("fs")
var path = require("path")

const template = fs.readFileSync("index.html", "utf8")

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
    file: {
      ext: parsed.ext,
      file: parsed.base,
      path: filepath,
      size: stat.size,
      modified: stat.mtime
    }
  }
  switch (ext) {
    case ".mbtiles":
      readMbtilesMeta(filepath, meta)
  }
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

    const mbtiles = node.mbtiles
    if (!mbtiles) return
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

  htmlRow(url, file, ext, size, modified, extra) {
    return `<tr><td><a href="${url}">${file}</a></td><td>${ext}</td><td class="right">${size}</td><td>${modified &&
      modified.toISOString()}</td><td>${extra}</td></tr>`
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
      const fn = row[Object.keys(row)[0]]
      files[fn] = {
        file: {
          isDirectory: isDirectory,
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

  async generateListing(relativePath) {
    let { node, fragment } = this.get(relativePath)
    if (!node) return null
    if (!node.isDirectory) {
      node = await this.listFileContent(node, fragment)
    }
    if (!node) return null
    if (node.isDirectory) {
      const htmlFragment = Object.keys(node.files)
        .map(key => {
          const item = node.files[key]
          if (item.isDirectory)
            return this.htmlRow(key, "directory", "", "", "")
          const mbtiles = item.mbtiles
          return this.htmlRow(
            relativePath + "/" + key,
            key,
            item.file.ext,
            item.file.size,
            item.file.modified,
            mbtiles
              ? `${mbtiles.format}, zoom ${mbtiles.minzoom} - ${
                  mbtiles.maxzoom
                }`
              : ""
          )
        })
        .join("\n")
      return template.replace("$rows", htmlFragment)
    }
    return `<pre>${JSON.stringify(node.mbtiles, null, 2)}</pre>`
  }
}

function index(mbtilesPath) {
  const index = walkSync(mbtilesPath, {}, mapFile)
  return new Index({ isDirectory: true, files: index })
}

module.exports = index
