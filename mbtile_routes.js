const path = require("path")
const { readTile, readMetadata } = require("./mbtileReader")
const { createMetadata } = require("./metadata")
const log = require("log-less-fancy")()
var pjson = require("./package.json")

module.exports = function(app, rootDirectory, index) {
  app.use((req, res, next) => {
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    )
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Cache-Control", "public, immutable, max-age=31557600") // 1 year
    next()
  })
  app.get("/", (req, res, next) => {
    res.json({ version: pjson.version, tilesets: index })
  })
  app.get("/:file", (req, res, next) => {
    readMetadata(path.join(rootDirectory, req.params.file + ".mbtiles"))
      .then(metadata => res.json(createMetadata(metadata)))
      .catch(next)
  })
  app.get("/:file/:z/:y/:x", (req, res, next) => {
    const parts = req.url.split("/")
    const { z, x, y } = req.params
    const file = path.join(rootDirectory, req.params.file + ".mbtiles")
    const metadata = index[file]
    if (!metadata) {
      res.status(404)
      res.end()
      return
    }
    const format = getFormat(metadata)
    readTile(file, z, x, y)
      .then(blob => {
        res.setHeader("Content-Type", format.contentType)
        if (blob) {
          if (format.gzip) res.setHeader("Content-Encoding", "gzip")
          res.end(Buffer.from(blob, "binary"))
        } else
          res.sendFile(path.join(rootDirectory, "empty." + format.extension))
      })
      .catch(e => {
        log.error(e)
        res.status(500)
        res.end()
      })
  })
}

function getFormat(metadata) {
  switch (metadata.format) {
    case "pbf":
      return {
        contentType: "application/x-protobuf",
        extension: "pbf",
        gzip: true
      }
    case "png":
      return { contentType: "image/png", extension: "png" }
    default:
      log.warn("Unknown mbtiles format: " + metadata[file])
      return {}
  }
}
