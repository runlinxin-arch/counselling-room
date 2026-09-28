// 冒烟测试：把产物丢进真正的 Chrome，确认
//   1. 没有未捕获的运行时错误（语法检查查不出这类问题）
//   2. 启动之后页面上真的有东西（不是一整片黑）
//
// 为什么必须做这一步：我们踩过一次坑——engine.js 在加载时就用 sprites.pal，
// 但像素数据那时还没赋进去。node --check 全绿，页面却是一整片黑。
//
// 用法：node tests/smoke-browser.mjs
import { readFileSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const FILE = resolve('心理咨询.html');
if (!existsSync(FILE)) {
  console.error('✗ 找不到 心理咨询.html，先跑 node build.mjs');
  process.exit(1);
}

const IS_WIN = process.platform === 'win32';
const WIN_CANDIDATES = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
];
const NIX_CANDIDATES = ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'];

let chrome = null;
if (IS_WIN) {
  chrome = WIN_CANDIDATES.find((p) => existsSync(p)) || null;
} else {
  chrome = NIX_CANDIDATES.find((p) => existsSync(p)) || null;
  if (!chrome) {
    for (const name of ['google-chrome', 'chromium', 'chromium-browser']) {
      try {
        const p = execFileSync('which', [name], { encoding: 'utf8' }).trim();
        if (p) { chrome = p; break; }
      } catch (e) { /* 没装 */ }
    }
  }
}
if (!chrome) {
  console.log('! 找不到 Chrome/Edge，跳过浏览器冒烟测试');
  process.exit(0);
}

/**
 * 本地文件 → file:// URL。
 * fileURLToPath / pathToFileURL 是一对，别自己拼字符串：
 * 拼错了会把盘符也编码成 %3A，Chrome 直接 ERR_FILE_NOT_FOUND。
 */
const url = pathToFileURL(FILE).href;

const profile = mkdtempSync(join(tmpdir(), 'xlzx-smoke-'));
const shot = join(resolve('docs/mockups/shots'), 'game-01-title.png');
let stderr = '';
let dom = '';

try {
  // 跑真实时间，不加 --virtual-time-budget：那样会把 setTimeout 一次性烧完，
  // 看到的是终态，而我们要看的是"启动那一下"。
  // --dump-dom 和 --screenshot 可以同时给，一次跑完两件事。
  const args = [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
    '--user-data-dir=' + profile,
    '--enable-logging=stderr', '--v=0',
    '--window-size=880,760',
    '--screenshot=' + shot,
    '--dump-dom',
    url,
  ];
  try {
    dom = execFileSync(chrome, args, { encoding: 'utf8', timeout: 60000, stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (e) {
    // Chrome 经常"东西都写出来了但退出码非 0"。stdout / stderr 照样有效。
    dom = (e.stdout || '') + '';
    stderr = (e.stderr || '') + '';
  }
} finally {
  rmSync(profile, { recursive: true, force: true });
}

let bad = 0;
const ok = (m) => console.log('  ✓ ' + m);
const fail = (m) => { console.log('  ✗ ' + m); bad++; };

console.log('=== 浏览器冒烟 ===');
console.log('  · ' + chrome);

// ---- 1. 控制台有没有未捕获的错误 ----
const errLines = stderr.split('\n').filter((l) => /Uncaught|CONSOLE.*ERROR|SEVERE/i.test(l));
const uncaught = errLines.filter((l) => /Uncaught/.test(l));
if (uncaught.length) {
  fail('页面抛了未捕获的错误：');
  uncaught.slice(0, 5).forEach((l) => console.log('      ' + l.trim().slice(0, 220)));
} else {
  ok('没有未捕获的运行时错误');
}

// ---- 2. 启动之后页面上真的有东西 ----
if (!dom) {
  fail('拿不到渲染后的 DOM');
} else {
  const need = [
    ['心理咨询', '标题'],
    ['康复心理学 · 课程作业', '页头小字'],
    ['本作品为康复心理学课程作业', '虚构声明'],
    ['12356', '热线'],
    ['不能替代真实心理咨询', '免责声明'],
    ['开始', '开始按钮'],
  ];
  let miss = 0;
  for (const [needle, what] of need) {
    if (dom.indexOf(needle) < 0) { fail(`标题页缺少${what}（找不到「${needle}」）`); miss++; }
  }
  if (!miss) ok('标题页渲染完整（标题 / 声明 / 热线 / 开始按钮都在）');

  // 挂载点不能是空的 —— 空了就说明 boot 没跑起来
  const mainEmpty = /<main id="main">\s*<\/main>/.test(dom);
  if (mainEmpty) fail('<main id="main"> 是空的，说明界面没启动');
  else ok('界面挂载点有内容');

  // noscript 不该被渲染出来
  if (/class="noscript"/.test(dom) && !/<noscript>/.test(dom)) fail('noscript 内容被渲染了');
  else ok('noscript 兜底没有被渲染');
}

console.log('\n' + (bad === 0 ? '冒烟通过 ✅' : `冒烟发现 ${bad} 个问题 ❌`));
process.exit(bad === 0 ? 0 : 1);
