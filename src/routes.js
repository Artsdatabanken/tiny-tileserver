const { readTile } = require("./mbtileReader");
const pjson = require("../package.json");
const getFormat = require("./tileformat");
const { generateListing, browse } = require("./html");
const { toGeoJson, getCompression } = require("./protobuf");
const { decodePbf } = require("./pbf_dump");
const { get } = require("./fileformat");
const path = require("path");

module.exports = function(app, rootDirectory, index) {
  app.get("/MBTiles_metadata.json", (req, res) => {
    res.json(index.jsonSummary());
  });

  app.get("xx*/:z(\\d+)/:x(\\d+)/:y(\\d+)(/|.?):format?", (req, res, next) => {
    // Sample http://localhost:8000/vector/AO/2/2/1/json
    const { z, x, y } = req.params;
    const format = (req.params.format || "pbf").toLowerCase();
    const file = req.params[0];
    const metadata = index.get(file).node;
    if (!metadata) return next();
    readTile(metadata.file.path, z, x, y)
      .then(blob => {
        switch (format) {
          case "json":
          case "geojson": {
            if (!blob) return res.status(404).send("404 Not found");
            const geojson = toGeoJson(x, y, z, blob);
            res.setHeader("Content-Type", "application/json");
            res.json(geojson);
            break;
          }
          case "pbfjson":
            if (!blob) return res.status(404).send("404 Not found");
            res.json(decodePbf(blob));
            break;
          case "pbf": {
            const format = getFormat(metadata.content.format);
            res.setHeader("Content-Type", format.contentType);
            if (blob) {
              const compression = getCompression(blob);
              if (compression) res.setHeader("Content-Encoding", compression);
              res.end(Buffer.from(blob, "binary"));
            } else {
              res.sendFile("data/empty." + format.extension, {
                root: __dirname
              });
            }
            break;
          }
          default:
            return next();
        }
      })
      .catch(e => next(e));
  });

  app.get("*?", (req, res, next) => {
    const query = req.params[0] || "";
    const parsed = path.parse(query);
    const relPath = path.join(parsed.dir, parsed.name);
    index.get(relPath, parsed.ext).then(node => {
      if (!node) return next();
      if (node.type === "directory") {
        const listing = browse(node.files, relPath);
        if (!listing) return next();
        res.setHeader("Content-Type", "text/html");
        res.send(listing);
      } else {
        res.setHeader("Content-Type", node.contentType);
        const compression = getCompression(node.buffer);
        if (compression) res.setHeader("Content-Encoding", compression);
        res.send(node.buffer);
      }
    });
    //      .catch(err => {
    //      throw new Error(err);
    //  });
  });
};
