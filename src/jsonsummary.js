function jsonSummarySubtree(node, path, target) {
  if (node.canBrowse) {
    Object.keys(node.files).forEach(file =>
      jsonSummarySubtree(node.files[file], path + "/" + file, target)
    );
    return;
  }

  const content = node.content || {};
  target[path] = { ...content, modified: node.filemodified };
}

function jsonSummary(index) {
  const r = {};
  jsonSummarySubtree(index, "", r);
  return r;
}

module.exports = { jsonSummary };
