const reader = require("./sqliteReader");
const { toObject } = require("../../object");

async function mapTables(tables, filepath, baseUri) {
  return toObject(
    tables.map(table => {
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
  );
}

function list(type, items, baseUrl) {
  const files = items.map(item => {
    const f1 = item[Object.keys(item)[0]];
    return {
      type: "sqlite",
      name: f1,
      link: f1
    };
  });
  return { type: "directory", files: toObject(files) };
}

class SqliteHandler {
  indexContents(filepath, meta) {
    meta.type = "directory";
    reader
      .listTables(filepath)
      .then(tables => {
        mapTables(tables, filepath, meta.link).then(
          files => (meta.files = files),
          meta.link
        );
      })
      .catch(error => (meta.error = error));
  }

  async get(node, fragment) {
    const [key] = fragment;
    const path = node.filepath;
    switch (fragment.length) {
      case 0:
        return list(
          "sqlite",
          await reader.listRows(path, node.name),
          node.link
        );
      case 1:
        const buffer = await reader.read(path, node.name, key);
        if (!buffer) return null;
        const r = {
          contentType: "application/json",
          buffer: buffer
        };
        return r;
      default:
        return null;
    }
  }
}

module.exports = SqliteHandler;
