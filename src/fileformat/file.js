class FileHandler {
  indexContents(filepath, meta) {}

  async get(node, fragment) {
    return node;
  }

  listFiles(path, fragment) {}
}

module.exports = FileHandler;
