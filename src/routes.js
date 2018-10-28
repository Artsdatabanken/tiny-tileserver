const { browse } = require("./html");
const { getCompression } = require("./protobuf");
const path = require("path");
const { jsonSummary } = require("./jsonsummary");

module.exports = function(app, rootDirectory, index) {
  app.get("/MBTiles_metadata.json", (req, res) => {
    res.json(jsonSummary(index.index));
  });

  app.get("*?", (req, res, next) => {
    const query = req.params[0] || "";
    const parsed = path.parse(query);
    const relPath = path.join(parsed.dir, parsed.name);
    index
      .get(relPath, parsed.ext)
      .then(node => {
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
      })
      .catch(err => {
        next(err);
      });
  });
};
