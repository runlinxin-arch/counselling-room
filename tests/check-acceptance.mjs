// 验收里剩下的两条：
//   · 存档：玩到一半刷新页面，能接着上次继续
//   · 版面：1366×768 的笔记本上不横向滚动、房间和对话都在
//
// 用法：node tests/check-acceptance.mjs
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { findChrome, runChrome, titleOf, cleanupProfile } from './lib/chrome.mjs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const chrome = findChrome();
if (!chrome) { console.log('! 没有 Chrome，跳过'); process.exit(0); }

const html = readFileSync(resolve('心理咨询.html'), 'utf8');
const profile = mkdtempSync(join(tmpdir(), 'xlzx-acc-'));
let bad = 0;
const ok = (m) => console.log('  ✓ ' + m);
const fail = (m) => { console.log('  ✗ ' + m); bad++; };

// 不要用 execFileSync 等 Chrome 退出：macOS 上它吐完 DOM 也不结束，
// 每次都会白等到 timeout（这里原先是 300s，全套跑起来像卡死）。
// runChrome 读到 </html> 就收工。见 tests/lib/chrome.mjs
async function run(file, extraArgs = []) {
  const { dom } = await runChrome(chrome, [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
    '--user-data-dir=' + join(profile, 'p'),
    '--virtual-time-budget=300000',
    ...extraArgs,
    '--dump-dom',
    pathToFileURL(file).href,
  ], { timeoutMs: 300000 });
  return titleOf(dom);
}

console.log('=== 验收 · 存档与版面 ===');

// ---------------------------------------------------------------------------
// 1. 存档：第一个文件玩几步、落盘；第二个文件（同一 profile）应当能读出进度
// ---------------------------------------------------------------------------
const ADVANCE = `
<script>
window.addEventListener('load', function () {
  (async function () {
    document.querySelector('.start').click();
    document.querySelector('.line-card[data-ready="true"]').click();
    for (var i = 0; i < 12; i++) {
      var btn = document.querySelector('#overlay.on .btn');
      if (btn) { btn.click(); }
      else if (document.querySelectorAll('.choice').length && document.getElementById('choices').style.display !== 'none') {
        document.querySelectorAll('.choice')[0].click();
      } else {
        var t = document.getElementById('text');
        if (t && t._advance) t._advance();
      }
      await new Promise(function (r) { setTimeout(r, 24); });
    }
    var cur = null;
    try { cur = JSON.parse(localStorage.getItem('xlzx.save.v1')); } catch (e) {}
    document.title = 'ACC saved=' + (cur && cur.current ? cur.current.line : 'NONE') +
      ' story=' + (cur && cur.current ? cur.current.story : '-');
  })();
});
</script>`;

// 第一趟：造进度
const f1 = join(profile, 'a.html');
writeFileSync(f1, html.replace('</body>', ADVANCE + '</body>'), 'utf8');
const t1 = await run(f1);
const savedLine = (t1.match(/saved=(\S+)/) || [])[1] || 'NONE';
if (savedLine === 'NONE') fail('玩了几步，存档里没有 current：' + t1);
else ok('玩到一半，进度落盘了：' + savedLine);

// 第二趟：同一个 profile，只读存档，看标题页有没有"接着上次玩"
const READ = `
<script>
window.addEventListener('load', function () {
  var cur = null;
  try { cur = JSON.parse(localStorage.getItem('xlzx.save.v1')); } catch (e) {}
  var resume = document.querySelector('.resume');
  document.title = 'ACC line=' + (cur && cur.current ? cur.current.line : 'NONE') +
    ' resumeBtn=' + (resume ? 'YES' : 'NO') +
    ' text=' + JSON.stringify(resume ? resume.textContent.slice(0, 20) : '');
});
</script>`;
const f2 = join(profile, 'b.html');
writeFileSync(f2, html.replace('</body>', READ + '</body>'), 'utf8');
const t2 = await run(f2);
if (!/line=s1\//.test(t2)) fail('重新打开后读不到进度：' + t2);
else ok('重新打开能读到进度：' + t2.match(/line=\S+/)[0]);
if (!/resumeBtn=YES/.test(t2)) fail('标题页没有出现「接着上次玩」按钮：' + t2);
else ok('标题页出现「接着上次玩」');

// 第三趟：真的点一下"接着上次玩"，确认回到原来的节点
const RESUME = `
<script>
window.addEventListener('load', function () {
  (async function () {
    var btn = document.querySelector('.resume');
    if (!btn) { document.title = 'ACC no-resume-btn'; return; }
    btn.click();
    await new Promise(function (r) { setTimeout(r, 400); });
    var st = window.XLZX.engine.state;
    document.title = 'ACC screen=' + st.screen + ' line=' + st.line +
      ' scene=' + (document.getElementById('scene') ? 'Y' : 'N');
  })();
});
</script>`;
const f3 = join(profile, 'c.html');
writeFileSync(f3, html.replace('</body>', RESUME + '</body>'), 'utf8');
const t3 = await run(f3);
if (!/screen=story/.test(t3) || !/scene=Y/.test(t3)) fail('点「接着上次玩」没回到游戏：' + t3);
else ok('点「接着上次玩」直接回到游戏：' + t3.match(/line=\S+/)[0]);

// ---------------------------------------------------------------------------
// 2. 版面：1366×768 上不能横向滚动，房间和对话都要在
// ---------------------------------------------------------------------------
const LAYOUT = `
<script>
window.addEventListener('load', function () {
  (async function () {
    document.querySelector('.start').click();
    document.querySelector('.line-card[data-ready="true"]').click();
    await new Promise(function (r) { setTimeout(r, 500); });
    var de = document.documentElement;
    var room = document.getElementById('room');
    var panel = document.getElementById('panel');
    var r = room ? room.getBoundingClientRect() : null;
    var p = panel ? panel.getBoundingClientRect() : null;
    document.title = 'ACC hScroll=' + (de.scrollWidth > de.clientWidth ? 'YES' : 'NO') +
      ' vScroll=' + (de.scrollHeight > de.clientHeight + 1 ? 'YES' : 'NO') +
      ' roomW=' + (r ? Math.round(r.width) : -1) +
      ' roomH=' + (r ? Math.round(r.height) : -1) +
      ' panelBottom=' + (p ? Math.round(p.bottom) : -1) +
      ' win=' + window.innerWidth + 'x' + window.innerHeight;
  })();
});
</script>`;
const f4 = join(profile, 'd.html');
writeFileSync(f4, html.replace('</body>', LAYOUT + '</body>'), 'utf8');
const t4 = await run(f4, ['--window-size=1366,768']);
console.log('  · 1366×768：' + t4.replace(/^ACC /, ''));
if (/hScroll=YES/.test(t4)) fail('1366×768 上出现了横向滚动');
else ok('1366×768 上没有横向滚动');
if (/vScroll=YES/.test(t4)) fail('1366×768 上出现了纵向滚动（内容溢出视口）');
else ok('1366×768 上内容没有溢出视口');
const roomH = parseInt((t4.match(/roomH=(\d+)/) || [])[1] || '0', 10);
if (roomH < 200) fail(`房间只有 ${roomH}px 高，太小了`);
else ok(`房间 ${roomH}px 高`);
const pb = parseInt((t4.match(/panelBottom=(-?\d+)/) || [])[1] || '0', 10);
if (pb > 768 || pb < 400) fail(`对话区下边界在 ${pb}px，超出或不合理`);
else ok(`对话区在视口内（下边界 ${pb}px）`);

// 窄一点的笔记本也要能用
const t5 = await run(f4, ['--window-size=1280,720']);
console.log('  · 1280×720：' + t5.replace(/^ACC /, ''));
if (/hScroll=YES/.test(t5)) fail('1280×720 上出现了横向滚动');
else ok('1280×720 上没有横向滚动');

cleanupProfile(profile);
console.log('\n' + (bad === 0 ? '验收通过 ✅' : `验收发现 ${bad} 个问题 ❌`));
process.exit(bad === 0 ? 0 : 1);
