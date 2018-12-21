const { createCanvas, loadImage } = require("canvas");

const size = 256;
const scaling = 512 / 4096;

const colors = [
  "rgba(255,255,217,0.5)",
  "rgba(237,248,177,0.5)",
  "rgba(199,233,180,0.5)",
  "rgba(127,205,187,0.5)",
  "rgba(65,182,196,0.5)",
  "rgba(29,145,192,0.5)",
  "rgba(34,94,168,0.5)",
  "rgba(37,52,148,0.5)",
  "rgba(8,29,88,0.5)"
];
function border(ctx) {
  ctx.rect(0.5, 0.5, size - 0.5, size - 0.5);
  ctx.stroke();
}

function render(pbfjson) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");
  ctx.font = "8px Tahoma";
  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.lineWidth = 1;
  ctx.antialias = "none";
  let colorIndex = 0;
  border(ctx);
  Object.keys(pbfjson.layers).forEach(key => {
    colorIndex = (colorIndex + 1) % colors.length;
    ctx.fillStyle = colors[colorIndex];
    const features = pbfjson.layers[key].features;
    features.forEach(feature => {
      colorIndex = (colorIndex + 1) % colors.length;
      ctx.fillStyle = colors[colorIndex];
      feature.geom.forEach(geom => drawGeometry(ctx, feature.type, geom));
    });
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.antialias = "default";
    features.forEach(feature => {
      const name = feature.properties.name;
      if (name)
        feature.geom.forEach(geom => {
          drawText(ctx, name, center(geom));
        });
    });
  });
  return canvas.toBuffer();
}

function center(geom) {
  let min = { x: 1e9, y: 1e9 };
  let max = { x: 0, y: 0 };
  geom.forEach(co => {
    min.x = Math.min(min.x, co.x);
    max.x = Math.max(max.x, co.x);
    min.y = Math.min(min.y, co.y);
    max.y = Math.max(max.y, co.y);
  });
  const count = geom.length;
  return { x: 0.5 * (min.x + max.x), y: 0.5 * (min.y + max.y) };
}

function drawText(ctx, label, position) {
  const metrics = ctx.measureText(label);
  const co = {
    x: Math.round(position.x * scaling - 0.5 * metrics.width),
    y: Math.round(position.y * scaling - 0.5 * metrics.actualBoundingBoxAscent)
  };
  ctx.fillText(label, co.x, co.y);
}

function drawGeometry(ctx, type, geom) {
  ctx.beginPath();
  geom.forEach(coord => {
    ctx.lineTo(coord.x * scaling, coord.y * scaling);
  });
  ctx.antialias = "default";
  ctx.stroke();

  // POINT = 1
  // LINESTRING = 2
  // POLYGON = 3
  ctx.antialias = "none";
  if (type === 3) ctx.fill();
}

module.exports = render;
