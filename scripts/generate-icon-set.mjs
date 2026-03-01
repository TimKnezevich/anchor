import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";
import { createLogger } from "../shared/observability/src/index.mjs";

const logger = createLogger({ service: "axis-icon-generate" });
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const sourceSvg = join(root, "assets", "brand", "axis-mark.svg");

const points = [
  [256, 832],
  [512, 192],
  [768, 832],
  [352, 544],
  [672, 544]
];

const segments = [
  [points[0], points[1]],
  [points[1], points[2]],
  [points[2], points[3]],
  [points[3], points[4]]
];

const palette = {
  background: [0xf5, 0xf7, 0xfa, 0xff],
  edge: [0x0b, 0x12, 0x20, 0xff],
  nodeFill: [0xf9, 0x73, 0x16, 0xff]
};

const exportTargets = [16, 32, 48, 64, 128, 256, 512];

function isDarkModeHintEnabled() {
  return false;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function setPixel(rgba, size, x, y, color) {
  if (x < 0 || y < 0 || x >= size || y >= size) {
    return;
  }

  const offset = (y * size + x) * 4;
  rgba[offset] = color[0];
  rgba[offset + 1] = color[1];
  rgba[offset + 2] = color[2];
  rgba[offset + 3] = color[3];
}

function drawFilledCircle(rgba, size, cx, cy, radius, color) {
  const x0 = clamp(Math.floor(cx - radius), 0, size - 1);
  const x1 = clamp(Math.ceil(cx + radius), 0, size - 1);
  const y0 = clamp(Math.floor(cy - radius), 0, size - 1);
  const y1 = clamp(Math.ceil(cy + radius), 0, size - 1);
  const radiusSquared = radius * radius;

  for (let y = y0; y <= y1; y += 1) {
    for (let x = x0; x <= x1; x += 1) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= radiusSquared) {
        setPixel(rgba, size, x, y, color);
      }
    }
  }
}

function distanceToSegment(px, py, ax, ay, bx, by) {
  const abx = bx - ax;
  const aby = by - ay;
  const apx = px - ax;
  const apy = py - ay;
  const abLenSquared = abx * abx + aby * aby;
  const t = abLenSquared === 0 ? 0 : clamp((apx * abx + apy * aby) / abLenSquared, 0, 1);
  const qx = ax + abx * t;
  const qy = ay + aby * t;
  const dx = px - qx;
  const dy = py - qy;
  return Math.sqrt(dx * dx + dy * dy);
}

function drawSegmentStroke(rgba, size, from, to, width, color) {
  const [ax, ay] = from;
  const [bx, by] = to;
  const radius = width / 2;
  const minX = clamp(Math.floor(Math.min(ax, bx) - radius), 0, size - 1);
  const maxX = clamp(Math.ceil(Math.max(ax, bx) + radius), 0, size - 1);
  const minY = clamp(Math.floor(Math.min(ay, by) - radius), 0, size - 1);
  const maxY = clamp(Math.ceil(Math.max(ay, by) + radius), 0, size - 1);

  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      if (distanceToSegment(x + 0.5, y + 0.5, ax, ay, bx, by) <= radius) {
        setPixel(rgba, size, x, y, color);
      }
    }
  }
}

function makeChunk(type, data) {
  const header = Buffer.allocUnsafe(8);
  header.writeUInt32BE(data.length, 0);
  header.write(type, 4, 4, "ascii");

  const crcBuffer = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = crc32(crcBuffer);
  const crcOut = Buffer.allocUnsafe(4);
  crcOut.writeUInt32BE(crc >>> 0, 0);

  return Buffer.concat([header, data, crcOut]);
}

const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buffer) {
  let c = 0xffffffff;
  for (let i = 0; i < buffer.length; i += 1) {
    c = crcTable[(c ^ buffer[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function encodePng(size, rgba) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdr = Buffer.allocUnsafe(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const stride = size * 4;
  const scanlines = Buffer.allocUnsafe((stride + 1) * size);

  for (let y = 0; y < size; y += 1) {
    const scanlineOffset = y * (stride + 1);
    scanlines[scanlineOffset] = 0;
    rgba.copy(scanlines, scanlineOffset + 1, y * stride, (y + 1) * stride);
  }

  const idat = deflateSync(scanlines, { level: 9 });

  return Buffer.concat([
    signature,
    makeChunk("IHDR", ihdr),
    makeChunk("IDAT", idat),
    makeChunk("IEND", Buffer.alloc(0))
  ]);
}

function drawIcon(size) {
  const scale = size / 1024;
  const edgeWidth = 72 * scale;
  const nodeRadius = size <= 32 ? 36 * scale : 42 * scale;

  const rgba = Buffer.alloc(size * size * 4);
  for (let i = 0; i < size * size; i += 1) {
    rgba[i * 4] = palette.background[0];
    rgba[i * 4 + 1] = palette.background[1];
    rgba[i * 4 + 2] = palette.background[2];
    rgba[i * 4 + 3] = palette.background[3];
  }

  for (const [from, to] of segments) {
    drawSegmentStroke(
      rgba,
      size,
      [from[0] * scale, from[1] * scale],
      [to[0] * scale, to[1] * scale],
      edgeWidth,
      palette.edge
    );
  }

  for (const [x, y] of points) {
    drawFilledCircle(rgba, size, x * scale, y * scale, nodeRadius, palette.nodeFill);
  }

  return encodePng(size, rgba);
}

function outPathForSize(size) {
  return join(root, "extension", "media", `icon-${size}.png`);
}

function generateIconSet() {
  if (isDarkModeHintEnabled()) {
    logger.warn("Dark mode hint is currently disabled for icon generation.");
  }

  mkdirSync(join(root, "extension", "media"), { recursive: true });

  for (const size of exportTargets) {
    const png = drawIcon(size);
    writeFileSync(outPathForSize(size), png);
    logger.info("Icon generated", { size, output: `extension/media/icon-${size}.png` });
  }

  logger.info("Icon generation complete", {
    source_svg: sourceSvg,
    targets: exportTargets.map((size) => `icon-${size}.png`)
  });
}

generateIconSet();
