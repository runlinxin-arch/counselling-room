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

  // 房间里的可点物件。x/y 是逻辑像素坐标，w/h 由 sprite 尺寸推出来。
  const HOTSPOTS = [
    { id: 'clock',    sprite: 'clock',    x: 43, y: 5,  label: '墙上的钟' },
    { id: 'referral', sprite: 'referral', x: 43, y: 34, label: '茶几上的转介单' },
    { id: 'tissue',   sprite: 'tissue',   x: 49, y: 35, label: '茶几上的纸巾盒' },
    { id: 'sofa',     sprite: 'sofaR',    x: 56, y: 26, label: '两把沙发' },
    { id: 'wheelchair', sprite: 'chair',  x: 63, y: 33, label: '他的轮椅' },
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
    screenMode: 'title',
  };

  /** 分节 → 节点。's1' → { id, title, nodes } */
  function sectionOf(story, id) { return story.sections.find((s) => s.id === id); }

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
    };
  }

  function restore(snap) {
    if (!snap || !snap.story) return false;
    const story = snap.story === 'sci' ? X.storySci : null;
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

  /** 物件在画布上的外框，给热区用 */
  function boundsOf(sprite, x, y) {
    return {
      x: x,
      y: y,
      w: sprite && sprite[0] ? sprite[0].length : 8,
      h: sprite ? sprite.length : 8,
    };
  }

  const ANIM_RULES =
    '.hs{cursor:pointer}' +
    '.hs .art{animation:b 1.9s ease-in-out infinite}' +
    '.hs:hover .art,.hs:focus-visible .art{animation:none;opacity:1}' +
    '@keyframes b{0%,100%{opacity:1}50%{opacity:.6}}' +
    '@media (prefers-reduced-motion:reduce){.hs .art{animation:none;opacity:1}}';

  /**
   * 画整个房间，按方案 B 的层级。
   * @param {object} opts
   *   act          1..3，决定钟针位置
   *   warmth       1..3，决定暖光和压暗
   *   withPeople   有没有人（第 1 节的走廊场景没有人）
   *   clickable    [] 允许点的物件 id
   *   onItem       (id) => void
   */
  function renderScene(opts) {
    const act = opts.act || 1;
    const warmth = opts.warmth || 1;
    const clickable = opts.clickable || [];
    const withPeople = opts.withPeople !== false;
    const svg = el('svg', { id: 'scene', viewBox: '0 0 ' + S.size.w + ' ' + S.size.h });
    const GW = S.size.w;
    const GH = S.size.h;

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
      const c = X.CHARS.client;
      paint(X.WHEELCHAIR, c.chairX, c.chairY, svg);
      paint(c.body, c.bodyX, c.bodyY, svg);
      const k = X.CHARS.counselor;
      paint(k.body, k.bodyX, k.bodyY, svg);
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
    svg.appendChild(el('rect', { x: 0, y: 0, width: GW, height: GH, fill: '#ffd9a0', opacity: w.glow }));
    svg.appendChild(el('rect', { x: 0, y: 0, width: GW, height: GH, fill: '#06070a', opacity: w.vignette * 0.38 }));

    // --- 6) 可点物件的热区。放最上层，保证不被人物挡住。---
    HOTSPOTS.forEach(function (hs) {
      if (clickable.indexOf(hs.id) < 0) return;
      if (hs.id === 'wheelchair' && !withPeople) return;

      let sprite;
      if (hs.id === 'wheelchair') sprite = X.WHEELCHAIR;
      else if (hs.id === 'referral') sprite = X.REFERRAL;
      else if (hs.id === 'tissue') sprite = X.TISSUE || S.sprites.tissue;
      else if (hs.id === 'clock') sprite = X.CLOCK_VARIANTS['c' + act] || S.sprites.clock;
      else sprite = S.sprites[hs.sprite];
      if (!sprite) return;

      const b = boundsOf(sprite, hs.x, hs.y);
      const g = el('g', { class: 'hs', tabindex: '0', role: 'button' });
      const art = el('g', { class: 'art' });
      paint(sprite, hs.x, hs.y, art);
      g.appendChild(art);
      const t = el('title', {});
      t.textContent = hs.label;
      g.appendChild(t);
      // 热区比图形大一圈，鼠标好点中；而且它必须是透明的实心块，
      // 否则 caster 和地板的缝里点不到。
      g.appendChild(el('rect', {
        x: b.x - 1.5, y: b.y - 1.5, width: b.w + 3, height: b.h + 3, fill: 'transparent',
      }));
      g.addEventListener('click', function () { opts.onItem && opts.onItem(hs.id); });
      g.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter' || ev.key === ' ' || ev.key === 'Spacebar') {
          ev.preventDefault();
          opts.onItem && opts.onItem(hs.id);
        }
      });
      svg.appendChild(g);
    });

    return svg;
  }

  // --------------------------------------------------------------------------
  // 对外
  // --------------------------------------------------------------------------
  X.engine = {
    SAVE_KEY: SAVE_KEY,
    HOTSPOTS: HOTSPOTS,
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
