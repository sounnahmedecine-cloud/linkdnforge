const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Minimal dependency-free PNG generator in Node.js
function createPNG(size, primaryColor = [234, 88, 12], bgColor = [249, 115, 22]) {
  const width = size;
  const height = size;

  // Raw RGBA buffer
  const buffer = Buffer.alloc(height * (width * 4 + 1));

  let offset = 0;
  for (let y = 0; y < height; y++) {
    buffer[offset++] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      // Rounded icon shape with flame/anvil symbol center
      const cx = width / 2;
      const cy = height / 2;
      const r = width / 2 - 1;
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);

      // Anvil symbol drawing in center
      const inCenter =
        x >= width * 0.25 &&
        x <= width * 0.75 &&
        y >= height * 0.35 &&
        y <= height * 0.65;

      if (dist <= r) {
        if (inCenter) {
          // White anvil mark
          buffer[offset++] = 255;
          buffer[offset++] = 255;
          buffer[offset++] = 255;
          buffer[offset++] = 255;
        } else {
          // Vibrant Orange Gradient
          const factor = (x + y) / (width + height);
          buffer[offset++] = Math.round(primaryColor[0] * (1 - factor) + bgColor[0] * factor);
          buffer[offset++] = Math.round(primaryColor[1] * (1 - factor) + bgColor[1] * factor);
          buffer[offset++] = Math.round(primaryColor[2] * (1 - factor) + bgColor[2] * factor);
          buffer[offset++] = 255;
        }
      } else {
        // Transparent outside
        buffer[offset++] = 0;
        buffer[offset++] = 0;
        buffer[offset++] = 0;
        buffer[offset++] = 0;
      }
    }
  }

  // Compress IDAT chunk data
  const compressed = zlib.deflateSync(buffer);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR Chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth: 8
  ihdrData[9] = 6; // Color type: 6 (RGBA)
  ihdrData[10] = 0; // Compression
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace
  const ihdr = makeChunk('IHDR', ihdrData);

  // IDAT Chunk
  const idat = makeChunk('IDAT', compressed);

  // IEND Chunk
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const typeBuf = Buffer.from(type, 'ascii');
  const crc = crc32(Buffer.concat([typeBuf, data]));

  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc, 0);

  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

// CRC32 implementation
function crc32(buf) {
  let crc = 0 ^ -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

const table = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  table[i] = c;
}

// Generate icons
const iconsDir = path.join(__dirname, '..', 'chrome-extension', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

[16, 48, 128].forEach((size) => {
  const iconBuffer = createPNG(size);
  const filePath = path.join(iconsDir, `icon${size}.png`);
  fs.writeFileSync(filePath, iconBuffer);
  console.log(`Generated: ${filePath}`);
});
