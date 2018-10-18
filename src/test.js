const mbTileReader = require("./mbTileReader");

// http://localhost:8000/AO_18/11/465/1085
mbTileReader
  .readTile("AO_18", 3, 4, 5)
  .then(tile => console.log(tile) + " bytes..");
