const { readTile } = require("./mbTileReader");
const log = require("log-less-fancy")();
module.exports = function(app) {
  app.use((req, res, next) => {
    //    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
  });
  app.get("*", (req, res, next) => {
    const parts = req.url.split("/");
    const [empty, kode, z, y, x] = parts;
    log.info({ kode, z, y, x });
    readTile(kode, z, y, x)
      .then(blob => {
        if (blob) res.end(new Buffer(blob, "binary"));
        else res.sendFile(__dirname + "/png-transparent.png");
      })
      .catch(next);
  });
};
