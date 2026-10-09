// ============================================================================
// 自检：产物 心理咨询.html 有没有硬伤
// 用法：node tests/check-game.mjs
//
// 分五层，任何一层失败退出码都是 1：
//   A 结构    标签、占位符、外链、内联脚本的标签陷阱
//   B 美术    像素地图的行宽 / 调色板 / 摆位
//   C 红线    热线次数、声明、禁用词、数字白名单（对照 docs/design 第七节）
//   D 剧情    节点图：没有落空的跳转、没有孤岛、没有死路、危机分支写死
//   E 跑起来  renderScene 真的调一遍（不是只 load）——"变量没定义"只有跑了才炸
// ============================================================================
import { readFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';

const FILE = '心理咨询.html';
if (!existsSync(FILE)) {
  console.error('✗ 找不到 ' + FILE + '，先跑 node build.mjs');
  process.exit(1);
}
const html = readFileSync(FILE, 'utf8');

let bad = 0;
const ok = (m) => console.log('  ✓ ' + m);
const fail = (m) => { console.log('  ✗ ' + m); bad++; };
const note = (m) => console.log('  · ' + m);
const head = (m) => console.log('\n=== ' + m + ' ===');

// ===========================================================================
head('A · 结构');
// ===========================================================================
// 开标签的 (?![\/\w]) 是为了不把 </script> 也数进去
for (const tag of ['html', 'head', 'body', 'style', 'script', 'main', 'section', 'header']) {
  const open = (html.match(new RegExp('<' + tag + '(?![\\/\\w])', 'g')) || []).length;
  const close = (html.match(new RegExp('</' + tag + '\\s*>', 'g')) || []).length;
  if (open !== close) fail(`<${tag}> 开合不匹配：${open} / ${close}`);
}
ok('主要标签开合正常');

if (html.includes('/*INJECT:')) fail('还有没替换的 INJECT 占位符');
else ok('没有残留占位符');

if (!/id="sprites-data"/.test(html)) fail('缺少 sprites-data');
else ok('sprites-data 在');

// 内联脚本里绝不能出现标签形态的 script：
// HTML 解析器看到就当场截断，后面全变成页面上的文字。
// **语法检查一点问题都看不出来**，所以必须单独查。
const jsOpen = html.lastIndexOf('<script>');
const jsClose = html.lastIndexOf('</script>');
const scriptBody = html.slice(jsOpen + '<script>'.length, jsClose);
if (jsOpen < 0 || jsClose < 0) fail('找不到内联脚本');
else if (/<script[\s>]/i.test(scriptBody)) fail('内联脚本里出现了裸的 <script，会把 HTML 结构搞坏');
else ok(`内联脚本里没有标签形态的 script（${scriptBody.length} 字符）`);

// 外链必须为 0 —— 交付物是"双击即玩、无依赖"
const externals = [...html.matchAll(/(?:src|href)\s*=\s*["'](?!#)([^"']+)["']/g)].map((m) => m[1]);
if (externals.length) fail('存在外部引用（应为 0）：' + externals.join(', '));
else ok('没有任何外部引用');

for (const [pattern, why] of [
  [/\bfetch\s*\(/, 'fetch 在 file:// 下会被拦'],
  [/XMLHttpRequest/, 'XHR 同'],
  [/^\s*import\s/m, 'ES module 同'],
  [/type=["']module["']/, 'ES module 同'],
]) {
  if (pattern.test(scriptBody)) fail('用了会受 file:// 限制的写法：' + why);
}
ok('没有 fetch / XHR / ES module');

// ===========================================================================
head('B · 美术');
// ===========================================================================
const spritesJson = JSON.parse(readFileSync('src/sprites.json', 'utf8'));
const PAL = { ...spritesJson.pal };

// 把 src/sprites.js 求值，拿立绘和补充调色板。
// 去掉注释行：中文注释里有反引号和括号，容易干扰 vm。
const spritesJs = readFileSync('src/sprites.js', 'utf8').replace(/^\s*\/\/.*$/gm, '');
const extra = vm.runInNewContext(
  spritesJs + '\n;({ PAL_EXT, WHEELCHAIR, REFERRAL, TISSUE, LINYUE, COUNSELOR, CHARS, CLOCK_VARIANTS, WARMTH })'
);
Object.assign(PAL, extra.PAL_EXT);

let spriteBad = 0;
function auditSprite(name, rows) {
  const widths = [...new Set(rows.map((r) => r.length))];
  if (widths.length !== 1) { fail(`物件 "${name}" 行宽不一致：${widths.join(' / ')}`); spriteBad++; }
  const used = [...new Set(rows.join('').split(''))].filter((c) => c !== ' ');
  const miss = used.filter((c) => !(c in PAL));
  if (miss.length) { fail(`物件 "${name}" 用了调色板外的字符：${miss.join(' ')}`); spriteBad++; }
}
const allSprites = {
  ...spritesJson.sprites,
  WHEELCHAIR: extra.WHEELCHAIR, REFERRAL: extra.REFERRAL, TISSUE: extra.TISSUE,
  LINYUE: extra.LINYUE, COUNSELOR: extra.COUNSELOR,
  ...extra.CLOCK_VARIANTS,
};
for (const [n, rows] of Object.entries(allSprites)) auditSprite(n, rows);
if (!spriteBad) ok(`${Object.keys(allSprites).length} 个物件行宽一致、颜色都在调色板内（${Object.keys(PAL).length} 色）`);

// 摆位不越界
const GW = spritesJson.size.w, GH = spritesJson.size.h;
let oob = 0;
for (const [name, x, y] of spritesJson.scene) {
  const s = spritesJson.sprites[name];
  if (!s) { fail(`SCENE 引用了不存在的物件 "${name}"`); oob++; continue; }
  if (x < 0 || y < 0 || x + s[0].length > GW || y + s.length > GH) {
    fail(`"${name}" 摆在 (${x},${y}) 超出 ${GW}×${GH}`); oob++;
  }
}
for (const [name, x, y, s] of [
  ['WHEELCHAIR', extra.CHARS.client.chairX, extra.CHARS.client.chairY, extra.WHEELCHAIR],
  ['LINYUE', extra.CHARS.client.bodyX, extra.CHARS.client.bodyY, extra.LINYUE],
  ['COUNSELOR', extra.CHARS.counselor.bodyX, extra.CHARS.counselor.bodyY, extra.COUNSELOR],
]) {
  if (x < 0 || y < 0 || x + s[0].length > GW || y + s.length > GH) {
    fail(`"${name}" 摆在 (${x},${y}) 超出画面`); oob++;
  }
}
if (!oob) ok(`摆位全部在 ${GW}×${GH} 画布内`);

// ===========================================================================
head('C · 红线（对照 docs/design 第七节）');
// ===========================================================================
const count = (needle) => html.split(needle).length - 1;
const hot = {
  '12356': count('12356'),
  '010-82951332': count('010-82951332'),
  '120': count('拨打 120'),
};
ok(`热线出现次数：${Object.entries(hot).map(([k, v]) => k + '×' + v).join('，')}`);
for (const [num, n] of Object.entries(hot)) {
  if (n < 3) fail(`${num} 只出现 ${n} 次，要求 ≥3（标题页 / 常驻入口 / 终章）`);
}
if (Object.values(hot).every((n) => n >= 3)) ok('三条热线都出现 ≥3 处');

// 声明用语义片段查，不查整句——句子会改，意思不能丢
let missing = 0;
for (const [needle, what] of [
  ['课程作业', '这是课程作业'],
  ['均为虚构', '人物机构事件虚构'],
  ['与任何真实的人、单位、事件无关', '不影射真人真事'],
  ['不能替代真实心理咨询', '免责声明'],
  ['不构成任何医疗建议', '免责声明'],
]) {
  if (!html.includes(needle)) { fail(`缺少声明（${what}）：找不到「${needle}」`); missing++; }
}
if (!missing) ok('虚构声明 + 免责声明齐全');


// ---- 玩家可见散文（提前算一份，供禁用词校验使用）----
// 原则：只查玩家真正会读到的字段，不查注释、清单、参考文献。
function extraProseOf(src) {
  const out = [];
  for (const raw of src.split('\n')) {
    const line = raw.trim();
    if (line.startsWith('//')) continue;
    if (!/^(text|lines|label|lead|closing|footer|prompt|hint|title)\s*:/.test(line)) continue;
    if (/依据|出处|et al|\(\d{4}\)/.test(line)) continue;
    out.push(line);
  }
  return out.join('\n');
}
const earlyProse = ['src/story.js', 'src/story-amp.js']
  .map((f) => extraProseOf(readFileSync(f, 'utf8'))).join('\n');

// 禁用词
const BANNED = [
  ['抑郁病', '术语应为「抑郁症 / 抑郁障碍」'],
  ['精神病', '术语不规范'],
  ['瘫子', '非 person-first'],
  ['残疾人', '非 person-first'],
  ['恢复正常', '避免「恢复正常」叙事'],
  ['重新站起来', '避免「恢复正常」叙事'],
  ['吃抗抑郁药', '咨询师不给药物建议'],
  ['我诊断', '咨询师不下诊断'],
  ['悲伤五阶段是', '不能把五阶段当事实'],
];
// 只在玩家看得见的散文里查。扫整份 HTML 会把这份清单自己也扫进去，
// 于是每跑必报——这个检查之前一直处于"永远失败"的假状态。
const bannedHits = [];
for (const [needle, why] of BANNED) {
  if (earlyProse.includes(needle)) bannedHits.push(needle + '（' + why + '）');
}
if (bannedHits.length) fail('出现禁用词：' + bannedHits.join('；'));
else ok(`${BANNED.length} 个禁用词都没出现`);

// 数字白名单：剧情里只允许这些数字（出处见 docs/design 第七节那张表）。
//
// 只扫**玩家看得见的散文**，不扫注释与参考文献年份：
// 早先整份源码一起扫，2009/2016 这类引文年份和作者名里的数字全被算成
// "剧情数字"，刷出一长串，真出问题时反而淹没在里面。
const ALLOWED = new Set([
  '106', '60', '39', '5', '7', '9', '14', '16', '17', '18', '22', '26', '28',
  '66', '13', '10', '11', '24', '32', '50', '90', '120', '12356', '82951332', '010',
  '0', '1', '2', '3', '4', '6', '8', '12', '15', '20', '41',
  // 故事线二用到的手册第 16 章数据（逐条已核）
  '23.5', '2.9', '17.6', '19.1', '12.9', '32.7', '29.9', '12.6', '37.5', '35.5', '65',
]);

/** 收集玩家可见的散文（跳过注释与出处行） */
function proseOf(src) {
  const out = [];
  for (const raw of src.split('\n')) {
    const line = raw.trim();
    if (line.startsWith('//')) continue;
    if (!/^(text|lines|label|lead|closing|footer|prompt|hint|title)\s*:/.test(line)) continue;
    // 出处行不计入：里面必然带年份与 et al
    if (/依据|出处|et al|\(\d{4}\)/.test(line)) continue;
    out.push(line);
  }
  return out.join('\n');
}
const STORY_FILES = ['src/story.js', 'src/story-amp.js'];
const storySrc = STORY_FILES.map((f) => readFileSync(f, 'utf8')).join('\n');
const prose = STORY_FILES.map((f) => proseOf(readFileSync(f, 'utf8'))).join('\n');

// 先摘掉时刻（如 2:40）：那是记录时间，不是需要出处的统计数字
const proseNoTime = prose.replace(/\d{1,2}:\d{2}/g, ' ');
const nums = [...new Set([...proseNoTime.matchAll(/\d+(?:\.\d+)?/g)].map((m) => m[0]))];
const stranger = nums.filter((n) => {
  if (ALLOWED.has(n)) return false;
  if (/^(19|20)\d{2}$/.test(n)) return false;   // 年份：出处，不是剧情数字
  return true;
});
if (stranger.length) {
  note("剧情里出现白名单外的数字：" + stranger.join(' '));
  note("  逐个确认在剧本文件里有出处；没有出处的就是 bug");
} else {
  ok('剧情里所有数字都在白名单内');
}
if (/自杀[^。]{0,20}\d+(\.\d+)?\s*%/.test(storySrc)) fail('写了自杀率数字——书里没给，不许编');
else ok('没有编造自杀率数字');

// ===========================================================================
head('D · 剧情');
// ===========================================================================
const sandbox = {
  window: {},
  console: { log() {}, warn() {}, error() {} },
  localStorage: undefined,
  document: undefined,
};
sandbox.window.XLZX = {};
vm.createContext(sandbox);
const loadInto = (f) => vm.runInContext(readFileSync(f, 'utf8'), sandbox, { filename: f });

// 引擎依赖 document.createElementNS —— 给个够用的最小替身
function mkEl(name) {
  return {
    nodeName: name, childNodes: [], attributes: {}, style: {},
    setAttribute(k, v) { this.attributes[k] = String(v); },
    getAttribute(k) { return this.attributes[k]; },
    appendChild(c) { this.childNodes.push(c); return c; },
    addEventListener() {},
    querySelectorAll(sel) {
      const out = [];
      (function walk(n) {
        (n.childNodes || []).forEach((c) => {
          if (c.nodeName === sel) out.push(c);
          walk(c);
        });
      })(this);
      return out;
    },
  };
}
sandbox.document = {
  createElementNS: (ns, name) => mkEl(name),
  createElement: (name) => mkEl(name),
  // sprites.js 在加载时就会抓页面里那段 application/json，
  // 所以 getElementById 必须在这之前就存在（产物里它也是这个时序）。
  getElementById: () => null,
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener() {},
};

try {
  sandbox.window.XLZX.sprites = spritesJson;
  loadInto('src/sprites.js');
  loadInto('src/story.js');
  loadInto('src/story-amp.js');
  loadInto('src/engine.js');
  ok('sprites / 两条故事线 / engine 能在 vm 里加载');
} catch (e) {
  fail('加载源码失败：' + e.message);
}

const X = sandbox.window.XLZX;
const E = X.engine;
// 校验**所有**已注册的故事线（X.stories 由 engine.js 建）。
// 只有一个 storySci 时，加进来的新线会完全绕过自检。
const stories = Object.values(X.stories || {});

if (!E || stories.length === 0) {
  fail('engine 或故事没挂上');
} else {
  for (const story of stories) {
  // ---- 节点图 ----
  const ids = new Set();
  for (const s of story.sections) for (const k of Object.keys(s.nodes)) ids.add(s.id + '/' + k);
  for (const k of Object.keys(story.endingNodes)) ids.add('end/' + k);
  ok(`节点 ${ids.size} 个（${story.sections.map((s) => s.id + ':' + Object.keys(s.nodes).length).join(' ')} + 终章 ${Object.keys(story.endingNodes).length}）`);

  const outEdges = new Map();
  let dangling = 0;
  for (const s of story.sections) {
    for (const [k, n] of Object.entries(s.nodes)) {
      const here = s.id + '/' + k;
      const targets = [];
      if (n.next !== undefined) targets.push(n.next);
      if (n.options) n.options.forEach((o) => targets.push(o.next));
      outEdges.set(here, targets.filter((t) => t !== null && t !== undefined)
        .map((t) => E.resolve(story, here, t)));
      for (const t of targets) {
        if (t === null || t === undefined) continue;
        const r = E.resolve(story, here, t);
        if (!ids.has(r)) { fail(`落空的跳转 ${here} → ${t}（解析成 ${r}）`); dangling++; }
      }
    }
  }
  for (const [k, n] of Object.entries(story.endingNodes)) {
    if (n.next === null || n.next === undefined) continue;
    const r = E.resolve(story, 'end/' + k, n.next);
    if (!ids.has(r)) { fail(`落空的跳转 end/${k} → ${n.next}`); dangling++; }
  }
  if (!dangling) ok('所有 next 都有落点');

  // ---- 无孤岛 ----
  const reach = (from) => {
    const seen = new Set();
    const stack = [from];
    while (stack.length) {
      const at = stack.pop();
      if (seen.has(at)) continue;
      seen.add(at);
      for (const e of outEdges.get(at) || []) if (e) stack.push(e);
      if (at.startsWith('end/')) {
        const nn = story.endingNodes[at.slice(4)];
        if (nn && nn.next) stack.push(E.resolve(story, at, nn.next));
      }
    }
    return seen;
  };
  const fromStart = reach(story.start);
  const unreachable = [...ids].filter((id) => !fromStart.has(id));
  if (unreachable.length) fail(`${unreachable.length} 个节点走不到：${unreachable.slice(0, 8).join(' ')}`);
  else ok(`从起点可达全部 ${ids.size} 个节点`);
  if (fromStart.has('end/1') && fromStart.has('end/2')) ok('终章可达');
  else fail('终章走不到');

  // ---- 选择点 ----
  let choiceBad = 0, totalOpts = 0;
  for (const s of story.sections) {
    for (const [k, n] of Object.entries(s.nodes)) {
      if (n.type !== 'choice') continue;
      if (!n.options || n.options.length < 2) { fail(`${s.id}/${k} 选项少于 2 个`); choiceBad++; continue; }
      totalOpts += n.options.length;
      const labels = n.options.map((o) => o.label);
      if (new Set(labels).size !== labels.length) { fail(`${s.id}/${k} 有重复选项`); choiceBad++; }
      if (n.options.some((o) => !o.next)) { fail(`${s.id}/${k} 有选项没有 next`); choiceBad++; }
    }
  }
  if (!choiceBad) ok('每个选择点都有 ≥2 个不重复的选项，且都有下文');

  // ---- 逐个选项都必须能到终章（没有"答错就卡死"）----
  let deadEnds = 0;
  for (const s of story.sections) {
    for (const [k, n] of Object.entries(s.nodes)) {
      if (n.type !== 'choice') continue;
      for (const o of n.options) {
        const start = E.resolve(story, s.id + '/' + k, o.next);
        if (!reach(start).has('end/2')) {
          fail(`${s.id}/${k} 选项 ${o.key}「${o.label}」走不到终章`); deadEnds++;
        }
      }
    }
  }
  if (!deadEnds) ok(`逐个走完全部 ${totalOpts} 个选项，都能到终章`);

  // ---- 危机分支必须写死在数据里，且必然弹资源卡 ----
  // 不写死节点名：在整条线里找带 effect:'crisis' 的节点，
  // 再确认它能走到一张 kind:'resource' 的卡。这样加线不用改测试。
  const allNodes = {};
  for (const sec of story.sections) for (const [k, n] of Object.entries(sec.nodes)) allNodes[sec.id + '/' + k] = n;

  const crisisNodes = Object.entries(allNodes).filter(([, n]) => n.effect && n.effect.split('+').map((x) => x.trim()).includes('crisis'));
  if (crisisNodes.length === 0) {
    fail('找不到写死的危机分支节点（应有一个节点标 effect: crisis）');
  } else {
    let toResource = 0;
    for (const [id] of crisisNodes) {
      const seen = reach(id);
      for (const t of seen) {
        const n = allNodes[t] || (story.endingNodes || {})[(t.split('/')[1] || '')];
        if (n && n.type === 'card' && n.kind === 'resource') { toResource++; break; }
      }
    }
    if (toResource !== crisisNodes.length) {
      fail('危机关怀分支没有接到写死的资源卡');
    } else {
      ok('危机分支写死在数据里，且必然弹出资源卡');
    }
  }
  // 筛查点也自动找：一个 choice，其中一个选项（通常标 flag: screened / *Screened）
  // 走不到危机分支以外的正常路径，就说明筛查没接上。
  {
    let screenOk = false, found = false;
    for (const sec of story.sections) {
      for (const [k, n] of Object.entries(sec.nodes)) {
        if (n.type !== 'choice') continue;
        const ask = n.options.find((o) => /screen/i.test(o.flag || '') && !/skip/i.test(o.flag || ''));
        if (!ask) continue;
        found = true;
        const dest = E.resolve(story, sec.id + '/' + k, ask.next);
        // 「问」这一支必须能走到一张资源卡
        let hasRes = false;
        for (const t of reach(dest)) {
          const nn = allNodes[t] || (story.endingNodes || {})[(t.split('/')[1] || '')];
          if (nn && nn.type === 'card' && nn.kind === 'resource') { hasRes = true; break; }
        }
        if (hasRes) screenOk = true;
      }
    }
    if (!found) fail('找不到危机筛查选择点（选项 flag 里应含 screen）');
    else if (!screenOk) fail('危机筛查「问」没通向后续');
    else ok('危机筛查「问」通向关怀分支');
  }


  // ---- 房间物件 ----
  let itemBad = 0;
  for (const id of ['referral', 'tissue', 'clock', 'sofa']) {
    const item = X.roomItems && X.roomItems[id];
    if (!item) { fail(`房间物件 "${id}" 在 UI 里被引用，roomItems 里没有`); itemBad++; }
    else if (!item.acts || !item.acts[1]) { fail(`房间物件 "${id}" 第 1 节没有内容`); itemBad++; }
  }
  if (!itemBad) ok('房间里 4 样可点物件都有第 1 节内容');
  if (!X.storySlots || X.storySlots.length !== 3) fail('storySlots 应有 3 条线');
  else {
    const ready = X.storySlots.filter((x) => x.ready).length;
    const everyReadyHasStory = X.storySlots.every((x) => !x.ready || (X.stories || {})[x.id]);
    if (!everyReadyHasStory) fail('有 storySlots 标了 ready，但 X.stories 里没有对应故事');
    else ok(`选线页有 3 条线（${ready} 条可玩 + ${3 - ready} 条剪影）`);
  }

  // ---- 存档 ----
  const empty = E.emptySave();
  if (['sci', 'amp', 'pain'].some((k) => !(k in empty.done))) fail('emptySave().done 缺少故事线');
  else ok('存档结构含三条线的通关标记');
  const round = JSON.parse(JSON.stringify({ story: 'sci', line: 's1/n2', flags: { openB: true }, warmth: 2 }));
  if (round.line !== 's1/n2' || round.flags.openB !== true) fail('存档快照编解码不一致');
  else ok('存档快照编解码一致');

  // ---- 状态机真的跑一遍 ----
  // go() / enter() / recordChoice() 里引用错一个函数名，只有真的调用才会炸。
  // （踩过一次：enter() 里调了还挂在下面对象字面量上的 saveCurrent，
  //   函数表达式此时还没赋值 → ReferenceError，而加载和静态检查全都正常。
  //   表现是：走到危机关怀分支就卡死，玩家按任何键都没反应。）
  try {
    const st = E.state;
    st.story = story;
    st.line = story.start;
    st.node = E.getNode(story, story.start);
    st.flags = {}; st.choices = []; st.itemsSeen = []; st.cardsSeen = []; st.diaryRead = [];
    st.act = 1; st.warmth = 1;

    let hops = 0;
    for (let i = 0; i < 1500; i++) {
      const n = st.node;
      if (!n) break;
      E.enter(n);
      if (n.type === 'choice') {
        // 每次都选第一个：这条路会经过危机关怀分支
        E.recordChoice(st.line, n.options[0]);
        if (!E.go(n.options[0].next)) break;
      } else if (n.type === 'diary') {
        n.entries.forEach((e) => E.recordDiary(e.id));
        if (!E.go(n.next)) break;
      } else {
        E.recordItem('clock');
        if (n.type === 'card') E.recordCard(n.kind, n.title); // 模拟 UI 打开纸时记卡
        if (n.next === null || n.next === undefined) break;
        if (!E.go(n.next)) break;
      }
      hops++;
    }
    if (hops < 50) fail(`状态机只走了 ${hops} 步就停了（停在 ${st.line}）`);
    else if (st.line !== 'end/2') fail(`一直按第一个选项走，最后停在 ${st.line}，应该是 end/2`);
    else ok(`状态机跑通：${hops} 步走到终章`);

    if (!st.flags.crisisTriggered) fail('走了「问」这条路，crisisTriggered 却没置上');
    else ok('危机关怀状态被正确置位');
  } catch (e) {
    fail('状态机跑起来抛错：' + e.message + '  @' + String(e.stack || '').split('\n')[1]);
  }
  }   // for (const story of stories)

  // =========================================================================
  head('E · 真跑一遍渲染');
  // =========================================================================
  // 只做 load 是抓不到"变量没定义""回调把外层参数遮住"这类错的——
  // 它们要等到真的调用才炸（我们踩过一次：renderScene 里的 warmth 被
  // shadows.forEach 的形参遮住，整间房一个矩形都没画，而静态检查全绿）。
  const draw = (opts) => E.renderScene(Object.assign({ onItem() {}, clickable: [] }, opts));

  let scenes = 0;
  for (const act of [1, 2, 3]) {
    for (const people of [true, false]) {
      try { draw({ act, warmth: act, withPeople: people }); scenes++; }
      catch (e) { fail(`renderScene(act=${act}, people=${people}) 抛错：${e.message}`); }
    }
  }
  if (scenes === 6) ok('三节 × 有人/没人 = 6 种组合都能画出来');

  let full = null;
  try {
    full = draw({ act: 1, warmth: 1, withPeople: true, clickable: ['clock', 'tissue', 'sofa', 'referral', 'wheelchair'] });
    ok('带全部热区也能画出来');
  } catch (e) {
    fail('带热区渲染抛错：' + e.message);
  }

  if (full) {
    const rects = full.querySelectorAll('rect').length;
    // 背景 106×60 就该有几百个矩形；太少说明整间房没画出来
    if (rects < 1000) fail(`房间只画了 ${rects} 个矩形，太少（背景一层就该有几百）`);
    else ok(`房间画了 ${rects} 个矩形`);
  }

  // 热区必须拿得到像素图，否则点上去了没反应
  let hsBad = 0;
  for (const hs of E.HOTSPOTS) {
    // mobility 的像素图跟着故事走：故事线一是轮椅，二是双拐。
    // 两条线各自的 clientArt.prop 都必须真的存在。
    const has = hs.id === 'mobility'
      ? Object.values(X.stories || {}).every((st) => !st.clientArt || !!X[st.clientArt.prop])
      : hs.id === 'referral' ? !!X.REFERRAL
        : hs.id === 'tissue' ? !!(X.TISSUE || X.sprites.sprites.tissue)
          : hs.id === 'clock' ? !!X.sprites.sprites.clock
            : !!(hs.sprite && X.sprites.sprites[hs.sprite]);
    if (!has) { fail(`热区 "${hs.id}" 找不到像素图`); hsBad++; }
  }
  if (!hsBad) ok(`${E.HOTSPOTS.length} 个热区都有像素图`);
}

// ===========================================================================
console.log('\n' + (bad === 0 ? '全部通过 ✅' : `发现 ${bad} 个问题 ❌`));
process.exit(bad === 0 ? 0 : 1);
