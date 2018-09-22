const path = require("path");
const express = require("express");
const log = require("log-less-fancy")();
const minimist = require("minimist");
const mbtile_routes = require("./mbtile_routes");
const index_mbtiles = require("./index_mbtiles");

var argv = minimist(process.argv.slice(2), { alias: { p: "port" } });
if (argv._.length !== 1) {
	console.log("Usage: node tiny-tileserver.js [options] [rootDirectory]");
	console.log("");
	console.log("rootDirectory    Data directory containing .mbtiles");
	console.log("");
	console.log("Options:");
	console.log("   -p PORT --port PORT       Set the HTTP port [8000]");
	console.log("");
	console.log("A root directory is required.");
	process.exit(1);
}

const app = express();
const port = argv.port || 8000;
const rootDirectory = path.resolve(argv._[0] || ".");
app.use(express.static(rootDirectory, { maxAge: 86400000, immutable: true }));
app.use(express.static("data", { maxAge: 86400000, immutable: true }));

const index = index_mbtiles(rootDirectory);
mbtile_routes(app, rootDirectory, index);

app.listen(port, () => {
	log.info("Server root directory " + rootDirectory);
	log.info("Server listening on port " + port);
});
