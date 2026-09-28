// 一次跑完所有检查。
// 用法：node tests/run-all.mjs
//
// 顺序有讲究：先构建，再静态/逻辑检查，最后才是要开浏览器的那些（慢）。
import { execFileSync } from 'node:child_process';

const STEPS = [
  ['构建单文件产物', 'build.mjs'],
  ['像素预览出图', 'tests/render-sprites.mjs'],
  ['自检（结构 / 美术 / 红线 / 剧情 / 渲染）', 'tests/check-game.mjs'],
  ['浏览器冒烟', 'tests/smoke-browser.mjs'],
  ['验收（存档 / 版面）', 'tests/check-acceptance.mjs'],
  ['真机走查（截图 + 走完整条线）', 'tests/walkthrough.mjs'],
];

let failed = 0;
for (const [label, file] of STEPS) {
  console.log(`\n${'━'.repeat(66)}\n▶ ${label}  (${file})\n${'━'.repeat(66)}`);
  try {
    execFileSync(process.execPath, [file], { stdio: 'inherit' });
  } catch (e) {
    failed++;
    console.log(`\n✗ "${label}" 失败（退出码 ${e.status}）`);
  }
}

console.log(`\n${'━'.repeat(66)}`);
if (failed === 0) {
  console.log('全部检查通过 ✅');
} else {
  console.log(`有 ${failed} 项失败 ❌`);
}
process.exit(failed === 0 ? 0 : 1);
