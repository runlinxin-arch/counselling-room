// 生成咨询室的所有像素物件，并写回 html。
// 用画图指令（矩形）生成，保证每行宽度严格一致，不会手打数错。
import { readFileSync, writeFileSync } from 'node:fs';

const FILE = process.argv[2] || 'docs/mockups/b2.html';

const mk = (w, h) => Array.from({ length: h }, () => Array(w).fill(' '));
const rect = (g, x, y, w, h, c) => {
  for (let j = y; j < y + h; j++) {
    if (j < 0 || j >= g.length) continue;
    for (let i = x; i < x + w; i++) {
      if (i < 0 || i >= g[j].length) continue;
      g[j][i] = c;
    }
  }
};
const out = (g) => g.map((r) => r.join(''));
const mirror = (g) => g.map((r) => r.slice().reverse());

const S = {};

// ---- 窗户 22×20：四格窗 ----
{
  const g = mk(22, 20);
  rect(g, 0, 0, 22, 20, 'f');
  rect(g, 1, 1, 20, 18, 'g');
  rect(g, 10, 1, 1, 18, 'f');
  rect(g, 1, 10, 20, 1, 'f');
  rect(g, 2, 2, 4, 3, 'h');  rect(g, 12, 2, 4, 3, 'h');
  rect(g, 2, 12, 4, 3, 'h'); rect(g, 12, 12, 4, 3, 'h');
  S.window = out(g);
}

// ---- 遮光窗帘 6×26：竖折 ----
{
  const g = mk(6, 26);
  for (let x = 0; x < 6; x++) rect(g, x, 0, 1, 26, x % 3 === 1 ? 'm' : 'n');
  rect(g, 0, 24, 6, 2, 'm');
  S.curtainL = out(g);
  S.curtainR = out(mirror(g));
}

// ---- 窗帘杆 34×2 ----
{
  const g = mk(34, 2);
  rect(g, 0, 0, 34, 1, 'q');
  rect(g, 0, 1, 34, 1, 'f');
  S.rod = out(g);
}

// ---- 挂钟 9×9 ----
{
  const g = mk(9, 9);
  rect(g, 0, 0, 9, 9, 'G');
  rect(g, 1, 1, 7, 7, 'i');
  rect(g, 4, 1, 1, 1, 'D'); rect(g, 7, 4, 1, 1, 'D');   // 刻度
  rect(g, 4, 7, 1, 1, 'D'); rect(g, 1, 4, 1, 1, 'D');
  rect(g, 4, 4, 3, 1, 'D');   // 分针
  rect(g, 4, 2, 1, 2, 'D');   // 时针
  S.clock = out(g);
}

// ---- 墙上的画 14×11 ----
{
  const g = mk(14, 11);
  rect(g, 0, 0, 14, 11, 'f');
  rect(g, 1, 1, 12, 9, 'i');
  rect(g, 2, 7, 10, 1, 'p');   // 远山
  rect(g, 3, 6, 3, 1, 'p');
  rect(g, 4, 5, 1, 1, 'p');
  rect(g, 8, 6, 2, 1, 'p');
  rect(g, 9, 2, 3, 3, 'j');    // 太阳
  S.poster = out(g);
}

// ---- 书架 15×26：三层书 ----
{
  const g = mk(15, 26);
  rect(g, 0, 0, 15, 26, 'b');
  rect(g, 1, 1, 13, 24, 'B');
  rect(g, 1, 8, 13, 1, 'b');
  rect(g, 1, 17, 13, 1, 'b');
  const bc = ['x', 'y', 's', 'p', 'i', 'w', 'T', 'C'];
  for (let i = 0; i < 13; i++) {
    const h1 = 3 + ((i * 5) % 4);
    rect(g, 1 + i, 8 - h1, 1, h1, bc[i % bc.length]);
    const h2 = 3 + ((i * 3) % 4);
    rect(g, 1 + i, 17 - h2, 1, h2, bc[(i + 2) % bc.length]);
    const h3 = 4 + ((i * 4) % 4);
    rect(g, 1 + i, 25 - h3, 1, h3, bc[(i + 5) % bc.length]);
  }
  S.shelf = out(g);
}

// ---- 门 13×28 ----
{
  const g = mk(13, 28);
  rect(g, 0, 0, 13, 28, 'D');
  rect(g, 1, 1, 11, 26, 'd');
  rect(g, 3, 4, 7, 7, 'e');
  rect(g, 3, 18, 7, 6, 'e');
  rect(g, 9, 13, 2, 3, 'y');
  S.door = out(g);
}

// ---- 绿植 14×24 ----
{
  const g = mk(14, 24);
  rect(g, 4, 18, 6, 6, 'o');    // 花盆
  rect(g, 3, 18, 8, 1, 'o');
  rect(g, 6, 13, 3, 5, 'P');    // 茎
  rect(g, 1, 9, 5, 6, 'p');     // 左叶
  rect(g, 8, 8, 5, 6, 'p');     // 右叶
  rect(g, 3, 3, 8, 7, 'p');     // 上叶
  rect(g, 4, 5, 6, 4, 'P');
  rect(g, 2, 6, 2, 3, 'P');
  rect(g, 10, 5, 2, 3, 'P');
  S.plant = out(g);
}

// ---- 地毯 60×12 ----
{
  const g = mk(60, 12);
  rect(g, 0, 0, 60, 12, '@');
  rect(g, 1, 1, 58, 10, 'O');
  rect(g, 1, 5, 58, 2, '%');
  S.rug = out(g);
}

// ---- 沙发 22×22（左：靠背在左，面朝右）----
{
  const g = mk(22, 22);
  rect(g, 1, 0, 6, 19, 's');    // 靠背（延伸到远侧扶手）
  rect(g, 2, 0, 4, 1, 's');
  rect(g, 1, 0, 6, 1, 'S');
  rect(g, 1, 9, 6, 1, 'S');     // 靠背与扶手的分界
  rect(g, 7, 13, 10, 5, 's');   // 坐垫
  rect(g, 7, 13, 10, 1, 'S');
  rect(g, 7, 17, 10, 1, 'S');
  rect(g, 17, 9, 4, 9, 's');    // 近侧扶手
  rect(g, 18, 8, 2, 1, 's');
  rect(g, 17, 17, 4, 1, 'S');
  rect(g, 2, 18, 18, 2, 'S');   // 底座
  rect(g, 3, 20, 2, 2, 'D');    // 腿
  rect(g, 17, 20, 2, 2, 'D');
  S.sofaL = out(g);
  S.sofaR = out(mirror(g));
}

// ---- 茶几 16×13 ----
{
  const g = mk(16, 13);
  rect(g, 0, 0, 16, 1, 'v');
  rect(g, 0, 1, 16, 3, 't');
  rect(g, 0, 4, 16, 1, 'u');
  rect(g, 1, 5, 2, 8, 'u');
  rect(g, 13, 5, 2, 8, 'u');
  rect(g, 3, 6, 10, 1, 'u');
  S.table = out(g);
}

// ---- 纸巾盒 7×5 ----
{
  const g = mk(7, 5);
  rect(g, 0, 2, 7, 3, 'T');
  rect(g, 0, 2, 7, 1, 'k');
  rect(g, 2, 0, 3, 2, 'w');
  S.tissue = out(g);
}

// ---- 水杯 4×6 ----
{
  const g = mk(4, 6);
  rect(g, 0, 0, 4, 1, 'V');
  rect(g, 0, 1, 1, 4, 'C');
  rect(g, 3, 1, 1, 4, 'C');
  rect(g, 1, 1, 2, 4, 'V');
  rect(g, 1, 5, 2, 1, 'C');
  S.cup = out(g);
}

// ---- 输出成 JS 字面量，写回 html ----
const body = Object.entries(S)
  .map(([name, rows]) =>
    '  ' + name + ': [\n' + rows.map((r) => "    '" + r + "',").join('\n') + '\n  ],')
  .join('\n');

let html = readFileSync(FILE, 'utf8');
const before = html;
html = html.replace(
  /\/\/ ==== SPRITES:BEGIN ====[\s\S]*?\/\/ ==== SPRITES:END ====/,
  '// ==== SPRITES:BEGIN ====\nconst SPRITES = {\n' + body + '\n};\n// ==== SPRITES:END ===='
);
if (html === before) { console.log('✗ 没找到 SPRITES 标记'); process.exit(1); }
writeFileSync(FILE, html, 'utf8');

let bad = 0;
for (const [name, rows] of Object.entries(S)) {
  const w = [...new Set(rows.map((r) => r.length))];
  if (w.length !== 1) bad++;
  console.log(`${w.length === 1 ? '✓' : '✗'} ${name}: ${rows[0].length} × ${rows.length}`);
}
console.log(bad === 0 ? '\n全部规整 ✅' : `\n有 ${bad} 个宽度不一致 ❌`);
