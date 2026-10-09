// 把 src/ 下的源码合成**一个** HTML 文件。
// 交付物是单文件，但开发时不该是单文件——所以这里是唯一的合并点。
//
// 用法：node build.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const read = (p) => readFileSync(p, 'utf8');

// 顺序有讲究：
//   1. sprites.js  先定义 XLZX 命名空间和调色板扩展
//   2. story.js    内容数据（自己会 var XLZX = window.XLZX || {}）
//   3. engine.js   状态机 + 场景渲染
//   4. ui.js       界面，最后 boot
const JS_FILES = ['src/sprites.js', 'src/story.js', 'src/story-amp.js', 'src/engine.js', 'src/ui.js'];

const shell = read('src/shell.html');
const css = read('src/styles.css');
const sprites = read('src/sprites.json');

const js = JS_FILES.map((f) => {
  const body = read(f);
  return `/* ===== ${f} ===== */\n${body.trim()}\n`;
}).join('\n');

// 启动。像素数据由 src/sprites.js 在加载时自己抓（engine 在加载时就要用它），
// 所以这里只需要 boot。
const boot = `
/* ===== 启动 ===== */
window.XLZX.ui.boot();
`;

let jsOut = js + boot;

// ---- 内联 <script> 的两个经典坑，这里一次钉死 ----
//
// 1. 源码里只要出现 `</script`（哪怕是在字符串里），HTML 解析器就会当场把脚本截断，
//    后面的代码全变成页面文字。这是最阴的一种坏法——语法检查全过，页面却是死的。
//    转义成 `<\/script`：在 JS 字符串和正则里 `\/` 都等于 `/`，语义不变。
const before = jsOut;
jsOut = jsOut.replace(/<\/script/gi, '<\\/script');
if (jsOut !== before) {
  console.log('  · 转义了源码里的 </script（否则会把脚本截断）');
}

// 开标签形态的 `<script` 同样危险（HTML 里裸的 `<script` 会让解析器进入脚本模式）。
// 它不该出现在代码里——遇上了就报错，让人去改源码，不要在这层悄悄糊过去。
const strayOpen = jsOut.match(/<script[\s>]/gi);
if (strayOpen) {
  console.error(`✗ 源码里有 ${strayOpen.length} 处裸的 <script。`);
  console.error('  这会在内联时把 HTML 结构搞坏。把它从注释/字符串里删掉，');
  console.error('  或者写成 "脚本标签" 四个字。');
  process.exit(1);
}

// 2. JSON 里出现 `</` 同理（JSON 不支持 `\/`，改用 Unicode 转义）
const spritesSafe = sprites.replace(/<\/(script)/gi, '<\\u002f$1');
if (spritesSafe !== sprites) {
  console.log('  · 转义了像素数据里的 </script');
}

let out = shell;
out = out.replace('/*INJECT:css*/', () => css.trim());
out = out.replace('/*INJECT:sprites*/', () => spritesSafe.trim());
out = out.replace('/*INJECT:js*/', () => jsOut);

// 占位符必须都被替换掉，否则产物是坏的
['css', 'sprites', 'js'].forEach((k) => {
  if (out.indexOf('/*INJECT:' + k + '*/') >= 0) {
    console.error(`✗ 占位符 /*INJECT:${k}*/ 没被替换`);
    process.exit(1);
  }
});

const OUT = '心理咨询.html';
writeFileSync(OUT, out, 'utf8');

const kb = (n) => (n / 1024).toFixed(1) + ' KB';
console.log('✓ ' + OUT);
console.log('  css  ' + kb(css.length));
console.log('  art  ' + kb(sprites.length));
console.log('  js   ' + kb(jsOut.length));
console.log('  合计 ' + kb(out.length));
