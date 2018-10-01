const fs = require("fs")
const template = fs.readFileSync("index.html", "utf8")
var path = require("path")

function htmlRow(relativePath, file, ext, size, modified, extra) {
  const url = path.join(relativePath, file) + ext
  return `<tr><td><a href="${url}">${file}</a></td><td>${ext}</td><td class="right">${size}</td><td>${modified &&
    modified.toISOString()}</td><td>${extra}</td></tr>`
}

async function generateListing(index, relativePath) {
  let { node, fragment } = index.get(relativePath)
  if (!node) return null
  if (!node.isDirectory) {
    node = await index.listFileContent(node, fragment)
  }
  if (!node) return null
  console.log("node", node)
  if (!node.isDirectory) return null
  const htmlFragment = Object.keys(node.files)
    .map(key => {
      const item = node.files[key]
      if (item.isDirectory)
        return htmlRow(relativePath, key, "directory", "", "", "")
      const mbtiles = item.mbtiles
      return htmlRow(
        relativePath,
        key,
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
