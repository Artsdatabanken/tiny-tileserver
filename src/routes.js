const { browse } = require("./html");
const { getCompression } = require("./fileformat/mbtiles/pbf/protobuf");

module.exports = function(app, index) {
  app.get("*?", (req, res, next) => {
    index
      .get(decodeURIComponent(req.path), req.query)
      .then(node => {
        if (!node) return next();
        if (node.canBrowse) browse(node, req.path);
        if (!node.contentType) return next();
        res.setHeader("Content-Type", node.contentType);
        if (!node.buffer) return res.sendFile(node.physicalDir);

        const compression = getCompression(node.buffer);
        if (compression) res.setHeader("Content-Encoding", compression);
        res.send(node.buffer);
      })
      .catch(err => {
        next(err);
      });
  });
};
