// 从已冻结的方案 B 小样里抽出 PAL / SPRITES / SHADOWS / SCENE / ITEMS / NOTES，
// 写成 src/sprites.json。美术已经定稿，抄一遍只会抄错，所以用抽的。
//
// 用法：node tools/extract-sprites.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import vm from 'node:vm';

const SRC = 'docs/mockups/方案B-内联SVG.html';
const OUT = 'src/sprites.json';

const html = readFileSync(SRC, 'utf8');

/**
 * 抠出一段 `const NAME = <字面量>;` 并求值。
 * 用括号配对而不是正则——SPRITES 里有嵌套的 `];`，正则一定会截错。
 */
function grab(name) {
  const at = html.indexOf('const ' + name + ' =');
  if (at < 0) throw new Error(`在 ${SRC} 里找不到 ${name}`);
  const open = html.indexOf('=', at) + 1;
  let i = open;
  while (i < html.length && /[\s]/.test(html[i])) i++;
  const opener = html[i];
  const closer = opener === '{' ? '}' : opener === '[' ? ']' : null;
  if (!closer) throw new Error(`${name} 不是对象或数组字面量`);

  // 逐字符配对，跳过字符串里的括号
  let depth = 0;
  let quote = null;
  for (let j = i; j < html.length; j++) {
    const c = html[j];
    if (quote) {
      if (c === '\\') { j++; continue; }
      if (c === quote) quote = null;
      continue;
    }
    if (c === "'" || c === '"' || c === '`') { quote = c; continue; }
    if (c === opener) depth++;
    else if (c === closer) {
      depth--;
      if (depth === 0) return vm.runInNewContext('(' + html.slice(i, j + 1) + ')');
    }
  }
  throw new Error(`${name} 的括号没有配平`);
}

const PAL = grab('PAL');
const SPRITES = grab('SPRITES');
const SHADOWS = grab('SHADOWS');
const SCENE = grab('SCENE');
const ITEMS = grab('ITEMS');
const NOTES = grab('NOTES');

// ---- 顺手验一遍，抽出来的东西必须本身是好的 ----
const problems = [];
for (const [name, rows] of Object.entries(SPRITES)) {
  const widths = [...new Set(rows.map((r) => r.length))];
  if (widths.length !== 1) problems.push(`${name}：行宽不一致 ${widths.join('/')}`);
  const used = [...new Set(rows.join('').split(''))].filter((c) => c !== ' ');
  const miss = used.filter((c) => !(c in PAL));
  if (miss.length) problems.push(`${name}：用了调色板外的字符 ${miss.join(' ')}`);
}

const out = {
  _source: SRC,
  _note: '由 tools/extract-sprites.mjs 自动抽出，不要手改；美术以 docs/mockups/方案B-内联SVG.html 为准',
  size: { w: 106, h: 60 },
  pal: PAL,
  sprites: SPRITES,
  shadows: SHADOWS,
  scene: SCENE,
  items: ITEMS,
  notes: NOTES,
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n', 'utf8');

console.log(`✓ 调色板 ${Object.keys(PAL).length} 色`);
console.log(`✓ 物件 ${Object.keys(SPRITES).length} 个：${Object.keys(SPRITES).join(' ')}`);
console.log(`✓ 摆位 ${SCENE.length} 件 / 可点物品 ${ITEMS.length} 件`);
console.log(`✓ 写入 ${OUT}`);
if (problems.length) {
  console.log('\n✗ 有问题：\n  ' + problems.join('\n  '));
  process.exit(1);
}
console.log('✓ 全部规整');
