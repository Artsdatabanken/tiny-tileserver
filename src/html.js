const fs = require("fs");
const template = fs.readFileSync("index.html", "utf8");
var path = require("path");

function td(inner) {
  return `<td class="mdl-data-table__cell--non-numeric">${inner}</td>`;
}

function htmlRow(
  name,
  baseUrl,
  filename,
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

function browse(files, relativePath) {
  const htmlFragment = Object.keys(files)
    .map(key => {
      const item = files[key];
      const mbtiles = item.format;
      return htmlRow(
        key,
        relativePath,
        item.link,
        item.filesize,
        item.filemodified,
        item.alternateFormats,
        mbtiles
          ? `${mbtiles.format}, zoom ${mbtiles.minzoom} - ${mbtiles.maxzoom}`
          : "",
        item.canBrowse
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
