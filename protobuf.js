var vt = require("vector-tile");
var Protobuf = require("pbf");
var zlib = require("zlib");

function toGeoJson(x, y, z, buffer) {
	// handle zipped buffers
	if (buffer[0] === 0x78 && buffer[1] === 0x9c) {
		buffer = zlib.inflateSync(buffer);
	} else if (buffer[0] === 0x1f && buffer[1] === 0x8b) {
		buffer = zlib.gunzipSync(buffer);
	}

	var tile = new vt.VectorTile(new Protobuf(buffer));
	var layers = Object.keys(tile.layers);
	var collection = { type: "FeatureCollection", features: [] };
	layers.forEach(function(layerID) {
		var layer = tile.layers[layerID];
		if (layer) {
			for (var i = 0; i < layer.length; i++) {
				var feature = layer.feature(i).toGeoJSON(x, y, z);
				if (layers.length > 1) feature.properties.vt_layer = layerID;
				collection.features.push(feature);
			}
		}
	});

	return collection;
}

module.exports = { toGeoJson };
