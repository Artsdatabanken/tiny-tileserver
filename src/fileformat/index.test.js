const format = require("./index");

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

const cursor = {
  type: "mbtiles",
  physicalDir: "./testdata/pbf.mbtiles",
  pathSegments: [],
  query: {},
  content: { format: "pbf" },
  link: ""
};

test("get z", async () => {
  const actual = await load(cursor, []);
  expect(actual).toMatchSnapshot();
});
test("get zx", async () => {
  const actual = await load(cursor, [3]);
  expect(actual).toMatchSnapshot();
});
test("get zxy", async () => {
  const actual = await load(cursor, [3, 4]);
  expect(actual).toMatchSnapshot();
});
test("get tile", async () => {
  const actual = await load(cursor, [3, 4, 2]);
  expect(actual).toMatchSnapshot();
});

async function load(cursor, path) {
  cursor = { ...cursor, pathSegments: path };
  await format.load(cursor);
  return cursor;
}
