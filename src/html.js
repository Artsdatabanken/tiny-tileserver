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

async function generateListing(index, relativePath) {
  let { node, fragment } = index.get(relativePath);
  if (!node) return null;
  if (!node.isDirectory) node = await index.listFileContent(node, fragment);
  if (!node) return null;
  if (!node.isDirectory) return null;
  const htmlFragment = Object.keys(node.files)
    .map(key => {
      const item = node.files[key];
      if (item.isDirectory) return htmlRow(key, path.join(relativePath, key));
      const mbtiles = item.mbtiles;
      const url = path.join(relativePath, item.link);
      let alternateFormats = {};
      if (item.file.ext === "pbf")
        alternateFormats = {
          geojson: url + ".geojson",
          pbfjson: url + ".pbfjson"
        };
      return htmlRow(
        item.name,
        url,
        item.file.ext,
        item.file.size,
        item.file.modified,
        alternateFormats,
        mbtiles
          ? `${mbtiles.format}, zoom ${mbtiles.minzoom} - ${mbtiles.maxzoom}`
          : ""
      );
    })
    .join("\n");
  return template.replace("$rows", htmlFragment);
}

module.exports = { generateListing };
