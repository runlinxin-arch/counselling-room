// 真机走查：把产物加载进 Chrome，用注入的脚本把整条故事线走完，
// 在几个关键画面各截一张图，并确认过程中没有未捕获的报错。
//
// 为什么要这一步：像素画、对话框、督导笔记、日记面板都是"看着才知道对不对"的东西。
// 逻辑测试全绿也可能做出来很丑，或者根本看不见（我们踩过一次：整间房一个矩形都没画，
// 而所有静态检查全绿）。
//
// 用法：node tests/playthrough.mjs
import { readFileSync, writeFileSync, mkdtempSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { runChrome, cleanupProfile } from './lib/chrome.mjs';
import { decodePNG } from './lib/png.mjs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const SRC = resolve('心理咨询.html');
const SHOTS = resolve('docs/mockups/shots');
mkdirSync(SHOTS, { recursive: true });

const CANDIDATES = [
  // Windows
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  // macOS
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  // Linux
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
];
const chrome = CANDIDATES.find((p) => existsSync(p));
if (!chrome) { console.log('! 找不到 Chrome/Edge，跳过走查'); process.exit(0); }
if (!existsSync(SRC)) { console.error('✗ 先跑 node build.mjs'); process.exit(1); }

const html = readFileSync(SRC, 'utf8');

// ---------------------------------------------------------------------------
// 驱动片段
// ---------------------------------------------------------------------------

/**
 * 界面是否正在等玩家选。
 * 注意：选完的按钮**还留在 DOM 里**（只是点击入口被拦掉了），
 * 所以不能用 "存在 .choice" 判断，要看 #choices 的 display。
 */
const AWAITING = `(function () {
  var c = document.getElementById('choices');
  return !!c && c.style.display !== 'none' && c.querySelectorAll('.choice').length > 0;
})()`;

/**
 * 推进一小步。优先级很重要：
 *   日记面板 → 纸（督导笔记/科普/资源卡/成绩单） → 选项 → 正文
 *
 * 日记和纸是**两套**弹层：日记是 .diary + .btn.primary，别的纸是
 * #overlay.on .btn。一开始只认后者，结果驱动在日记那一步找不到按钮，
 * 一路空转到上限（表现是 paper 动作被点了 2985 次）。顺序写反了也会出问题。
 */
const DRIVE = (pick) => `
(function () {
  var diary = document.querySelector('.diary .btn.primary');
  if (diary) {
    // 日记的"继续"按钮在一条都没展开时是 disabled 的——这是故意的
    // （先看一条再谈）。disabled 的按钮对 click() 完全无反应，
    // 所以要先把条目展开，按钮才会亮。不这么做，驱动会一直点一个死按钮。
    if (diary.disabled) {
      var unopened = null;
      var all = document.querySelectorAll('.entry');
      for (var k = 0; k < all.length; k++) {
        if (!all[k].classList.contains('open')) { unopened = all[k]; break; }
      }
      if (unopened) { unopened.click(); return 'diaryEntry'; }
      return 'diaryStuck';
    }
    diary.click();
    return 'diary';
  }
  var paper = document.querySelector('#overlay.on .btn');
  if (paper) {
    var lab = document.querySelector('#overlay.on .label');
    window.__papers = (window.__papers || []).concat([lab ? lab.textContent : '?']);
    paper.click();
    return 'paper';
  }
  if (${AWAITING}) {
    var opts = document.querySelectorAll('.choice');
    var idx = Math.min(${pick}, opts.length - 1);
    if (opts[idx]) { opts[idx].click(); return 'choice'; }
  }
  var t = document.getElementById('text');
  // 这一段答完会滑进来一张督导笔记，纸自己推进：这时候点文字本来就该没反应。
  // 如实报出来，别当成卡住——等纸出来就行。
  if (t && t._awaitingNote) return 'waitNote';
  // 一句台词要点两下：第一下把打字机补完，第二下才真的往下走。
  // 两下之间隔开一点，让第一下真的把字写完。
  if (t && t._advance) {
    var line0 = window.XLZX.engine.state.line;
    t._advance();
    setTimeout(function () {
      if (window.XLZX.engine.state.line === line0) t._advance();
    }, 60);
    return 'text';
  }
  return 'stuck';
})()`;

/** 当前弹出的纸是不是某一类 */
const PAPER_IS = (word) => `(function () {
  var l = document.querySelector('#overlay.on .label');
  return !!l && l.textContent.indexOf(${JSON.stringify(word)}) >= 0;
})()`;

/**
 * 一直推进到 stop 条件成立。
 *
 * **每一步之间必须 await**：换小节时界面会淡出淡入（约 0.6 秒），
 * 这段时间 DOM 还停在旧节点上。同步死循环会在同一个节点上打转，
 * 看起来像"卡住了"，其实是没等转场。
 */
const PLAY_UNTIL = (stopCond, pick, max) => `
(async function () {
  var tally = { text: 0, choice: 0, paper: 0, diary: 0, diaryEntry: 0, waitNote: 0 };
  for (var i = 0; i < ${max}; i++) {
    if (${stopCond}) return 'reached@' + i;
    var did = ${DRIVE(pick)};
    if (did === 'stuck') return 'STUCK@' + i + ' ' + JSON.stringify(tally);
    tally[did]++;
    // 每一步都要留够时间：纸的滑入、打字机补完后的重绘、小节之间的淡入淡出。
    // 给太短的话驱动会跑在界面前面，看起来像"走不动"。
    await new Promise(function (r) { setTimeout(r, 90); });
  }
  return 'MAXED ' + JSON.stringify(tally);
})()`;

// ---------------------------------------------------------------------------
// 推进到危机关怀分支，并在那一步选「问」。
//
// 这一步是整条红线里最要紧的一条：玩家选了"问"，那后面**必须**出现写死的
// 关怀回应和资源卡，不能拖到别处去。所以单独走一遍，并且单独截图。
// ---------------------------------------------------------------------------
const TO_CRISIS_BRANCH = `
(async function () {
  // 从标题页从头开始。**不要依赖上一步走到哪**——每个断言步骤都是
  // 独立跑一次 Chrome，累计的中间状态只会让定位变得莫名其妙
  // （踩过一次：断言从上一步停在的日记面板往下走，永远找不到危机筛查）。
  (function () {
    window.XLZX.ui.restart();
    document.querySelector('.start').click();
    document.querySelector('.line-card[data-ready="true"]').click();
  })();
  await new Promise(function (r) { setTimeout(r, 220); });

  // 先推进到危机筛查那个选择点（选项里带"活着挺没意思"）
  for (var i = 0; i < 500; i++) {
    if (${AWAITING}) {
      var labels = document.querySelectorAll('.choice .label');
      var isScreen = false;
      for (var k = 0; k < labels.length; k++) {
        if (labels[k].textContent.indexOf('活着挺没意思') >= 0) isScreen = true;
      }
      if (isScreen) break;
    }
    var d = ${DRIVE(0)};
    if (d === 'stuck') return 'STUCK@' + i + ':line=' + window.XLZX.engine.state.line;
    await new Promise(function (r) { setTimeout(r, 16); });
  }
  // 选项里第一个就是「问」
  var opts = document.querySelectorAll('.choice .label');
  if (!opts.length) return 'NO_SCREEN_CHOICE@line=' + window.XLZX.engine.state.line;
  opts[0].click();
  // 一路推到危机关怀分支的第二个节点。
  // 用 state.line 判断最稳：不受打字机进度影响。
  for (var j = 0; j < 200; j++) {
    var line = window.XLZX.engine.state.line;
    if (line === 's1/cb2') return 'AT_BRANCH@' + j;
    var d2 = ${DRIVE(0)};
    if (d2 === 'stuck') return 'STUCK_AT_' + line;
    await new Promise(function (r) { setTimeout(r, 16); });
  }
  return 'BRANCH_LOST@' + window.XLZX.engine.state.line;
})()`;

/** 从危机关怀分支推到资源卡弹出来 */
const CRISIS_TO_RESOURCE = `
(async function () {
  for (var i = 0; i < 300; i++) {
    if (${PAPER_IS('求助资源')}) return 'RESOURCE_CARD@' + i;
    var d = ${DRIVE(0)};
    if (d === 'stuck') return 'STUCK@' + i;
    await new Promise(function (r) { setTimeout(r, 16); });
  }
  return 'NO_RESOURCE_CARD@' + window.XLZX.engine.state.line;
})()`;

const STEPS = [
  { shot: 'game-01-title', after: `/* 什么都不做，看标题页 */` },
  { shot: 'game-02-choose', after: `document.querySelector('.start').click();` },
  {
    shot: 'game-03-first-line',
    // 进游戏后立刻截图：打字机只写出一部分，正好看断句和光标
    after: `document.querySelector('.line-card[data-ready="true"]').click();`,
  },
  {
    shot: 'game-04-choice',
    after: `await ${PLAY_UNTIL(AWAITING, 0, 60)};`,
  },
  {
    shot: 'game-05-room-item',
    // 推到"房间里几样东西带光晕"那一段，热区这时才亮起来
    after: `await ${PLAY_UNTIL(`document.querySelectorAll('.hs').length > 0`, 0, 120)};`,
  },
  {
    shot: 'game-06-science-card',
    // 点墙上那个钟 → 弹科普卡
    after: `
      (function () {
        var hs = document.querySelectorAll('.hs');
        var target = null;
        for (var i = 0; i < hs.length; i++) {
          var t = hs[i].querySelector('title');
          if (t && t.textContent.indexOf('钟') >= 0) target = hs[i];
        }
        if (target) target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      })();`,
  },
  {
    shot: null,
    check: 'note',
    after: `
      // 督导笔记是整个界面唯一的记忆点（唯一的高亮物），必须看一眼。
      // 这里从头重来，只推到第一张笔记为止。
      window.XLZX.ui.restart();
      document.querySelector('.start').click();
      document.querySelector('.line-card[data-ready="true"]').click();
      await new Promise(function (r) { setTimeout(r, 200); });
      var a = await ${PLAY_UNTIL(PAPER_IS('督导'), 0, 300)};
      if (a.indexOf('reached') !== 0) {
        return 'NOTE_FAILED ' + a + ' papers=' + (window.__papers || []).join('/');
      }
      // 让那行字写完：督导笔记是逐字"写"出来的，截图要等它写完
      await new Promise(function (r) { setTimeout(r, 2600); });
      var ov = document.querySelector('#overlay.on');
      var body = ov ? ov.querySelector('.body') : null;
      var written = body ? body.textContent.replace(/\\s+/g, '').length : 0;
      return 'NOTE_OK written=' + written;
    `,
  },
  {
    shot: 'game-07-supervision-note',
    // 同样的路径，但这次把纸留在屏幕上截图（上面那一步是断言，不截图）
    after: `
      window.XLZX.ui.restart();
      document.querySelector('.start').click();
      document.querySelector('.line-card[data-ready="true"]').click();
      await new Promise(function (r) { setTimeout(r, 200); });
      await ${PLAY_UNTIL(PAPER_IS('督导'), 0, 200)};
      await new Promise(function (r) { setTimeout(r, 2600); });
      return 'ok';
    `,
  },
  {
    shot: 'game-08-crisis-branch',
    // 红线：选「问」，必须进到写死的关怀回应
    after: `await ${TO_CRISIS_BRANCH};`,
  },
  {
    shot: 'game-09-crisis-resource',
    // 红线：危机关怀必须弹出资源卡
    after: `await ${CRISIS_TO_RESOURCE};`,
  },
  {
    shot: 'game-10-diary',
    // 关掉资源卡，推到第 2 节开头的情绪日记，展开两条看排版
    after: `
      (function () { var b = document.querySelector('#overlay.on .btn'); if (b) b.click(); })();
      await new Promise(function (r) { setTimeout(r, 240); });
      await ${PLAY_UNTIL(`!!document.querySelector('.diary')`, 0, 600)};
      (function () {
        var es = document.querySelectorAll('.entry');
        if (es[0]) es[0].click();
        if (es[3]) es[3].click();
      })();`,
  },
  {
    shot: 'game-11-ending',
    after: `await ${PLAY_UNTIL(PAPER_IS('成绩'), 1, 900)};`,
  },

  // -------------------------------------------------------------------------
  // 下面两步不截图，是**断言**。
  //
  // 前面每一步能截到哪一屏，取决于剧情节奏——剧情一改，截图里的画面就换了。
  // 但"危机关怀必须走到资源卡"是红线，不能靠碰巧。所以单独跑一趟，
  // 把结果写进 title，由外面判定 reached / 失败。
  // -------------------------------------------------------------------------
  {
    shot: null,
    check: 'crisis',
    after: `
      var a = await ${TO_CRISIS_BRANCH};
      if (a.indexOf('AT_BRANCH') !== 0) return 'CRISIS_FAILED[stage1:' + a + ']';
      var r = await ${CRISIS_TO_RESOURCE};
      if (r.indexOf('RESOURCE_CARD') !== 0) return 'CRISIS_FAILED[stage2:' + r + ']';
      // 资源卡上的热线号码必须真的在页面上（不是只写在数据里）
      var ov = document.querySelector('#overlay.on');
      var txt = ov ? ov.textContent : '';
      var hasHotline = txt.indexOf('12356') >= 0 && txt.indexOf('010-82951332') >= 0 && txt.indexOf('120') >= 0;
      var lbl = ov && ov.querySelector('.label') ? ov.querySelector('.label').textContent : '-';
      return hasHotline ? ('CRISIS_CARD_OK label=' + lbl) : ('CRISIS_CARD_NO_HOTLINE label=' + lbl);
    `,
  },
  {
    shot: null,
    check: 'walk',
    after: `
      // 同样从头来一遍，走到危机分支再往下推到底——
      // 这样这条断言只依赖剧情本身，不依赖前面截到哪一屏。
      var a = await ${TO_CRISIS_BRANCH};
      if (a.indexOf('AT_BRANCH') !== 0) return 'WALK_FAILED[stage1:' + a + ']';
      var rc = await ${CRISIS_TO_RESOURCE};
      if (rc.indexOf('RESOURCE_CARD') !== 0) return 'WALK_FAILED[stage2:' + rc + ']';
      (function () { var b = document.querySelector('#overlay.on .btn'); if (b) b.click(); })();
      await new Promise(function (r) { setTimeout(r, 240); });
      var r = await ${PLAY_UNTIL(
        `window.XLZX.engine.state.line === 'end/2'`,
        0, 3000)};
      // MAXED 的时候只报"没走完"没用，得知道卡在哪一句、各动作各做了多少次
      return 'WALK_' + r + ' line=' + window.XLZX.engine.state.line;
    `,
  },
];

// 每步结尾把诊断写进 document.title —— --dump-dom 就能带回来
// "画了几个矩形、说了哪句话、弹的是哪张纸"，出问题时不用靠猜。
const DIAG = `
(function () {
  try {
    var svg = document.getElementById('scene');
    var t = document.getElementById('text');
    var lbl = document.querySelector('#overlay.on .label');
    var c = document.getElementById('choices');
    document.title = 'DIAG ' + (window.__step || '-') +
      ' | line=' + (window.XLZX && window.XLZX.engine ? window.XLZX.engine.state.line : '?') +
      ' rects=' + (svg ? svg.querySelectorAll('rect').length : -1) +
      ' hs=' + document.querySelectorAll('.hs').length +
      ' await=' + (!!c && c.style.display !== 'none' && c.querySelectorAll('.choice').length > 0 ? 'Y' : 'N') +
      ' hasAdv=' + (t && t._advance ? 'Y' : 'N') +
      ' waitNote=' + (t && t._awaitingNote ? 'Y' : 'N') +
      ' paper=' + (lbl ? lbl.textContent : '-') +
      ' text=' + JSON.stringify(t ? t.textContent.replace(/\\s+/g, ' ').slice(0, 18) : '');
  } catch (e) { document.title = 'DIAG ERROR ' + e.message; }
})();`;

function buildHarness(upto) {
  // 每步把驱动函数的返回值记下来（贴到 title 上），
  // 否则"卡住了"只能看到现象，看不到是 reached / stuck / maxed 哪一种。
  //
  // 整段必须 async —— 步骤体里有 await。写成普通 function 会让整块脚本
  // 直接语法错误，然后静默地"什么都没发生"（踩过一次）。
  const script = STEPS.slice(0, upto + 1).map((s, i) => `
try {
  await new Promise(function (r) { setTimeout(r, 200); });
  window.__step = 'step${i}';
  var r${i} = await (async function () { ${s.after} })();
  window.__step = 'step${i}=' + (r${i} === undefined ? 'ok' : r${i});
} catch (e) { document.title = 'STEP${i} FAILED ' + e.message; }`).join('\n');
  return `
<script>
// 内联脚本挂掉必须有人喊。写在最前面。
window.onerror = function (m, s, l, c) { document.title = 'ONERROR ' + m + ' @' + l; };
window.addEventListener('unhandledrejection', function (e) {
  document.title = 'REJECT ' + (e.reason && e.reason.message ? e.reason.message : e.reason);
});
window.addEventListener('load', function () {
  (async function () {
${script}
${DIAG}
  })().catch(function (e) { document.title = 'HARNESS FAILED ' + e.message; });
});
</script>
`;
}

// ---------------------------------------------------------------------------
const profile = mkdtempSync(join(tmpdir(), 'xlzx-play-'));
let failures = 0;

try {
  for (let i = 0; i < STEPS.length; i++) {
    const step = STEPS[i];
    const tag = step.shot || ('assert-' + step.check);
    const tmpHtml = join(profile, 'step' + i + '.html');
    writeFileSync(tmpHtml, html.replace('</body>', buildHarness(i) + '</body>'), 'utf8');

    // ⚠️ 先删掉这一步要写的截图。
    // 否则上一次跑留下的旧文件会被 runChrome 的"文件已完整"判断当成
    // 这一次已经写完，于是它在 Chrome 刚建好空文件时就 kill——留下 0 字节 PNG。
    // 这是偶发的（取决于时序），最容易骗过"测试全绿"。
    if (step.shot) rmSync(join(SHOTS, step.shot + '.png'), { force: true });

    const args = [
      '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
      '--user-data-dir=' + join(profile, 'p' + i),
      '--enable-logging=stderr', '--v=0',
      '--window-size=880,760',
      // 必须用虚拟时间：不加的话 Chrome 在 load 之后立刻就把 DOM 倒出来了，
      // 注入的那些 await 步骤一个都没跑完（标题还是页面原本的标题）。
      // 加了之后 setTimeout 会尽快推进，所以驱动里的等待只是"让出一帧"，
      // 不会真的把时间耗掉——循环上限要按步数给足，别按毫秒算。
      //
      // 这个值要给足：危机断言那两步要醒来回轮询，预算给小了会在
      // "DIAG 还没跑"的时候就被截断，表现为那一步在结果里凭空消失。
      // 给大不吃亏——反正 runChrome 读到 </html> 就收工，不会真等这么久。
      '--virtual-time-budget=900000',
      '--dump-dom',
    ];
    if (step.shot) args.push('--screenshot=' + join(SHOTS, step.shot + '.png'));
    args.push(pathToFileURL(tmpHtml).href);

    const { dom, stderr } = await runChrome(chrome, args);

    const title = (dom.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
    const errs = stderr.split('\n').filter((l) => /Uncaught/.test(l));
    const bad = title.match(/^(STEP\d+ FAILED|ONERROR|REJECT|HARNESS FAILED|DIAG ERROR)\s*(.*)$/);
    // 结果里可能有空格（"WALK_MAXED line=... text=..."），必须取到分隔符为止，
    // 用 \S+ 会被截成第一个词，排查时什么都看不到。
    const stepResult = (title.match(/step\d+=([\s\S]*?)(?=\s\|\sline=|$)/) || [])[1] || '';

    let driveBad = '';
    let assertBad = '';
    if (step.check) {
      // 断言步骤：返回值必须带指定的前缀，否则算失败
      if (step.check === 'crisis' && !/^CRISIS_CARD_OK/.test(stepResult)) {
        assertBad = '危机关怀没有走到资源卡（' + stepResult + '）';
      }
      if (step.check === 'walk' && !/^WALK_reached/.test(stepResult)) {
        assertBad = '从危机分支往下没走到底（' + stepResult + '）';
      }
      if (step.check === 'note' && !/^NOTE_OK/.test(stepResult)) {
        assertBad = '督导笔记没出来或没写出来（' + stepResult + '）';
      }
    } else if (stepResult && !/^(ok|reached@\d+)$/.test(stepResult)) {
      // 截图步骤：ok / reached 之外都不是好结果
      driveBad = '驱动结果：' + stepResult;
    }

    if (errs.length || bad || driveBad || assertBad) {
      failures++;
      console.log(`  ✗ ${tag}`);
      if (bad) console.log('      ' + title.slice(0, 200));
      if (assertBad) console.log('      ' + assertBad);
      if (driveBad) console.log('      ' + driveBad);
      errs.slice(0, 2).forEach((l) => console.log('      ' + l.trim().slice(0, 200)));
    } else {
      // 断言步骤没有 DIAG 那种信息量，直接把它的返回值露出来
      const shown = step.check ? stepResult : title.replace(/^DIAG /, '');
      console.log(`  ✓ ${tag}  ${shown}`);
    }
  }
} finally {
  cleanupProfile(profile);
}

// ---------------------------------------------------------------------------
// 截图完整性：必须真的是一张能解码的图。
//
// 为什么必须查：这个坑踩过两次，而**测试两次都是全绿的**——因为断言只看 title。
//   1. 只等 </html> 就 kill Chrome → PNG 还没编码，出现 0 字节图
//   2. 上一次跑留下的旧图被当成"这次写完了" → 同样 0 字节
// 截图是本项目"看着才知道对不对"的唯一手段（美术/排版都无法自动断言），
// 所以它自己必须被断言。
// ---------------------------------------------------------------------------
{
  const need = STEPS.filter((s) => s.shot).map((s) => s.shot);
  let broken = 0;
  for (const name of need) {
    const p = join(SHOTS, name + '.png');
    try {
      const img = decodePNG(p);
      if (!img || !img.width || !img.height) throw new Error('尺寸为 0');
    } catch (e) {
      broken++;
      failures++;
      console.log(`  ✗ ${name}.png 截图不可用：${e.message}`);
    }
  }
  if (!broken) console.log(`  ✓ ${need.length} 张截图都可正常解码`);
}

console.log('\n截图在 ' + SHOTS);
console.log(failures === 0 ? '走查没有报错 ✅' : `走查发现 ${failures} 处报错 ❌`);
process.exit(failures === 0 ? 0 : 1);
