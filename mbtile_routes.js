const { readTile } = require("./mbtileReader");
const log = require("log-less-fancy")();
const pjson = require("./package.json");
const getFormat = require("./tileformat");
const { addUrl } = require("./addUrl");
const { toGeoJson } = require("./protobuf");

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

	app.get("/all", (req, res) => {
		res.json({ version: pjson.version, tilesets: addUrl(index, req) });
	});
	app.get("/MBTiles_metadata.json", (req, res) => {
		res.json(index.jsonSummary());
	});
	app.get("*/:z(\\d+)/:x(\\d+)/:y(\\d+)/json", (req, res, next) => {
		// Sample http://localhost:8000/vector/AO/2/2/1/json
		const { z, x, y } = req.params;
		const file = req.params[0];
		const metadata = index.get(file).node;
		if (!metadata) return next();
		readTile(metadata.file.path, z, x, y)
			.then(blob => {
				if (!blob) return res.status(404);
				const geojson = toGeoJson(x, y, z, blob);
				res.setHeader("Content-Type", "application/json");
				res.json(geojson);
			})
			.catch(e => {
				log.error(e);
				res.status(500).send(e.message);
				res.end();
			});
	});
	app.get("*/:z(\\d+)/:x(\\d+)/:y(\\d+)", (req, res, next) => {
		const { z, x, y } = req.params;
		const file = req.params[0];
		const metadata = index.get(file).node;
		if (!metadata) return next();
		const format = getFormat(metadata.mbtiles);
		readTile(metadata.file.path, z, x, y)
			.then(blob => {
				res.setHeader("Content-Type", format.contentType);
				if (format.contentEncoding)
					res.setHeader("Content-Encoding", format.contentEncoding);
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

	app.get("*?", (req, res, next) => {
		const path = req.params[0];
		index.generateListing(path).then(listing => {
			if (!listing) return next();
			res.setHeader("Content-Type", "text/html");

			res.send(listing);
		});
	});
};
