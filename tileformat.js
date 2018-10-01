const log = require("log-less-fancy")();

const formats = {
	pbf: {
		contentType: "application/x-protobuf",
		extension: "pbf"
	},
	png: { contentType: "image/png", extension: "png" },
	jpg: { contentType: "image/jpg", extension: "jpg" }
};

function getFormatSettings(formatstring) {
	const format = formats[formatstring];
	if (format) return format;
	log.warn(
		"Unknown mbtiles format specified in metadata table: " + formatstring
	);
	return {};
}

module.exports = getFormatSettings;
