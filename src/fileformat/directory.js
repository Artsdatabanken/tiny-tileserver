class DirectoryHandler {
  indexContents(filepath, meta) {}

  async get(node, fragment) {
    if (!fragment) return node;
    return node.files[fragment];
  }

  listFiles(path, fragment) {}
}

module.exports = DirectoryHandler;
