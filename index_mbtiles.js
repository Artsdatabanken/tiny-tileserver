const log = require("log-less-fancy")();
const { readMetadata } = require("./mbtileReader");
const { mapMetadata } = require("./metadata");
const fs = require("fs");
var path = require("path");

function index(mbtilesPath) {
	const index = {};
	fs.readdirSync(mbtilesPath)
		.map(file => path.join(mbtilesPath, file))
		.filter(file => {
			return fs.statSync(file).isFile() && path.extname(file) === ".mbtiles";
		})
		.reduce((acc, file) => {
			readMetadata(file).then(meta => {
				if (meta.error) {
					log.warn(file + ": " + meta.error.message);
					meta = { error: meta.error.message };
				}

				const name = path.parse(file).name;
				delete meta.json;
				index[path.basename(name)] = mapMetadata(meta);
			});

			return acc;
		}, {});
	return index;
}

module.exports = index;
