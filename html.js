const fs = require("fs")
const template = fs.readFileSync("index.html", "utf8")
var path = require("path")

function htmlRow(name, relativePath, file, ext, size, modified, extra) {
  const url = path.join(relativePath, file)
  return `<tr><td><a href="${url}">${name}</a></td><td>${ext ||
    "Directory"}</td><td class="right">${size}</td><td>${modified &&
    modified.toISOString()}</td><td>${extra}</td></tr>`
}

async function generateListing(index, relativePath) {
  let { node, fragment } = index.get(relativePath)
  if (!node) return null
  if (!node.isDirectory) {
    node = await index.listFileContent(node, fragment)
  }
  if (!node) return null
  if (!node.isDirectory) return null
  const htmlFragment = Object.keys(node.files)
    .map(key => {
      const item = node.files[key]
      if (item.isDirectory)
        return htmlRow(key, relativePath, key, "", "", "", "")
      const mbtiles = item.mbtiles
      return htmlRow(
        item.name,
        relativePath,
        item.link,
        item.file.ext,
        item.file.size,
        item.file.modified,
        mbtiles
          ? `${mbtiles.format}, zoom ${mbtiles.minzoom} - ${mbtiles.maxzoom}`
          : ""
      )
    })
    .join("\n")
  return template.replace("$rows", htmlFragment)
}

module.exports = { generateListing }
