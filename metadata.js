function createMetadata(metadataIn){
    let metadataTemp = {}
    metadataIn.forEach(element => {
        metadataTemp[element.name] = element.value
    });

    let bounds = metadataTemp.bounds.split(',')
    let center = metadataTemp.center.split(',')

    metadataOut = {
        minzoom: stringToInt(metadataTemp.minzoom),
        maxzoom: stringToInt(metadataTemp.maxzoom),
        bounds: [ stringToFloat(bounds[0]), stringToFloat(bounds[1]),stringToFloat(bounds[2]),stringToFloat(bounds[3])],
        center: [ stringToFloat(center[0]), stringToFloat(center[1])]
    }
    return JSON.stringify(metadataOut)
}

function stringToInt(string){
    return parseInt(string, 10)
}

function stringToFloat(string){
    return parseFloat(string)
}

module.exports = { createMetadata };

