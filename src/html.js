const fs = require("fs");
const template = fs.readFileSync("index.html", "utf8");
var path = require("path");

function htmlRow(
  name,
  url,
  ext = "",
  size = "",
  modified = "",
  alternateFormats = {},
  extra = ""
) {
  Object.keys(alternateFormats).forEach(key => {
    extra += `<a href="${alternateFormats[key]}">${key}</a>`;
  });
  return `<tr><td><a href="${url}">${name}</a></td><td>${ext ||
    "Directory"}</td><td class="right">${size}</td><td>${modified &&
    modified.toISOString()}</td><td style="display: flex">${extra}</td></tr>`;
}

function browse(files, relativePath) {
  const htmlFragment = Object.keys(files)
    .map(key => {
      const item = files[key];
      if (item.type === "directory")
        return htmlRow(key, path.join(relativePath, key));
      const mbtiles = item.mbtiles;
      const url = path.join(relativePath, item.link);
      let alternateFormats = {};
      if (item.fileext === "pbf")
        alternateFormats = {
          geojson: url + ".geojson",
          pbfjson: url + ".pbfjson"
        };
      if (item.fileext === ".mbtiles")
        alternateFormats = {
          mbtiles: url + ".mbtiles"
        };
      return htmlRow(
        item.name,
        url,
        item.fileext,
        item.filesize,
        item.filemodified,
        alternateFormats,
        mbtiles
          ? `${mbtiles.format}, zoom ${mbtiles.minzoom} - ${mbtiles.maxzoom}`
          : ""
      );
    })
    .join("\n");
  const node = {
    contentType: "text/html",
    buffer: template.replace("$rows", htmlFragment)
  };
  return node;
}

module.exports = { browse };
