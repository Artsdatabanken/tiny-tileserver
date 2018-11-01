const fs = require("fs");
const template = fs.readFileSync("index.html", "utf8");
var path = require("path");

function htmlRow(
  name,
  baseUrl,
  filename,
  ext = "",
  size = "",
  modified = "",
  alternateFormats = {},
  extra = ""
) {
  const url = path.join(baseUrl, filename);
  Object.keys(alternateFormats).forEach(key => {
    const altUrl = path.join(baseUrl, alternateFormats[key]);
    extra += `<a href="${altUrl}">${key}</a>`;
  });
  return `<tr><td><a href="${url}">${name}</a></td><td>${ext ||
    "Directory"}</td><td class="right">${size}</td><td>${modified &&
    modified.toISOString()}</td><td style="display: flex">${extra}</td></tr>`;
}

function browse(files, relativePath) {
  const htmlFragment = Object.keys(files)
    .map(key => {
      const item = files[key];
      const mbtiles = item.mbtiles;
      return htmlRow(
        item.name,
        relativePath,
        item.link,
        item.fileext,
        item.filesize,
        item.filemodified,
        item.alternateFormats,
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
