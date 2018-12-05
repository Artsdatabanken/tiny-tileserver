const { browse } = require("./html");
const { getCompression } = require("./fileformat/mbtiles/pbf/protobuf");
const path = require("path");
const { jsonSummary } = require("./jsonsummary");

module.exports = function(app, rootDirectory, index) {
  app.get("/MBTiles_metadata.json", (req, res) => {
    res.json(jsonSummary(index.index));
  });

  app.get("*?", (req, res, next) => {
    const query = req.params[0] || "";
    const parsed = path.parse(query);
    const relPath = query;
    index
      .get(query)
      .then(node => {
        if (!node) return next();
        if (node.canBrowse) node = browse(node.files, relPath);
        res.setHeader("Content-Type", node.contentType);
        if (!node.buffer) {
          return res.sendFile(node.file, {
            root: __dirname
          });
        }
        const compression = getCompression(node.buffer);
        if (compression) res.setHeader("Content-Encoding", compression);
        res.send(node.buffer);
      })
      .catch(err => {
        next(err);
      });
  });
};
