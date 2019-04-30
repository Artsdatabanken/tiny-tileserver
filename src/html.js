const fs = require("fs");
const template = fs.readFileSync("index.html", "utf8");
var path = require("path");

function td(inner) {
  return `<td class="mdl-data-table__cell--non-numeric">${inner}</td>`;
}

function htmlRow(
  name,
  baseUrl,
  size = "",
  modified = "",
  alternateFormats = {},
  extra = "",
  canBrowse
) {
  const url = path.join(baseUrl, name);
  Object.keys(alternateFormats).forEach(key => {
    const altUrl = path.join(baseUrl, alternateFormats[key]);
    extra += `<a href="${altUrl}">${key}</a>&nbsp;`;
  });
  const browse = canBrowse ? "/" : "";
  const mainlink = `<a alt="Browse" href="${url}${browse}">${name}</a>`;
  const download = `<a alt="Download" href="${url}"><img src="/download.png"></a>`;
  return `<tr onClick="window.location='${url}${browse}'">
    ${td(mainlink)}
    ${td(download)}
    <td>${size}</td>
    ${td(modified && modified.toISOString())}
    ${td(extra)}
  </tr>`;
}

function browse(node, relativePath) {
  const htmlFragment = node.files
    .map(item => {
      const mbtiles = item.format;
      return htmlRow(
        item.name,
        relativePath,
        item.size,
        item.modified,
        item.alternateFormats,
        mbtiles
          ? `${mbtiles.format}, zoom ${mbtiles.minzoom} - ${mbtiles.maxzoom}`
          : "",
        item.canBrowse || item.type === "directory"
      );
    })
    .join("\n");
  node.contentType = "text/html";
  node.buffer = template.replace("$rows", htmlFragment);
  return node;
}

module.exports = { browse };
