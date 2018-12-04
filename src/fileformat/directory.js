class DirectoryHandler {
  indexContents(filepath, meta) {}

  async get(node, fragment) {
    if (!fragment) return node;
    if (fragment.length === 1 && !fragment[0]) return node;
    return node.files[fragment];
  }
}

module.exports = DirectoryHandler;
