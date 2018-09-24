const path = require("path");
const { readTile, readMetadata } = require("./mbtileReader");
const { createMetadata } = require("./metadata");
const log = require("log-less-fancy")();
const pjson = require("./package.json");
const getFormat = require("./tileformat");
const { addUrl } = require("./addUrl");

module.exports = function(app, rootDirectory, index) {
	app.use((req, res, next) => {
		res.setHeader(
			"Access-Control-Allow-Headers",
			"Origin, X-Requested-With, Content-Type, Accept"
		);
		res.setHeader("Access-Control-Allow-Origin", "*");
		res.setHeader("Cache-Control", "public, immutable, max-age=31557600"); // 1 year
		next();
	});
	app.get("/", (req, res, next) => {
		res.json({ version: pjson.version, tilesets: addUrl(index, req) });
	});
	app.get("/bounds", (req, res) => {
		res.json(
			Object.entries(index).map(e => {
				return Object.assign({ name: e[0] }, e[1]);
			})
		);
	});
	app.get("/:file/:z/:x/:y", (req, res) => {
		const { file, z, x, y } = req.params;
		const mbtilePath = path.join(rootDirectory, req.params.file + ".mbtiles");
		const metadata = index[file];
		if (!metadata) {
			res.status(404).send("Can not find tile set " + mbtilePath);
			res.end();
			return;
		}
		const format = getFormat(metadata);
		readTile(mbtilePath, z, x, y)
			.then(blob => {
				res.setHeader("Content-Type", format.contentType);
				res.setHeader("Content-Encoding", "gzip");
				if (blob) {
					res.end(Buffer.from(blob, "binary"));
				} else
					res.sendFile("data/empty." + format.extension, { root: __dirname });
			})
			.catch(e => {
				log.error(e);
				res.status(500).send(e.message);
				res.end();
			});
	});
};
