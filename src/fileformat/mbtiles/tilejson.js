const getFormat = require("./tileformat");

const template = {
  bounds: [0, 0, 180, 85.051129],
  minzoom: 0,
  maxzoom: 12,
  version: "1.1",
  attribution: "Artsdatabanken",
  tilejson: "2.0.0",
  tiles: ["http://localhost:8000/AO.mbtiles/{z}/{x}/{y}"],
  vector_layers: [
    {
      id: "AO",
      description: "description"
    }
  ]
};

function tilejson(node) {
  const tj = JSON.parse(JSON.stringify(template));
  const meta = node.content;
  tj.minzoom = parseInt(meta.minzoom);
  tj.maxzoom = parseInt(meta.maxzoom);
  tj.tiles = [`http://localhost:8000/${node.name}/{z}/{x}/{y}`];
  meta.vector_layers = [
    { id: node.name.replace(".mbtiles", ""), description: "-" }
  ];
  tj.bounds = meta.bounds.split(",").map(b => parseFloat(b));
  return {
    buffer: Buffer.from(JSON.stringify(tj)),
    contentType: "application/json"
  };
}

module.exports = tilejson;
