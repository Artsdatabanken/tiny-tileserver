const { browse } = require("./html");
const { getCompression } = require("./fileformat/mbtiles/pbf/protobuf");

module.exports = function (app, index) {
  app.get("*?", (req, res, next) => {
    index
      .get(decodeURIComponent(req.path), req.query, req.headers.host)
      .then((node) => {
        if (!node) return next();
        if (node.canBrowse) browse(node, req.path);
        if (node.contentType === "empty") {
          if ("nohttp204" in req.query) {
            // Hack for Leaflet as it reports errors on HTTP 204 response
            node.contentType = "image/png";
            const emptyPng =
              "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
            node.buffer = Buffer.from(emptyPng, "base64");
          } else return res.status(204).send("No Content");
        }
        if (!node.contentType) return next();
        res.setHeader("Content-Type", node.contentType);
        if (!node.buffer) return res.sendFile(node.physicalDir);

        const compression = getCompression(node.buffer);
        if (compression) res.setHeader("Content-Encoding", compression);
        res.send(node.buffer);
      })
      .catch((err) => {
        next(err);
      });
  });
};
