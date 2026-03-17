const fs = require("fs");
const path = require("path");

const OUTPUT_DIR = path.join(process.cwd(), "images", "post-art");
const COUNT = 100;
const WIDTH = 960;
const HEIGHT = 640;

const palettes = [
  ["#f6f0e7", "#d9f2ef", "#8fcfd0", "#ffb39d", "#f6d2b4"],
  ["#f6f0e7", "#dceff6", "#8fb6dc", "#f7b9ac", "#f0d4b1"],
  ["#f6f0e7", "#d7ece8", "#71b6b1", "#f2b08f", "#f3ddc2"],
  ["#f6f0e7", "#dde9f8", "#92a2e3", "#f1b2c1", "#f6d8bf"],
  ["#f6f0e7", "#e2f1eb", "#8bc7b8", "#f3c09a", "#f7dbc5"],
];

function createRng(seed) {
  let state = (seed + 1) * 0x9e3779b1;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}

function between(rng, min, max) {
  return min + (max - min) * rng();
}

function pick(rng, values) {
  return values[Math.floor(rng() * values.length) % values.length];
}

function rgba(hex, alpha) {
  const clean = hex.replace("#", "");
  const red = parseInt(clean.slice(0, 2), 16);
  const green = parseInt(clean.slice(2, 4), 16);
  const blue = parseInt(clean.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function pointsToString(points) {
  return points.map((point) => `${point[0].toFixed(1)},${point[1].toFixed(1)}`).join(" ");
}

function polygon(points, attributes) {
  return `<polygon points="${pointsToString(points)}" ${attributes} />`;
}

function polyline(points, attributes) {
  return `<polyline points="${pointsToString(points)}" ${attributes} />`;
}

function skewRect(x, y, width, height, skew) {
  return [
    [x, y],
    [x + width, y],
    [x + width + skew, y + height],
    [x + skew, y + height],
  ];
}

function diamond(cx, cy, size) {
  return [
    [cx, cy - size],
    [cx + size, cy],
    [cx, cy + size],
    [cx - size, cy],
  ];
}

function isoCube(cx, cy, size, depth) {
  const half = size * 0.5;
  const lift = size * 0.28;
  return {
    top: [
      [cx, cy - lift * 1.35],
      [cx + half, cy - lift * 0.5],
      [cx, cy + lift * 0.32],
      [cx - half, cy - lift * 0.5],
    ],
    left: [
      [cx - half, cy - lift * 0.5],
      [cx, cy + lift * 0.32],
      [cx, cy + depth + lift * 0.32],
      [cx - half, cy + depth - lift * 0.5],
    ],
    right: [
      [cx, cy + lift * 0.32],
      [cx + half, cy - lift * 0.5],
      [cx + half, cy + depth - lift * 0.5],
      [cx, cy + depth + lift * 0.32],
    ],
  };
}

function buildSvg(index) {
  const rng = createRng(index + 17);
  const palette = palettes[index % palettes.length];
  const family = index % 5;
  const [paper, coolLight, cool, warm, warmLight] = palette;
  const cx = between(rng, WIDTH * 0.4, WIDTH * 0.62);
  const cy = between(rng, HEIGHT * 0.28, HEIGHT * 0.48);
  const cube = isoCube(cx, cy, between(rng, 180, 250), between(rng, 120, 200));
  const planeCount = 3 + (index % 3);
  const planes = [];
  const shards = [];
  const lines = [];
  const glyphs = [];

  for (let i = 0; i < planeCount; i += 1) {
    const width = between(rng, 220, 520);
    const height = between(rng, 44, 110);
    const x = between(rng, -80, WIDTH - width + 40);
    const y = between(rng, 70, HEIGHT - height - 50);
    const skew = between(rng, -120, 120);
    planes.push(
      polygon(
        skewRect(x, y, width, height, skew),
        `fill="${rgba(i % 2 === 0 ? coolLight : warmLight, 0.22)}" stroke="${rgba(cool, 0.12)}" stroke-width="1.2"`
      )
    );
  }

  for (let i = 0; i < 6; i += 1) {
    const startX = between(rng, 70, WIDTH - 210);
    const startY = between(rng, 80, HEIGHT - 180);
    const span = between(rng, 90, 210);
    const tilt = between(rng, -80, 80);
    lines.push(
      polyline(
        [
          [startX, startY],
          [startX + span, startY + tilt],
          [startX + span + between(rng, 24, 72), startY + tilt + between(rng, -18, 42)],
        ],
        `fill="none" stroke="${rgba(i % 2 === 0 ? cool : warm, 0.24)}" stroke-width="${between(rng, 1.4, 2.6).toFixed(
          2
        )}" stroke-linecap="round" stroke-linejoin="round"`
      )
    );
  }

  for (let i = 0; i < 5; i += 1) {
    const size = between(rng, 10, 22);
    const dx = between(rng, 70, WIDTH - 70);
    const dy = between(rng, 70, HEIGHT - 70);
    glyphs.push(
      polygon(
        diamond(dx, dy, size),
        `fill="${rgba(i % 2 === 0 ? warm : coolLight, 0.18)}" stroke="${rgba(cool, 0.2)}" stroke-width="1.2"`
      )
    );
  }

  for (let i = 0; i < 4; i += 1) {
    const width = between(rng, 70, 150);
    const height = between(rng, 28, 64);
    const x = between(rng, 120, WIDTH - width - 120);
    const y = between(rng, 90, HEIGHT - height - 80);
    const skew = between(rng, -55, 55);
    shards.push(
      polygon(
        skewRect(x, y, width, height, skew),
        `fill="${rgba(i % 2 === 0 ? coolLight : warmLight, 0.3)}" stroke="${rgba(warm, 0.16)}" stroke-width="1.2"`
      )
    );
  }

  const outlineOffset = between(rng, 24, 50);
  const outlineCube = isoCube(cx + outlineOffset, cy - outlineOffset * 0.45, between(rng, 150, 210), between(rng, 100, 170));

  const familyBlocks = {
    0: [
      polygon(cube.top, `fill="url(#top-${index})" stroke="${rgba(cool, 0.42)}" stroke-width="1.6"`),
      polygon(cube.left, `fill="${rgba(coolLight, 0.48)}" stroke="${rgba(cool, 0.32)}" stroke-width="1.4"`),
      polygon(cube.right, `fill="${rgba(warmLight, 0.48)}" stroke="${rgba(warm, 0.28)}" stroke-width="1.4"`),
      polygon(outlineCube.top, `fill="none" stroke="${rgba(cool, 0.16)}" stroke-width="1.3"`),
      polygon(outlineCube.left, `fill="none" stroke="${rgba(cool, 0.14)}" stroke-width="1.2"`),
      polygon(outlineCube.right, `fill="none" stroke="${rgba(warm, 0.14)}" stroke-width="1.2"`),
    ],
    1: [
      polygon(cube.top, `fill="${rgba(coolLight, 0.52)}" stroke="${rgba(cool, 0.34)}" stroke-width="1.5"`),
      polygon(cube.left, `fill="url(#left-${index})" stroke="${rgba(cool, 0.28)}" stroke-width="1.4"`),
      polygon(cube.right, `fill="url(#right-${index})" stroke="${rgba(warm, 0.28)}" stroke-width="1.4"`),
      polygon(skewRect(cx - 180, cy + 120, 320, 74, 72), `fill="${rgba(warmLight, 0.2)}" stroke="${rgba(warm, 0.18)}" stroke-width="1.1"`),
      polygon(skewRect(cx - 120, cy - 168, 260, 58, -66), `fill="${rgba(coolLight, 0.2)}" stroke="${rgba(cool, 0.18)}" stroke-width="1.1"`),
    ],
    2: [
      polygon(cube.top, `fill="url(#top-${index})" stroke="${rgba(cool, 0.28)}" stroke-width="1.5"`),
      polygon(cube.left, `fill="${rgba(coolLight, 0.4)}" stroke="${rgba(cool, 0.26)}" stroke-width="1.3"`),
      polygon(cube.right, `fill="${rgba(warmLight, 0.44)}" stroke="${rgba(warm, 0.26)}" stroke-width="1.3"`),
      polygon(diamond(cx, cy + 34, 120), `fill="none" stroke="${rgba(cool, 0.16)}" stroke-width="1.2"`),
      polygon(diamond(cx, cy + 34, 164), `fill="none" stroke="${rgba(warm, 0.12)}" stroke-width="1.1"`),
    ],
    3: [
      polygon(cube.top, `fill="${rgba(coolLight, 0.52)}" stroke="${rgba(cool, 0.28)}" stroke-width="1.5"`),
      polygon(cube.left, `fill="${rgba(pick(rng, [coolLight, warmLight]), 0.34)}" stroke="${rgba(cool, 0.26)}" stroke-width="1.3"`),
      polygon(cube.right, `fill="${rgba(pick(rng, [warmLight, coolLight]), 0.34)}" stroke="${rgba(warm, 0.24)}" stroke-width="1.3"`),
      polygon(skewRect(cx - 220, cy + 160, 380, 68, 90), `fill="none" stroke="${rgba(cool, 0.16)}" stroke-width="1.2"`),
      polygon(skewRect(cx - 180, cy + 210, 320, 52, -78), `fill="none" stroke="${rgba(warm, 0.14)}" stroke-width="1.1"`),
    ],
    4: [
      polygon(cube.top, `fill="url(#top-${index})" stroke="${rgba(cool, 0.26)}" stroke-width="1.5"`),
      polygon(cube.left, `fill="url(#left-${index})" stroke="${rgba(cool, 0.22)}" stroke-width="1.3"`),
      polygon(cube.right, `fill="url(#right-${index})" stroke="${rgba(warm, 0.22)}" stroke-width="1.3"`),
      polygon(diamond(cx - 160, cy + 50, 44), `fill="${rgba(coolLight, 0.16)}" stroke="${rgba(cool, 0.18)}" stroke-width="1.2"`),
      polygon(diamond(cx + 180, cy + 10, 38), `fill="${rgba(warmLight, 0.16)}" stroke="${rgba(warm, 0.18)}" stroke-width="1.2"`),
    ],
  };

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img" aria-labelledby="title-${index} desc-${index}">
  <title id="title-${index}">Abstract geometric post art ${index + 1}</title>
  <desc id="desc-${index}">An iridescent prism composition built from planes, lattices, and reflective block faces.</desc>
  <defs>
    <linearGradient id="bg-${index}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${paper}" />
      <stop offset="55%" stop-color="${rgba(coolLight, 0.96)}" />
      <stop offset="100%" stop-color="${rgba(warmLight, 0.92)}" />
    </linearGradient>
    <linearGradient id="top-${index}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${rgba(coolLight, 0.94)}" />
      <stop offset="50%" stop-color="${rgba(warmLight, 0.7)}" />
      <stop offset="100%" stop-color="${rgba(cool, 0.56)}" />
    </linearGradient>
    <linearGradient id="left-${index}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${rgba(coolLight, 0.7)}" />
      <stop offset="100%" stop-color="${rgba(cool, 0.28)}" />
    </linearGradient>
    <linearGradient id="right-${index}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${rgba(warmLight, 0.72)}" />
      <stop offset="100%" stop-color="${rgba(warm, 0.24)}" />
    </linearGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg-${index})" />
  <rect x="24" y="24" width="${WIDTH - 48}" height="${HEIGHT - 48}" rx="28" fill="none" stroke="${rgba(cool, 0.1)}" stroke-width="1.4" />
  ${planes.join("\n  ")}
  ${lines.join("\n  ")}
  ${shards.join("\n  ")}
  ${familyBlocks[family].join("\n  ")}
  ${glyphs.join("\n  ")}
</svg>
`;
}

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

for (let index = 0; index < COUNT; index += 1) {
  const filename = path.join(OUTPUT_DIR, `art-${index}.svg`);
  fs.writeFileSync(filename, buildSvg(index));
}

console.log(`Generated ${COUNT} post-art variants in ${OUTPUT_DIR}`);
