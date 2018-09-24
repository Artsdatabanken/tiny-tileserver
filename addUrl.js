function addUrl(index, req) {
    var keys = Object.keys(index)
    for (key in keys){
        var fileName = keys[key]
        var urlSansProtocol = '://' + req.get('host') + req.originalUrl + `${fileName}/{z}/{x}/{y}`
        index[fileName].url = req.headers['x-forwarded-proto'] ? req.headers['x-forwarded-proto'] +  urlSansProtocol : req.protocol + urlSansProtocol
    }
    return index
}

module.exports = { addUrl };