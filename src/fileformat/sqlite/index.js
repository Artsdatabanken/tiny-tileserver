const reader = require("./sqliteReader");

const columnsCache = {};

async function getColumns(cursor) {
  const table = cursor.pathSegments[0];
  const key = cursor.physicalDir + ":" + table;
  let value = columnsCache[key];
  if (value) return value;
  value = await reader.getColumns(cursor.physicalDir, table);
  columnsCache[key] = value;
  return value;
}

class SqliteHandler {
  async load(cursor) {
    const segments = cursor.pathSegments;
    switch (segments.length) {
      case 0:
        cursor.files = await reader.listTables(cursor.physicalDir);
        cursor.canBrowse = true;
        break;
      case 1:
        cursor.files = await reader.listRows(
          cursor.physicalDir,
          segments[0],
          await getColumns(cursor)
        );
        cursor.canBrowse = true;
        break;
      case 2:
        const buffer = await reader.read(
          cursor.physicalDir,
          segments[0],
          segments.slice(1),
          await getColumns(cursor)
        );
        if (!buffer) return null;
        cursor.contentType = "application/json";
        cursor.buffer = buffer;
        break;
    }
  }
}

module.exports = SqliteHandler;
