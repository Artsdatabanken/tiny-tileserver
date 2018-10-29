const format = require("./index");
const mbTileReader = require("./mbtiles/mbtileReader");

test("typeFromFileExt mbtiles", () => {
  const actual = format.getTypeFromFileExt("mbtiles");
  expect(actual).toMatchSnapshot();
});

test("typeFromFileExt sqlite", () => {
  const actual = format.getTypeFromFileExt("sqlite");
  expect(actual).toMatchSnapshot();
});

test("typeFromFileExt png", () => {
  const actual = format.getTypeFromFileExt("png");
  expect(actual).toMatchSnapshot();
});

const node = {
  type: "mbtiles",
  filepath: "./testdata/pbf.mbtiles",
  content: { format: "pbf" },
  link: ""
};

test("get z", async () => {
  const actual = await format.get(node, []);
  expect(actual).toMatchSnapshot();
});
test("get zx", async () => {
  const actual = await format.get(node, [3]);
  expect(actual).toMatchSnapshot();
});
test("get zxy", async () => {
  const actual = await format.get(node, [3, 4]);
  expect(actual).toMatchSnapshot();
});
test("get tile", async () => {
  const actual = await format.get(node, [3, 4, 2]);
  expect(actual).toMatchSnapshot();
});
