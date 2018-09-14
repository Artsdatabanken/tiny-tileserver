const express = require("express");
const mbTileReader = require("./mbTileReader");
const log = require("log-less-fancy")();

const app = express();
const port = 8000;

require("./mbtile_routes")(app);

app.listen(port, () => {
  log.info("Server listening on port " + port);
});
