const mbTileReader = require("./mbTileReader");

mbTileReader.readTile("AO_18", 3,4,5).then(tile => console.log(tile)+ " bytes..");
