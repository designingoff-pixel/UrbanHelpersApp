const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// ASCII85 decoder
function ascii85Decode(str) {
  // Remove whitespace
  str = str.replace(/\s+/g, '');
  // Remove <~ and ~>
  if (str.startsWith('<~')) str = str.slice(2);
  if (str.endsWith('~>')) str = str.slice(0, -2);

  const bytes = [];
  let tuple = 0;
  let count = 0;

  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    if (str[i] === 'z' && count === 0) {
      bytes.push(0, 0, 0, 0);
      continue;
    }
    if (c < 33 || c > 117) continue;

    tuple = tuple * 85 + (c - 33);
    count++;

    if (count === 5) {
      bytes.push(
        (tuple >>> 24) & 0xff,
        (tuple >>> 16) & 0xff,
        (tuple >>> 8) & 0xff,
        tuple & 0xff
      );
      tuple = 0;
      count = 0;
    }
  }

  if (count > 0) {
    for (let i = count; i < 5; i++) {
      tuple = tuple * 85 + 84;
    }
    const full = [
      (tuple >>> 24) & 0xff,
      (tuple >>> 16) & 0xff,
      (tuple >>> 8) & 0xff,
      tuple & 0xff
    ];
    for (let i = 0; i < count - 1; i++) {
      bytes.push(full[i]);
    }
  }

  return Buffer.from(bytes);
}

// Minimal PNG builder for 8-bit RGB
function makePng(width, height, rgbBuffer) {
  // PNG signature: 89 50 4E 47 0D 0A 1A 0A
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crc = crc32(Buffer.concat([typeBuf, data]));
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc >>> 0, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // bit depth 8
  ihdr.writeUInt8(2, 9); // color type 2: RGB
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Scanlines with filter byte 0 (None)
  const rowBytes = width * 3;
  const rawData = Buffer.alloc(height * (rowBytes + 1));
  for (let y = 0; y < height; y++) {
    rawData[y * (rowBytes + 1)] = 0; // Filter None
    rgbBuffer.copy(rawData, y * (rowBytes + 1) + 1, y * rowBytes, (y + 1) * rowBytes);
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

// CRC32 implementation
function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) {
        c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      }
      table[i] = c;
    }
    crc32.table = table;
  }
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

const serviceNames = [
  "home_cleaning",
  "ro_service",
  "pest_control",
  "pet_care",
  "horticulture",
  "appliance_cleaning",
  "home_care",
  "emergency",
  "insurance"
];

const pdfPath = path.join(__dirname, 'Urban_Helpers_9_Service_Images.pdf');
const outDir = path.join(__dirname, 'services');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const data = fs.readFileSync(pdfPath).toString('latin1');
const streamRegex = /<<([^>]+)>>\s*stream\r?\n([\s\S]*?)\r?\nendstream/g;

let match;
let imgIndex = 0;

while ((match = streamRegex.exec(data)) !== null && imgIndex < 9) {
  const dict = match[1];
  const rawStream = match[2];

  if (!dict.includes('/Subtype /Image')) continue;

  const widthMatch = dict.match(/\/Width\s+(\d+)/);
  const heightMatch = dict.match(/\/Height\s+(\d+)/);

  if (!widthMatch || !heightMatch) continue;

  const width = parseInt(widthMatch[1], 10);
  const height = parseInt(heightMatch[1], 10);

  console.log(`Processing image #${imgIndex + 1} (${serviceNames[imgIndex]}): ${width}x${height}`);

  try {
    // 1. ASCII85 decode
    const a85Decoded = ascii85Decode(rawStream);
    // 2. Flate decode (zlib inflate)
    const rgbData = zlib.inflateSync(a85Decoded);
    console.log(`  Decoded RGB bytes: ${rgbData.length}, expected: ${width * height * 3}`);

    // 3. Make PNG
    const pngBuf = makePng(width, height, rgbData);
    const fileName = `${serviceNames[imgIndex]}.png`;
    const outPath = path.join(outDir, fileName);
    fs.writeFileSync(outPath, pngBuf);
    console.log(`  Saved -> ${outPath} (${pngBuf.length} bytes)`);

    imgIndex++;
  } catch (err) {
    console.error(`  Error processing image #${imgIndex + 1}:`, err.message);
  }
}

console.log(`Done! Extracted ${imgIndex} service images successfully.`);
