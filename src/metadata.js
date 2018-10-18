function mapMetadata(meta) {
  return {
    error: meta.error,
    format: meta.format,
    zoom: [parseInt(meta.minzoom), parseInt(meta.maxzoom)],
    bounds: meta.bounds && meta.bounds.split(",").map(b => parseFloat(b))
  };
}

module.exports = { mapMetadata };
