const reader = require("../sqliteReader");

async function mapTables(tables, filepath) {
  return tables
    .map(table => {
      const file = {
        type: "sqlite",
        name: table.name,
        link: table.name,
        filepath: filepath
      };
      reader
        .getColumns(filepath, table.name)
        .then(fields => (file.columns = fields));
      return file;
    })
    .reduce((acc, e) => {
      acc[e.name] = e;
      return acc;
    }, {});
}

function list(type, items, baseUrl) {
  const files = items
    .map(item => {
      const f1 = item[Object.keys(item)[0]];
      return {
        type: type,
        name: f1,
        link: baseUrl + "/" + f1
      };
    })
    .reduce((acc, c) => {
      acc[c.name] = c;
      return acc;
    }, {});
  return { type: "directory", files: files };
}

class SqliteHandler {
  indexContents(filepath, meta) {
    meta.type = "directory";
    reader
      .listTables(filepath)
      .then(tables => {
        mapTables(tables, filepath).then(files => (meta.files = files));
      })
      .catch(error => (meta.error = error));
  }

  async get(node, fragment) {
    console.log("#####", node, fragment);
    const [key] = fragment;
    const path = node.filepath;
    switch (fragment.length) {
      case 0:
        return list(null, await reader.listRows(path, node.name), path);
      case 1:
        const r = {
          contentType: "application/json",
          buffer: await reader.read(path, node.name, key)
        };
        console.log("#####", r);
        return r;
      default:
        return null;
    }
  }
}

module.exports = SqliteHandler;
