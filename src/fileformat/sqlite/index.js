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
      const columns = reader.getColumns(filepath, table.name).then(fields => {
        file.columns = fields;
        console.log(file);
      });
      return file;
    })
  );
}

function list(type, items, baseUrl) {
  const files = items.map(item => {
    const f1 = Object.values(item)[0];
    return {
      type: "sqlite",
      name: f1,
      link: f1
    };
  });
  return { canBrowse: true, files: toObject(files) };
}

class SqliteHandler {
  indexContents(filepath, meta) {
    meta.canBrowse = true;
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
    const path = node.filepath;
    if (fragment.length <= 0) return node;
    if (node.files) {
      const table = fragment.shift();
      node = node.files[table];
      if (!node) return null;
      return this.getContent(node, fragment);
    }
  }

  async getContent(node, fragment) {
    switch (fragment.length) {
      case 0:
        return list(
          "sqlite",
          await reader.listRows(node.filepath, node.name, node.columns),
          node.link
        );
      case 1:
        const buffer = await reader.read(
          node.filepath,
          node.name,
          fragment,
          node.columns
        );
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
