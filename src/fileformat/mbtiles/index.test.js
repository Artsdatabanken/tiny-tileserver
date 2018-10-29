const MbTilesHandler = require("./");

const mbtiles = new MbTilesHandler();

test("get pbf", async () => {
  const node = {
    type: "mbtiles",
    filepath: "./testdata/pbf.mbtiles",
    link: ""
  };
  const fragment = [];
  const ext = "";
  await mbtiles
    .get(node, fragment, ext)
    .then(value => expect(value).toMatchSnapshot());
});
