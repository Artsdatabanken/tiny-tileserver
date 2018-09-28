const log = require("log-less-fancy")();

const formats = {
	pbf: {
		contentType: "application/x-protobuf",
		contentEncoding: "gzip",
		extension: "pbf"
	},
	png: { contentType: "image/png", extension: "png" },
	jpg: { contentType: "image/jpg", extension: "jpg" }
};

function getFormatSettings(metadata) {
	const format = formats[metadata.format];
	if (format) return format;
	log.warn(
		"Unknown mbtiles format specified in metadata table: " + metadata.format
	);
	return {};
}

module.exports = getFormatSettings;
