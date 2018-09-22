function createMetadata(metadataTemp) {
	let bounds = metadataTemp.bounds.split(",").map(b => parseFloat(b));

	return {
		format: metadataTemp.format,
		minzoom: parseInt(metadataTemp.minzoom),
		maxzoom: parseInt(metadataTemp.maxzoom),
		bounds: bounds
	};
}

module.exports = { createMetadata };
