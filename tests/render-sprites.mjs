// 把像素画渲染成 PNG，供人眼验收。
// 浏览器截图太慢，直接用 tests/lib/png.mjs 手写 PNG 更快，也不引入依赖。
//
// 产出（都在 docs/mockups/shots/）：
//   characters.png        两个立绘 + 轮椅，单独看
//   room-3-acts.png       三节的房间，暖光递增
//   room-empty-vs-full.png 空房间 vs 有人
//
// 用法：node tests/render-sprites.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import vm from 'node:vm';
import { makeCanvas, sheet, upscale } from './lib/png.mjs';

const GW = 106, GH = 60, SCALE = 6;
const OUT = 'docs/mockups/shots';

const spritesJson = JSON.parse(readFileSync('src/sprites.json', 'utf8'));
const PAL = { ...spritesJson.pal };

// 把 src/sprites.js 求值出来，拿立绘、时段变体和补充的调色板
const spritesJs = readFileSync('src/sprites.js', 'utf8').replace(/^\s*\/\/.*$/gm, '');
const X = vm.runInNewContext(spritesJs + '\n;XLZX');
Object.assign(PAL, X.PAL_EXT);

// 所有要检查行宽和调色板的东西
const ART = {
  WHEELCHAIR: X.WHEELCHAIR,
  REFERRAL: X.REFERRAL,
  TISSUE: X.TISSUE,
  LINYUE: X.LINYUE,
  COUNSELOR: X.COUNSELOR,
  XUYUAN_SEATED: X.XUYUAN_SEATED,
  CRUTCH_PAIR: X.CRUTCH_PAIR,
  ...X.CLOCK_VARIANTS,
};

// 来访者这一组（随身物件 + 立绘）由故事数据给，渲染时也照这个来，
// 否则出图验收的就不是游戏里真正会画的那一版。
const CLIENT_SCI = { prop: 'WHEELCHAIR', propX: 51, propY: 34, body: 'LINYUE_SEATED', bodyX: 51, bodyY: 30 };
const CLIENT_XU = { prop: 'CRUTCH_PAIR', propX: 70, propY: 34, body: 'XUYUAN_SEATED', bodyX: 58, bodyY: 30 };

let problems = 0;
console.log('=== 像素校验 ===');
for (const [name, rows] of Object.entries({ ...spritesJson.sprites, ...ART })) {
  const widths = [...new Set(rows.map((r) => r.length))];
  if (widths.length !== 1) {
    console.log(`  ✗ ${name}：行宽不一致 → ${widths.join(' / ')}`);
    problems++;
  }
  const miss = [...new Set(rows.join('').split(''))].filter((c) => c !== ' ' && !(c in PAL));
  if (miss.length) {
    console.log(`  ✗ ${name}：调色板外字符 → ${miss.join(' ')}`);
    problems++;
  }
}
console.log(problems === 0
  ? `  ✓ ${Object.keys({ ...spritesJson.sprites, ...ART }).length} 个物件全部规整（${Object.keys(PAL).length} 色）`
  : `  ✗ ${problems} 处问题`);

// ---------------------------------------------------------------------------
function paint(map, ox, oy, cv) {
  if (!map) return;
  map.forEach((line, dy) => {
    for (let x = 0; x < line.length; x++) {
      const ch = line[x];
      if (ch === ' ' || !PAL[ch]) continue;
      cv.set(ox + x, oy + dy, PAL[ch]);
    }
  });
}

/** 和方案 B / engine.js 完全一致的背景 */
function bgChar(x, y) {
  if (y <= 33) {
    if (x % 5 === 0) return ',';
    return y >= 26 ? '-' : '.';
  }
  if (y === 34) return '=';
  if (x % 8 === 7) return '|';
  return y % 4 === 0 ? '+' : '#';
}

/**
 * 画一帧房间。层级必须和 engine.js 的 renderScene 一致：
 * 背景 → 家具 → 人 → 茶几 → 茶几上的东西 → 钟 → 暖光
 */
function drawRoom({ withPeople = true, act = 1, warmth = 1, client = CLIENT_XU } = {}) {
  const cv = makeCanvas(GW, GH);

  for (let y = 0; y < GH; y++) {
    let x = 0;
    while (x < GW) {
      const ch = bgChar(x, y);
      let w = 1;
      while (x + w < GW && bgChar(x + w, y) === ch) w++;
      cv.rect(x, y, w, 1, PAL[ch]);
      x += w;
    }
  }

  for (let j = 35; j < 37; j++) for (let i = 0; i < GW; i++) cv.blend(i, j, '#0e0f16', 0.35);
  for (const [x, y, w, h] of spritesJson.shadows)
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) cv.blend(i, j, '#0e0f16', 0.42);

  for (const [name, x, y] of spritesJson.scene) {
    if (name === 'clock' || name === 'table') continue;
    if (name === 'cup' && withPeople) continue;
    paint(spritesJson.sprites[name], x, y, cv);
  }

  if (withPeople) {
    paint(X[client.prop], client.propX, client.propY, cv);
    paint(X[client.body], client.bodyX, client.bodyY, cv);
    const k = X.CHARS.counselor;
    paint(X.COUNSELOR, k.bodyX, k.bodyY, cv);
  }

  const table = spritesJson.scene.find((r) => r[0] === 'table');
  if (table) paint(spritesJson.sprites.table, table[1], table[2], cv);
  paint(X.REFERRAL, 43, 34, cv);
  paint(X.TISSUE, 49, 35, cv);

  const clock = spritesJson.scene.find((r) => r[0] === 'clock');
  if (clock) paint(X.CLOCK_VARIANTS['c' + act] || spritesJson.sprites.clock, clock[1], clock[2], cv);

  const w = X.WARMTH[warmth] || X.WARMTH[1];
  for (let y = 0; y < GH; y++) {
    for (let x = 0; x < GW; x++) {
      const dx = (x - GW * 0.5) / (GW * 0.5), dy = (y - GH * 0.62) / (GH * 0.5);
      const d = Math.min(1, Math.sqrt(dx * dx + dy * dy) / 1.48);
      cv.blend(x, y, '#000000', w.vignette * d * d * 0.55);
      cv.blend(x, y, '#ffd9a0', w.glow * (1 - d));
    }
  }
  return cv;
}

const stamp = (rows) => {
  const cv = makeCanvas(rows[0].length, rows.length);
  paint(rows, 0, 0, cv);
  return cv;
};

mkdirSync(OUT, { recursive: true });
const write = (name, cv) => {
  writeFileSync(`${OUT}/${name}`, cv.toPNG());
  console.log(`  ✓ ${OUT}/${name}`);
};

console.log('\n=== 出图 ===');
write('characters.png', sheet([
  stamp(X.COUNSELOR), stamp(X.LINYUE), stamp(X.WHEELCHAIR), stamp(X.REFERRAL), stamp(X.TISSUE),
], { scale: SCALE }));

// 许予安（v2）：立绘 + 双拐，单独出图，逐张人眼验收
write('characters-xu.png', sheet([
  stamp(X.XUYUAN_SEATED), stamp(X.CRUTCH_PAIR), stamp(X.LINYUE_SEATED),
], { scale: SCALE }));

// 许予安坐在右边沙发上，双拐靠在扶手边（腋托压在扶手上、脚垫落地）。
// 三节各出一张：暖光递增，但他不会「亮起来」——那件事留给台词。
write('room-xu-3-acts.png', sheet([
  drawRoom({ act: 1, warmth: 1, client: CLIENT_XU }),
  drawRoom({ act: 2, warmth: 2, client: CLIENT_XU }),
  drawRoom({ act: 3, warmth: 3, client: CLIENT_XU }),
], { scale: SCALE }));

write('room-3-acts.png', sheet([
  drawRoom({ act: 1, warmth: 1 }),
  drawRoom({ act: 2, warmth: 2 }),
  drawRoom({ act: 3, warmth: 3 }),
], { scale: SCALE }));

write('room-empty-vs-full.png', sheet([
  drawRoom({ withPeople: false, warmth: 1 }),
  drawRoom({ withPeople: true, warmth: 1 }),
], { scale: SCALE }));

console.log(problems === 0 ? '\n全部规整 ✅' : `\n有 ${problems} 处问题 ❌`);
process.exit(problems === 0 ? 0 : 1);
