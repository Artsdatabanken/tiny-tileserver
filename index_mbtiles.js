const log = require("log-less-fancy")()
const { readMetadata } = require("./mbtileReader")
const { mapMetadata } = require("./metadata")
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
              ...walkSync(path.join(dir, file), filelist, mapFile)
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
    delete mbmeta.name
    meta.mbtiles = mbmeta
  })
}

function readFormatSpecificMetadata(dir, file) {
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

function mapFile(dir, file) {
  const filepath = path.join(dir, file)
  return readFormatSpecificMetadata(dir, file)
}

let x = "abc"
function function2() {
  console.log(x.gradient.BS_6SE)
}

function index(mbtilesPath) {
  setTimeout(function2, 2000)
  x = walkSync(mbtilesPath, {}, mapFile)
  const index = {}
  fs.readdirSync(mbtilesPath)
    .map(file => path.join(mbtilesPath, file))
    .filter(file => {
      return fs.statSync(file).isFile() && path.extname(file) === ".mbtiles"
    })
    .reduce((acc, file) => {
      readMetadata(file).then(meta => {
        if (meta.error) {
          log.warn(file + ": " + meta.error.message)
          meta = { error: meta.error.message }
        }

        const name = path.parse(file).name
        delete meta.json
        index[path.basename(name)] = mapMetadata(meta)
      })

      return acc
    }, {})
  return index
}

module.exports = index
