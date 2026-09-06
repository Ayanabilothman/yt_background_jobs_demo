"use strict";

const fs = require("fs");
const path = require("path");
const Jimp = require("jimp");

const SIZE = 1000; // generated sample is 1000x1000
const WORK_SIZE = 1300; // the job upscales to 1300x1300 before filtering
const SAMPLE_PATH = path.join(__dirname, "assets", "sample.png");

const clamp = (v) => (v < 0 ? 0 : v > 255 ? 255 : v | 0);

// Create one real PNG on disk the first time it is needed.
async function ensureSampleImage() {
  if (fs.existsSync(SAMPLE_PATH)) return SAMPLE_PATH;
  fs.mkdirSync(path.dirname(SAMPLE_PATH), { recursive: true });
  const image = await Jimp.create(SIZE, SIZE, 0x000000ff);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const noise = ((x * 73 + y * 179 + x * y) % 64) - 32;
      const r = clamp((x * 255) / SIZE + noise);
      const g = clamp((y * 255) / SIZE + noise);
      const b = clamp(((x + y) * 255) / (2 * SIZE) + noise);
      image.setPixelColor(Jimp.rgbaToInt(r, g, b, 255), x, y);
    }
  }
  await image.writeAsync(SAMPLE_PATH);
  return SAMPLE_PATH;
}

// Real CPU-bound image work: synchronous pixel crunching on the current
// thread, so while this runs the Node event loop of THIS process is blocked.
async function processImage({ iterations = 1 } = {}) {
  const startedAt = Date.now();
  const source = await Jimp.read(await ensureSampleImage());
  for (let i = 0; i < iterations; i++) {
    const frame = source.clone();
    frame.resize(WORK_SIZE, WORK_SIZE);
    frame.blur(5);
    frame.greyscale();
    frame.contrast(0.5);
    frame.posterize(6);
    await frame.getBufferAsync(Jimp.MIME_PNG);
  }
  return { ms: Date.now() - startedAt };
}

module.exports = { processImage };
