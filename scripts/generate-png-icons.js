import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    let byte = buf[i];
    for (let j = 0; j < 8; j++) {
      let bit = (byte ^ crc) & 1;
      crc = (crc >>> 1) ^ (bit ? 0xedb88320 : 0);
      byte >>>= 1;
    }
  }
  return (crc ^ -1) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const toCrc = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(toCrc), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function createPng(size) {
  const width = size;
  const height = size;
  const rowBytes = 1 + width * 4;
  const raw = Buffer.alloc(rowBytes * height);

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.44;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowBytes;
    raw[rowOffset] = 0; // Filter 0

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Deep dark sleek background (#070d17)
      let r = 7, g = 13, b = 23, a = 255;

      if (dist < radius) {
        // Inner circle background glow
        const glow = 1 - (dist / radius);
        r = Math.min(255, Math.floor(7 + glow * 20));
        g = Math.min(255, Math.floor(13 + glow * 80));
        b = Math.min(255, Math.floor(23 + glow * 60));

        // Outer neon ring (stroke width ~ 4% of size)
        const ringDist = Math.abs(dist - (radius * 0.88));
        if (ringDist < size * 0.035) {
          r = 16;
          g = 185;
          b = 129;
          a = 255;
        }

        // Headphone band arc (upper half)
        const hpBandDist = Math.abs(dist - (radius * 0.62));
        if (hpBandDist < size * 0.035 && dy < size * 0.05) {
          r = 56;
          g = 189;
          b = 248; // Cyan
        }

        // Headphone ear cups
        const cupW = size * 0.08;
        const cupH = size * 0.18;
        const leftCupX = cx - radius * 0.62;
        const rightCupX = cx + radius * 0.62;
        const cupY = cy;

        if (
          (Math.abs(x - leftCupX) < cupW && Math.abs(y - cupY) < cupH) ||
          (Math.abs(x - rightCupX) < cupW && Math.abs(y - cupY) < cupH)
        ) {
          r = 16;
          g = 185;
          b = 129;
        }

        // Equalizer spectrum bars
        const numBars = 5;
        const barW = size * 0.05;
        const barSpacing = size * 0.08;
        const startX = cx - ((numBars - 1) * barSpacing) / 2;
        const barHeights = [0.16, 0.28, 0.38, 0.28, 0.16].map(h => h * size);

        for (let i = 0; i < numBars; i++) {
          const bx = startX + i * barSpacing;
          const bh = barHeights[i];
          if (Math.abs(x - bx) < barW / 2 && y >= (cy - bh / 2) && y <= (cy + bh / 2)) {
            if (i === 2) {
              r = 56; g = 189; b = 248; // Center cyan
            } else {
              r = 16; g = 185; b = 129; // Emerald
            }
          }
        }
      }

      raw[pxOffset] = r;
      raw[pxOffset + 1] = g;
      raw[pxOffset + 2] = b;
      raw[pxOffset + 3] = a;
    }
  }

  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth
  ihdrData[9] = 6; // Color type (RGBA)
  ihdrData[10] = 0; // Compression
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace

  const ihdr = makeChunk('IHDR', ihdrData);
  const idat = makeChunk('IDAT', zlib.deflateSync(raw));
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdr, idat, iend]);
}

// Generate web icons
fs.writeFileSync('public/icon-512.png', createPng(512));
fs.writeFileSync('public/icon-192.png', createPng(192));
console.log('✅ Generated public/icon-512.png and public/icon-192.png');

// Generate Android mipmap icons
const densities = [
  { dir: 'mipmap-mdpi', size: 48 },
  { dir: 'mipmap-hdpi', size: 72 },
  { dir: 'mipmap-xhdpi', size: 96 },
  { dir: 'mipmap-xxhdpi', size: 144 },
  { dir: 'mipmap-xxxhdpi', size: 192 },
];

densities.forEach(({ dir, size }) => {
  const targetDir = path.resolve('android/app/src/main/res', dir);
  if (fs.existsSync(targetDir)) {
    const png = createPng(size);
    fs.writeFileSync(path.join(targetDir, 'ic_launcher.png'), png);
    fs.writeFileSync(path.join(targetDir, 'ic_launcher_round.png'), png);
    fs.writeFileSync(path.join(targetDir, 'ic_launcher_foreground.png'), png);
    console.log(`✅ Wrote launcher icons to ${dir} (${size}x${size})`);
  }
});
