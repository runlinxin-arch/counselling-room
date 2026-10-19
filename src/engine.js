// ============================================================================
// 引擎：状态机 + 存档 + 场景渲染
// 这一层不认识任何剧情内容，只认识 story 数据里的节点类型。
// ============================================================================

(function (X) {
  'use strict';

  // ---- 依赖 src/sprites.js / src/story.js ----
  const S = X.sprites;              // { size, pal, sprites, shadows, scene, items, notes }
  const PAL = Object.assign({}, S.pal, X.PAL_EXT);
  const SAVE_KEY = 'xlzx.save.v1';

  // 房间里的箭头标注。
  //
  // 以前这里是"可点物件"：物品带光晕，点一下弹一张科普纸。现在改成**直接标在
  // 房间里**——三条故事线共用同一间咨询室，所以位置写死在这里，只有文字跟着
  // 故事数据走（见 ui.js 的 currentCallouts）。
  //
  //   anchor  箭头尖端指到的位置（逻辑像素）
  //   box     文字框左上角（逻辑像素）
  //
  // 选择落位的要求：箭头尽量短、文字框互相不压、不出画面。房间 106×60，
  // 各物品的坐标见 src/sprites.js 与 docs/mockups/方案B-内联SVG.html。
  const CALLOUTS = [
    { id: 'clock',    anchor: [48, 5],    box: [50, 0.4] },
    { id: 'referral', anchor: [44, 34],   box: [36, 19.2] },
    { id: 'tissue',   anchor: [51.5, 39], box: [42, 50.4] },
    { id: 'sofa',     anchor: [79, 42],   box: [80, 36] },
  ];

  // --------------------------------------------------------------------------
  // 存档
  // --------------------------------------------------------------------------
  function emptySave() {
    return {
      v: 1,
      done: { sci: false, amp: false, pain: false },
      current: null,
      lastPlayed: 0,
    };
  }

  let save = emptySave();

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      // 存档结构带版本号；对不上的直接丢，不要让白屏
      if (!parsed || parsed.v !== 1) return;
      save = Object.assign(emptySave(), parsed);
      save.done = Object.assign({ sci: false, amp: false, pain: false }, parsed.done || {});
    } catch (e) {
      // file:// 下某些浏览器会直接抛异常。存档不是必需品，静默降级。
      save = emptySave();
    }
  }

  function persist() {
    save.lastPlayed = Date.now();
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) { /* 无痕模式等，忽略 */ }
  }

  // --------------------------------------------------------------------------
  // 状态机
  // --------------------------------------------------------------------------
  const state = {
    screen: 'title',      // title | choose | story | end
    story: null,          // 当前故事对象
    line: null,           // 当前节点 id，形如 's1/n2'
    node: null,           // 当前节点对象
    flags: {},
    choices: [],
    itemsSeen: [],
    cardsSeen: [],
    diaryRead: [],
    warmth: 1,
    act: 1,
    scene: 'room',        // room | hallway —— 中场休息去走廊时换场景
    screenMode: 'title',
  };

  /** 分节 → 节点。's1' → { id, title, nodes } */
  function sectionOf(story, id) { return story.sections.find((s) => s.id === id); }

  /**
   * 按 id 取故事对象。
   * 原先这里写死成 'sci'，加第二条线就会静默失败（读档读不回来）。
   * 现在从一份注册表里查，加线只要往 XLZX.stories 里放一份。
   */
  function storyById(id) {
    return (X.stories || {})[id] || null;
  }

  // 故事注册表。加一条线只要往这里加一项，UI 不需要改。
  X.stories = X.stories || {};
  if (X.storySci) X.stories[X.storySci.id] = X.storySci;
  if (X.storyAmp) X.stories[X.storyAmp.id] = X.storyAmp;
  if (X.storyPain) X.stories[X.storyPain.id] = X.storyPain;

  /**
   * 解析跳转目标。
   * 规则（和 docs/design 里写的一致）：
   *   'n2'      → 本节的 n2
   *   '@s2/n1'  → 绝对，s2 节的 n1
   *   'end/1'   → 终章第 1 个节点（终章是独立节点表）
   */
  function resolve(story, fromId, target) {
    if (!target) return null;
    if (target.charAt(0) === '@') return target.slice(1);
    if (target.indexOf('/') >= 0) return target;
    return fromId.split('/')[0] + '/' + target;
  }

  function getNode(story, id) {
    if (!id) return null;
    const slash = id.indexOf('/');
    const secId = id.slice(0, slash);
    const key = id.slice(slash + 1);
    if (secId === 'end') return (story.endingNodes || {})[key] || null;
    const sec = sectionOf(story, secId);
    return sec ? sec.nodes[key] || null : null;
  }

  /** 当前节点属于第几节（用来显示章节名、切房间时段） */
  function sectionMeta(story, id) {
    if (!id) return null;
    const secId = id.split('/')[0];
    if (secId === 'end') return { id: 'end', title: '终章', subtitle: '这一节之后' };
    return sectionOf(story, secId) || null;
  }

  function snapshot() {
    return {
      story: state.story ? state.story.id : null,
      line: state.line,
      flags: JSON.parse(JSON.stringify(state.flags)),
      choices: state.choices.slice(),
      itemsSeen: state.itemsSeen.slice(),
      cardsSeen: state.cardsSeen.slice(),
      diaryRead: state.diaryRead.slice(),
      warmth: state.warmth,
      act: state.act,
      scene: state.scene,
    };
  }

  function restore(snap) {
    if (!snap || !snap.story) return false;
    const story = storyById(snap.story);
    if (!story) return false;
    state.story = story;
    state.line = snap.line;
    state.flags = snap.flags || {};
    state.choices = snap.choices || [];
    state.itemsSeen = snap.itemsSeen || [];
    state.cardsSeen = snap.cardsSeen || [];
    state.diaryRead = snap.diaryRead || [];
    state.warmth = snap.warmth || 1;
    state.act = snap.act || 1;
    state.scene = snap.scene || 'room';
    state.node = getNode(story, state.line);
    return !!state.node;
  }

  /** 走向下一个节点。target 省略时用当前节点的 next。 */
  function go(target) {
    const next = target === undefined ? state.node && state.node.next : target;
    if (next === null || next === undefined) return null;
    const id = resolve(state.story, state.line, next);
    const node = getNode(state.story, id);
    if (!node) {
      // 数据写错了不该让玩家白屏：停在原地，控制台留话
      console.warn('[心理咨询] 跳转落空：', state.line, '→', next, '（解析成', id, '）');
      return null;
    }
    state.line = id;
    state.node = node;
    return node;
  }

  /** 应用节点的副作用。effect 可累加，用 '+' 分隔。 */
  function applyEffects(node) {
    if (!node || !node.effect) return;
    node.effect.split('+').forEach(function (raw) {
      const eff = raw.trim();
      if (!eff) return;
      if (eff === 'crisis') state.flags.crisisTriggered = true;
      else if (eff === 'markScreenMissed') state.flags.screenMissed = true;
      else if (eff === 'unlockDiary') state.flags.diaryUnlocked = true;
      else state.flags[eff] = true;
    });
  }

  /** 进到某个节点时的统一处理：切时段、记卡片、落盘 */
  function enter(node) {
    if (!node) return;
    if (typeof node.act === 'number') state.act = node.act;
    if (typeof node.warmth === 'number') state.warmth = node.warmth;
    // scene 是"当前所处场景"。默认回到咨询室，只有节点明确写 scene 才换。
    // （否则走廊场景会一直留在状态里，回到咨询室还显示空房间。）
    state.scene = node.scene || 'room';
    applyEffects(node);
    // 副作用是"存档状态"的一部分，进节点就落盘。
    // 不落的话：走到危机关怀分支时关掉页面，或者从标题页看上次进度，
    // 那次危机触发就丢了——成绩单会说「你问了，他答了」，而实际上你接住了他。
    //
    // 这里直接写 save.current，**不要调 saveCurrent()**：那个函数挂在下面的
    // X.engine 对象字面量上，这时候还没赋值（函数声明会提升，函数表达式不会）。
    if (node.effect) {
      save.current = snapshot();
      persist();
    }
    // 节点上挂的卡（say + note）
    if (node.note && node.kind) recordCard(node.kind, node.text);
  }

  function recordCard(kind, text) {
    const key = kind + ':' + String(text || '').slice(0, 18);
    if (state.cardsSeen.indexOf(key) < 0) state.cardsSeen.push(key);
  }

  function recordChoice(nodeId, option) {
    state.choices.push({ node: nodeId, key: option.key, label: option.label });
    if (option.flag) state.flags[option.flag] = true;
  }

  function recordItem(itemId) {
    if (state.itemsSeen.indexOf(itemId) < 0) state.itemsSeen.push(itemId);
  }

  function recordDiary(entryId) {
    if (state.diaryRead.indexOf(entryId) < 0) state.diaryRead.push(entryId);
  }

  // --------------------------------------------------------------------------
  // 场景渲染
  // --------------------------------------------------------------------------

  /**
   * 背景：墙 / 护墙板 / 踢脚线 / 木地板。
   *
   * 这一层是「房间」而不是「家具」的骨架，所以它决定整幅画的**明度层次**：
   *   亮墙（. ,）→ 中间调护墙板（-）→ 过渡踢脚线（=）→ 中深地板（# ｜ +）
   * 早先地板和家具落在同一档明度上（都是近黑褐），两者糊成一片，
   * 所以看起来像把家具"贴"在墙纸上，而不是站在房间里。
   *
   * 另一处刻意的选择：**靠窗一侧更亮**。同一面墙从左到右有一个很轻的
   * 渐变，地板也一样——这是让"光从窗户进来"这件事在背景层就成立，
   * 而不是只靠最后一层半透明暖色硬叠。
   */
  const FLOOR_TOP = 34;        // 踢脚线所在行
  const WAINSCOT = 26;         // 护墙板分界：往上亮墙、往下略深

  /** 便宜的确定性哈希（0..n-1）。用来做不规则木纹，别用随机——同一帧要可复现。 */
  function hash2(x, y) {
    let n = (x * 374761393 + y * 668265263) | 0;
    n = (n ^ (n >> 13)) * 1274126177 | 0;
    return Math.abs(n ^ (n >> 16));
  }

  function bgChar(x, y) {
    if (y < FLOOR_TOP) {
      // ---- 墙 ----
      // 靠窗（左侧）一带略亮，向右极轻微压暗：让"光从窗户进来"在背景层就成立
      const shade = x >= 40;
      if (y >= WAINSCOT) return shade ? '-' : ',';
      // 细竖纹壁纸：每 5 px 一道。太密的话 6 倍放大后会跳。
      if (x % 5 === 0) return ',';
      return shade ? ',' : '.';
    }
    if (y === FLOOR_TOP) return '=';   // 踢脚线

    // ---- 木地板 ----
    // 走过的两次弯路，记下来免得再犯：
    //   1. 每 4 行横缝 + 每 13 列竖缝 → 读成瓷砖
    //   2. 纯哈希散点 → 读成地面脏了
    // 木头真正可读的特征是**方向性**：纹路顺着板长走。所以这里用"横向短纹"
    // 加"稀疏板端竖缝"，两者错开，才有木地板的读感。
    const h = hash2(x, y);
    const course = y - FLOOR_TOP;

    // 板端：稀疏的短竖缝（相邻层错开，且不通长）
    const seamShift = (course & 1) ? 6 : 0;
    if ((x + seamShift) % 19 === 0) return '|';

    // 木纹：顺着板长方向的短横道。
    // 关键是不能用"当前像素的哈希"决定自己画不画——那只会画出单点。
    // 改为：每 6 px 放一个**锚点**，由锚点的哈希决定这一道的起点与长度。
    const anchor = x - (((x % 11) + 11) % 11);
    const ah = hash2(anchor, y);
    if (ah % 9 === 0) {
      const start = anchor + (ah % 3);
      const len = 2 + (ah % 4);          // 2–5 px
      if (x >= start && x < start + len) return '+';
    }

    // 极稀疏的木节，打破均匀（只要几个）
    if (h % 211 === 0) return '|';

    return '#';
  }

  const NS = 'http://www.w3.org/2000/svg';

  function el(name, attrs) {
    const e = document.createElementNS(NS, name);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  function px(x, y, w, h, fill, opacity) {
    const a = { x: x, y: y, width: w, height: h, fill: fill };
    if (opacity !== undefined) a.opacity = opacity;
    if (x < 0 || y < 0) return null;
    return el('rect', a);
  }

  /** 把一个字符地图画进 parent。空字符串和调色板外的字符当透明。 */
  function paint(map, ox, oy, parent) {
    if (!map) return;
    map.forEach(function (line, dy) {
      let x = 0;
      while (x < line.length) {
        const ch = line.charAt(x);
        if (ch === ' ' || !PAL[ch]) { x++; continue; }
        let w = 1;
        while (line.charAt(x + w) === ch) w++;
        const r = px(ox + x, oy + dy, w, 1, PAL[ch]);
        if (r) parent.appendChild(r);
        x += w;
      }
    });
  }

  /** 找出眼睛所在的行（含瞳或眼镜框的那一行）。找不到返回 -1。 */
  function eyeRowOf(map) {
    for (let y = 0; y < map.length; y++) {
      if (map[y] && map[y].indexOf('X') >= 0) return y;
    }
    return -1;
  }

  /** 把一行像素画进某个分组 */
  function paintRow(line, ox, oy, parent) {
    let x = 0;
    while (x < line.length) {
      const ch = line.charAt(x);
      if (ch === ' ' || !PAL[ch]) { x++; continue; }
      let w = 1;
      while (line.charAt(x + w) === ch) w++;
      const r = px(ox + x, oy, w, 1, PAL[ch]);
      if (r) parent.appendChild(r);
      x += w;
    }
  }

  /**
   * 画一个人。
   *
   * 结构：
   *   <g class="x-person">   整个人的刚体 —— 呼吸时头和躯干一起搬
   *     <g>                  全部像素原样画出（含眼睛，作为底）
   *     <rect class="x-eye">  一块肤色"眼皮"，只盖住两眼之间那一段
   *   </g>
   *
   * 两个曾经踩过的坑，决定了现在这个形状：
   *
   * 1) 第一版把头和躯干拆成两个各自动画的组、周期还不同 → 相位错开 1px，
   *    接缝裂开（"头皮分离"）。所以整个人必须是一个刚体。
   *
   * 2) 第二版让"眼睛那一行"整行下移 1px 来闭眼。但那一行里**不只有眼睛**，
   *    还含着发帘下缘（H）与描边（D）：整行一动，发帘原位就露出空隙，
   *    额头处裂开一条缝。所以现在**位移全部取消**，只在眼睛跨度上盖一块
   *    肤色的矩形，用透明度切换来表示闭眼。位移为零 → 任何地方都不可能裂。
   */
  function paintPerson(map, ox, oy, parent, who) {
    if (!map) return;
    const person = el('g', { class: 'x-person x-' + who });
    const solid = el('g', {});

    // 全部像素原样画进实体层
    map.forEach(function (line, dy) { paintRow(line, ox, oy + dy, solid); });
    person.appendChild(solid);

    // 眼皮：只覆盖眼睛所在的那一段（从最左的瞳到最右的瞳）
    const eyeRow = eyeRowOf(map);
    if (eyeRow >= 0) {
      const row = map[eyeRow];
      const xs = [];
      for (let i = 0; i < row.length; i++) if (row.charAt(i) === 'X') xs.push(i);
      if (xs.length) {
        const x0 = xs[0];
        const x1 = xs[xs.length - 1];
        // 眼皮颜色取这一行里"眼睛旁边"的肤色，保证和周围一致
        let skin = null;
        for (let i = 0; i < row.length; i++) {
          const c = row.charAt(i);
          if (c !== ' ' && c !== 'X' && (c === 'Z' || c === 'z')) { skin = c; break; }
        }
        if (skin && PAL[skin]) {
          const lid = px(ox + x0, oy + eyeRow, x1 - x0 + 1, 1, PAL[skin]);
          if (lid) {
            lid.setAttribute('class', 'x-eye x-' + who);
            person.appendChild(lid);
          }
        }
      }
    }

    parent.appendChild(person);
  }

  // 人物待机动效：呼吸起伏 + 眨眼。
  //
  // ⚠️ 三条硬约束，每条都是踩过坑之后定下的：
  //
  // 1) **像素画不能用小数位移。**
  //    translateY(-0.3px) 会把每格边缘插值成半透明，6 倍放大后整张脸发虚。
  //    所以位移一律整像素，用 step-end 让位置"跳"。
  //
  // 2) **头和躯干必须同一个刚体。**
  //    第一版把 .x-head / .x-body 拆开、给了不同周期（5.5s vs 4s），
  //    相位错开 1px，接缝裂开（表现为"头皮分离"）。
  //    人的头颈相连，动效必须把整个人当一个整体搬。
  //
  // 3) **眨眼不能移动像素，只能覆盖。**
  //    第二版让"眼睛那两行"整行下移 1px 来闭眼。但眼睛行 r4 里还含着
  //    发帘下缘的像素：整行下移后，发帘原位露出来了 —— 额头处裂开 1px 缝。
  //    现在改成：眼睛行在实体层正常画（作为底），另起一层 .x-eye 把同一行
  //    再画一遍并盖在上面；眨眼时把这一层藏起来，露出的就是底下那张脸。
  //    位移为零，所以任何地方都不可能裂。
  const ANIM_RULES =
    // 整个人：呼吸。头与躯干一起动，接缝不会裂。
    '.x-person{animation:xl-breathe 4s step-end infinite;transform-box:fill-box;transform-origin:50% 100%}' +
    '@keyframes xl-breathe{0%,45%{transform:translateY(0)}46%,75%{transform:translateY(-1px)}76%,100%{transform:translateY(0)}}' +
    // 眨眼：眼睛覆盖层藏起来 = 闭眼。只动透明度，不动位置。
    '.x-eye{animation:xl-blink 6s step-end infinite}' +
    '@keyframes xl-blink{0%,92%{opacity:0}93%,95%{opacity:1}96%,97.5%{opacity:0}98%,99%{opacity:1}100%{opacity:0}}' +
    '@media (prefers-reduced-motion:reduce){' +
    '.x-person,.x-eye{animation:none;opacity:1;transform:none}}';

  /**
   * 箭头标注：指引线（带箭头）+ 两行文字框（物品名 / 功能）。
   *
   * 文字框故意不透明，会盖住后面的像素画——标注要能读，
   * 压住一点家具比糊在地板花纹上强。箭头从文字框离物品最近的那条边出发。
   */
  function drawCallouts(svg, list) {
    if (!list || !list.length) return;
    const g = el('g', { class: 'ann', style: 'shape-rendering:auto' });
    // 箭头用 marker，省得自己算三角形。同一屏只有一个 #scene，id 不冲突。
    const defs = el('defs', {});
    const marker = el('marker', {
      id: 'ann-arrow', markerUnits: 'userSpaceOnUse',
      markerWidth: 3, markerHeight: 3, refX: 2.6, refY: 1.5, orient: 'auto',
    });
    marker.appendChild(el('path', { d: 'M0,0 L3,1.5 L0,3 z', fill: '#ffe0a8' }));
    defs.appendChild(marker);
    g.appendChild(defs);

    const NAME_FS = 2.5, TEXT_FS = 3.2, PAD_X = 1.4, PAD_Y = 1.0, LINE_H = 3.8;

    list.forEach(function (a) {
      const geo = CALLOUTS.find(function (c) { return c.id === a.id; });
      if (!geo) return;
      const name = a.name || '';
      const text = a.text || '';
      // 中文字宽≈字号，按字数估宽度即可（不依赖字体度量，file:// 下也稳）。
      const w = Math.max(name.length * NAME_FS, text.length * TEXT_FS) + PAD_X * 2;
      const h = PAD_Y * 2 + LINE_H * 2 - 0.6;
      const bx = geo.box[0], by = geo.box[1];
      const ax = geo.anchor[0], ay = geo.anchor[1];

      // 从离 anchor 最近的那条边走线，箭头才不会穿过文字框。
      let ex, ey;
      if (ax < bx) { ex = bx; ey = Math.min(Math.max(ay, by), by + h); }
      else if (ax > bx + w) { ex = bx + w; ey = Math.min(Math.max(ay, by), by + h); }
      else { ey = ay < by ? by : by + h; ex = Math.min(Math.max(ax, bx + 1.6), bx + w - 1.6); }
      g.appendChild(el('line', {
        x1: ex, y1: ey, x2: ax, y2: ay,
        stroke: '#ffe0a8', 'stroke-width': 0.4, 'marker-end': 'url(#ann-arrow)',
      }));

      // 文字框
      g.appendChild(el('rect', {
        x: bx, y: by, width: w, height: h, rx: 0.9,
        fill: 'rgba(22,16,11,0.9)', stroke: '#8f6636', 'stroke-width': 0.3,
      }));
      const nm = el('text', {
        x: bx + PAD_X, y: by + PAD_Y + 2.0,
        'font-size': NAME_FS, fill: '#b6ab9c', 'font-family': 'inherit',
      });
      nm.textContent = name;
      g.appendChild(nm);
      const tx = el('text', {
        x: bx + PAD_X, y: by + PAD_Y + 2.0 + LINE_H,
        'font-size': TEXT_FS, fill: '#ffe0a8', 'font-weight': 600, 'font-family': 'inherit',
      });
      tx.textContent = text;
      g.appendChild(tx);
    });

    svg.appendChild(g);
  }

  /**
   * 画整个房间，按方案 B 的层级。
   * @param {object} opts
   *   act          1..3，决定钟针位置
   *   warmth       1..3，决定暖光和压暗
   *   withPeople   有没有人（第 1 节的走廊场景没有人）
   *   callouts     [{id,name,text}] 要在房间里标出来的物品；空数组 = 不标
   */
  function renderScene(opts) {
    const act = opts.act || 1;
    const warmth = opts.warmth || 1;
    const withPeople = opts.withPeople !== false;
    const hallway = !!opts.hallway;
    const svg = el('svg', { id: 'scene', viewBox: '0 0 ' + S.size.w + ' ' + S.size.h });
    const GW = S.size.w;
    const GH = S.size.h;
    // 随身物件与立绘由故事数据决定（故事线一是轮椅，二是双拐）。
    const art = (state.story && state.story.clientArt) || null;

    // --- 0) 动画规则写在 SVG 内部，用 class 选择器，别被页面的 CSS 覆盖 ---
    const style = el('style', {});
    style.textContent = ANIM_RULES;
    svg.appendChild(style);

    // --- 1) 墙 / 踢脚线 / 地板 ---
    const bg = el('g', {});
    for (let y = 0; y < GH; y++) {
      let x = 0;
      while (x < GW) {
        const ch = bgChar(x, y);
        let w = 1;
        while (x + w < GW && bgChar(x + w, y) === ch) w++;
        bg.appendChild(px(x, y, w, 1, PAL[ch]));
        x += w;
      }
    }
    svg.appendChild(bg);

    // --- 2) 墙脚接触阴影 + 家具落地影 ---
    svg.appendChild(px(0, 35, GW, 2, '#0e0f16', 0.35));
    // 注意别把回调参数命名成 warmth / act / withPeople —— 会把外层的同名参数遮住
    S.shadows.forEach(function (box) {
      svg.appendChild(px(box[0], box[1], box[2], box[3], '#0e0f16', 0.42));
    });

    // --- 3) 家具 + 人 + 茶几上的东西 ---
    //     人物排在沙发之后、茶几之前：这样手能搭在沙发扶手上，
    //     而茶几和上面那盒纸巾、那张转介单会挡住两人的下缘。
    const scene = S.scene;
    scene.forEach(function (row) {
      if (row[0] === 'clock') return;                        // 钟按小节换指针，最后单独画
      if (row[0] === 'table') return;                        // 茶几要压在人上面
      if (row[0] === 'cup' && withPeople) return;            // 有人时杯子被挡着
      paint(S.sprites[row[0]], row[1], row[2], svg);
    });

    if (withPeople) {
      // 随身物件与立绘由故事数据决定：故事线一是轮椅，故事线二是双拐。
      // 写死的话，第二条线会画出别人的轮椅。
      if (art) {
        paint(X[art.prop], art.propX, art.propY, svg);
        paintPerson(X[art.body], art.bodyX, art.bodyY, svg, 'client');
      } else {
        const c = X.CHARS.client;
        paint(X.WHEELCHAIR, c.chairX, c.chairY, svg);
        paintPerson(c.body, c.bodyX, c.bodyY, svg, 'client');
      }
      const k = X.CHARS.counselor;
      paintPerson(k.body, k.bodyX, k.bodyY, svg, 'counselor');
    }

    // 茶几（压在人腿上）
    const tableRow = scene.find(function (r) { return r[0] === 'table'; });
    if (tableRow) paint(S.sprites.table, tableRow[1], tableRow[2], svg);

    // 茶几上的转介单和纸巾盒。都是小方块，按现实比例画的（见 src/sprites.js 的注释）。
    paint(X.REFERRAL, 43, 34, svg);
    paint(X.TISSUE, 49, 35, svg);

    // --- 4) 墙上的钟（按小节换指针）---
    const clockRow = scene.find(function (r) { return r[0] === 'clock'; });
    if (clockRow) {
      const clk = X.CLOCK_VARIANTS['c' + act] || S.sprites.clock;
      paint(clk, clockRow[1], clockRow[2], svg);
    }

    // --- 5) 暖光与四角压暗（整体叠一层）---
    const w = X.WARMTH[warmth] || X.WARMTH[1];
    // 走廊：冷白光、更暗一点，和暖调的咨询室区分开
    const glowFill = hallway ? '#cfe0ff' : '#ffd9a0';
    const glowOp = hallway ? 0.10 : w.glow;
    svg.appendChild(el('rect', { x: 0, y: 0, width: GW, height: GH, fill: glowFill, opacity: glowOp }));
    svg.appendChild(el('rect', { x: 0, y: 0, width: GW, height: GH, fill: '#06070a', opacity: w.vignette * (hallway ? 0.62 : 0.38) }));

    // --- 6) 箭头标注。放最上层，保证不被人物和暖光压住。---
    drawCallouts(svg, opts.callouts);

    return svg;
  }

  // --------------------------------------------------------------------------
  // 对外
  // --------------------------------------------------------------------------
  X.engine = {
    SAVE_KEY: SAVE_KEY,
    CALLOUTS: CALLOUTS,
    state: state,
    save: function () { return save; },
    load: load,
    persist: persist,
    emptySave: emptySave,
    getNode: getNode,
    resolve: resolve,
    sectionMeta: sectionMeta,
    snapshot: snapshot,
    restore: restore,
    go: go,
    enter: enter,
    recordCard: recordCard,
    recordChoice: recordChoice,
    recordItem: recordItem,
    recordDiary: recordDiary,
    renderScene: renderScene,
    markDone: function (storyId) {
      save.done[storyId] = true;
      state.screenMode = 'title';
      persist();
    },
    clearCurrent: function () {
      save.current = null;
      persist();
    },
    saveCurrent: function () {
      save.current = snapshot();
      persist();
    },
  };
})(window.XLZX = window.XLZX || {});
