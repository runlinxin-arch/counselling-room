// 一次性校验脚本：检查像素画小样有没有硬伤
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const files = [
  ['方案A-纯CSS.html', 'docs/mockups/方案A-纯CSS.html'],
  ['方案B-内联SVG.html', 'docs/mockups/方案B-内联SVG.html'],
  ['方案C-Canvas自绘.html', 'docs/mockups/方案C-Canvas自绘.html'],
];

let bad = 0;
const fail = (m) => { console.log('  ✗ ' + m); bad++; };
const ok = (m) => console.log('  ✓ ' + m);
let GW = 106, GH = 60;

for (const [label, f] of files) {
  console.log('\n=== ' + label + ' ===');
  const html = readFileSync(f, 'utf8');

  for (const tag of ['html', 'head', 'body', 'style', 'script']) {
    const open = (html.match(new RegExp('<' + tag + '[\\s>]', 'g')) || []).length;
    const close = (html.match(new RegExp('</' + tag + '>', 'g')) || []).length;
    if (open !== close) fail(`<${tag}> 开合不匹配: ${open} / ${close}`);
  }
  ok('主要标签开合正常');

  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  if (!scripts.length) fail('没有 <script>');
  scripts.forEach((src, i) => {
    try { new vm.Script(src, { filename: label + '#' + i }); ok(`script[${i}] 语法正确`); }
    catch (e) { fail(`script[${i}] 语法错误: ${e.message}`); }
  });

  // 调色板（方案 A 是纯 CSS，本来就没有，跳过不算错）
  const pm = html.match(/const PAL = \{([\s\S]*?)\n\};/);
  if (!pm) { console.log('  – 没有调色板（方案 A 走的是纯 CSS，跳过像素检查）'); continue; }
  const pal = vm.runInNewContext('({\n' + pm[1] + '\n})');
  ok(`调色板 ${Object.keys(pal).length} 种颜色`);

  // 新版 B：SPRITES + SCENE + ITEMS
  const sm = html.match(/const SPRITES = \{([\s\S]*?)\n\};/);
  if (sm) {
    const sprites = vm.runInNewContext('({\n' + sm[1] + '\n})');
    const names = Object.keys(sprites);
    ok(`共 ${names.length} 个物件: ${names.join(' ')}`);

    for (const [name, rows] of Object.entries(sprites)) {
      const widths = [...new Set(rows.map((r) => r.length))];
      if (widths.length !== 1) {
        const want = rows[0].length;
        const bad = rows.map((r, i) => [i, r.length]).filter(([, n]) => n !== want);
        fail(`物件 "${name}" 每行宽度不一致（应为 ${want}）：第 ${bad.map(([i, n]) => i + ' 行是 ' + n).join('、')} 列`);
      }
      const used = [...new Set(rows.join('').split(''))].filter((c) => c !== ' ');
      const miss = used.filter((c) => !(c in pal));
      if (miss.length) fail(`物件 "${name}" 用了调色板没有的字符: ${miss.join(' ')}`);
    }
    ok('每个物件都是规整的矩形，且颜色都在调色板里');

    // 摆位是否越界
    const sceneM = html.match(/const SCENE = \[([\s\S]*?)\n\];/);
    const itemM = html.match(/const ITEMS = \[([\s\S]*?)\n\];/);
    const read = (m) => vm.runInNewContext('[' + m[1] + ']');
    const scene = sceneM ? read(sceneM) : [];
    const items = itemM ? read(itemM) : [];
    let out = 0;
    for (const [name, x, y] of scene) {
      const s = sprites[name];
      if (!s) { fail(`SCENE 里引用了不存在的物件 "${name}"`); out++; continue; }
      if (x < 0 || y < 0 || x + s[0].length > GW || y + s.length > GH) {
        fail(`"${name}" 摆在 (${x},${y}) 会超出 ${GW}×${GH} 画面`); out++;
      }
    }
    for (const it of items) {
      const s = sprites[it.sprite];
      if (!s) { fail(`ITEMS 里引用了不存在的物件 "${it.sprite}"`); out++; continue; }
      if (it.x + s[0].length > GW || it.y + s.length > GH) {
        fail(`物品 "${it.id}" 超出画面`); out++;
      }
    }
    if (out === 0) ok(`摆位全部在 ${GW}×${GH} 画面内（家具 ${scene.length} 件 / 可点物品 ${items.length} 件）`);
  } else {
    ok('（旧版结构，跳过像素地图检查）');
  }
}

console.log('\n' + (bad === 0 ? '全部通过 ✅' : `发现 ${bad} 个问题 ❌`));
process.exit(bad === 0 ? 0 : 1);
