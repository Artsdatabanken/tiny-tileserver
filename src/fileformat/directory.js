class DirectoryHandler {
  indexContents(filepath, meta) {}

  async get(node, fragment) {
    if (!fragment) return node;
    return node.files[fragment];
  }
}

module.exports = DirectoryHandler;
