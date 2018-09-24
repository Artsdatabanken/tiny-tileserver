function addUrl(index, req) {
    var keys = Object.keys(index)
    for (key in keys){
        var fileName = keys[key]
        index[fileName].url = req.protocol + '://' + req.get('host') + req.originalUrl + `${fileName}/{z}/{x}/{y}`
    }
    return index
}

module.exports = { addUrl };