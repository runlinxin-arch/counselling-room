// ============================================================================
// 界面：标题页 / 选线页 / 对话 / 纸 / 情绪日记 / 逐字写出
// 只负责画和收事件；状态和跳转都在 engine 里。
// ============================================================================

(function (X) {
  'use strict';

  const E = X.engine;
  const state = E.state;

  const $ = function (sel, root) { return (root || document).querySelector(sel); };
  const $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  function make(tag, attrs, kids) {
    const el = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      if (k === 'class') el.className = attrs[k];
      else if (k === 'text') el.textContent = attrs[k];
      else if (k === 'html') el.innerHTML = attrs[k];
      else if (attrs[k] !== null && attrs[k] !== undefined) el.setAttribute(k, attrs[k]);
    }
    (kids || []).forEach(function (c) { if (c) el.appendChild(c); });
    return el;
  }

  // --------------------------------------------------------------------------
  // 逐字写出
  // --------------------------------------------------------------------------
  const reduceMotion = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  /**
   * 把文字一段一段写出来。返回一个 { done(), skip() } 句柄。
   * 用 Array.from 而不是 charAt——中文和标点各占一个码点，substring 会切坏。
   */
  function typewrite(container, text, opts) {
    opts = opts || {};
    const speed = opts.speed || 26;      // 每个字的毫秒数
    const container$ = container;
    container$.textContent = '';

    const chars = Array.from(text);
    const spans = chars.map(function (ch) {
      const s = document.createElement('span');
      s.className = 'w';
      s.textContent = ch;
      container$.appendChild(s);
      return s;
    });

    if (reduceMotion) {
      spans.forEach(function (s) { s.classList.add('on'); });
      return { done: function () { return true; }, skip: function () {} };
    }

    let i = 0;
    let finished = false;
    let timer = null;

    function step() {
      if (i >= spans.length) {
        finished = true;
        if (opts.onEnd) opts.onEnd();
        return;
      }
      const ch = chars[i];
      spans[i].classList.add('on');
      i++;
      // 标点处多停一下——不是匀速打字，是"写"的节奏
      let wait = speed;
      if ('。！？'.indexOf(ch) >= 0) wait = speed * 7;
      else if ('，、；：'.indexOf(ch) >= 0) wait = speed * 3.5;
      else if (ch === '\n') wait = speed * 4;
      timer = window.setTimeout(step, wait);
    }

    timer = window.setTimeout(step, speed);

    return {
      done: function () { return finished; },
      skip: function () {
        if (timer) window.clearTimeout(timer);
        spans.forEach(function (s) { s.classList.add('on'); });
        i = spans.length;
        finished = true;
        if (opts.onEnd) opts.onEnd();
      },
    };
  }

  // --------------------------------------------------------------------------
  // 纸（督导笔记 / 科普卡 / 转介单 / 资源卡 / 成绩单）
  // --------------------------------------------------------------------------
  let overlayEl = null;

  function closeOverlay() {
    if (!overlayEl) return;
    overlayEl.classList.remove('on', 'slide');
    overlayEl.innerHTML = '';
  }

  /**
   * 弹一张纸。
   * @param {object} o { kind, title, lines[], footer, button, onClose, write }
   */
  function showPaper(o) {
    if (!overlayEl) {
      overlayEl = make('div', { id: 'overlay' });
      document.body.appendChild(overlayEl);
    }
    // 玩家真正看到过的资料才算数——成绩单里的"看过的资料"就是靠这一步记的。
    // （不能在节点上记：card 节点里根本没有 note 字段。）
    if (o.kind && o.kind !== 'result' && o.kind !== 'resource') {
      E.recordCard(o.kind, o.title);
    }
    overlayEl.className = 'on' + (o.slide ? ' slide' : '');
    overlayEl.innerHTML = '';

    const LABELS = {
      supervision: '督导笔记',
      science: '科普',
      referral: '转介单',
      resource: '求助资源',
      result: '成绩',
    };

    const paper = make('div', { class: 'paper', 'data-kind': o.kind || 'science' });
    paper.appendChild(make('div', { class: 'head' }, [
      make('span', { class: 'label', text: LABELS[o.kind] || '资料' }),
      make('span', { class: 'rule' }),
    ]));
    if (o.title) paper.appendChild(make('h2', { text: o.title }));

    const body = make('div', { class: 'body' });
    paper.appendChild(body);

    const foot = make('div', { class: 'foot', text: o.footer || '' });
    if (o.footer) paper.appendChild(foot);

    const actions = make('div', { class: 'actions' });
    const btn = make('button', {
      class: 'btn' + (o.kind === 'resource' ? ' primary' : ''),
      type: 'button',
      text: o.button || '知道了',
    });
    actions.appendChild(btn);
    paper.appendChild(actions);
    overlayEl.appendChild(paper);

    // 正文：督导笔记和转介单逐字写出来，科普卡直接给（它更长，等不起）
    const full = (o.lines || []).join('\n\n');
    let handle = null;
    if (o.write && !reduceMotion) {
      const wrap = make('div', { class: 'writing' });
      body.appendChild(wrap);
      handle = typewrite(wrap, full, { speed: o.speed || 22 });
    } else {
      (o.lines || []).forEach(function (line) {
        body.appendChild(make('p', { text: line }));
      });
    }

    function finish() {
      closeOverlay();
      if (o.onClose) o.onClose();
    }

    btn.addEventListener('click', function () {
      // 还没写完就点：先把字补完，再点一次才关
      if (handle && !handle.done()) { handle.skip(); return; }
      finish();
    });
    btn.focus({ preventScroll: true });

    // 点纸外面也能关（但只有写完之后才允许，免得误触跳过）
    overlayEl.addEventListener('mousedown', function (ev) {
      if (ev.target !== overlayEl) return;
      if (handle && !handle.done()) return;
      finish();
    });

    return { close: finish };
  }

  X.ui = { showPaper: showPaper, closeOverlay: closeOverlay, typewrite: typewrite, reduceMotion: reduceMotion };

  // --------------------------------------------------------------------------
  // 情绪日记（手机备忘录的样子 —— 和"纸"不是一套材质）
  // --------------------------------------------------------------------------
  function showDiary(node, onDone) {
    if (!overlayEl) {
      overlayEl = make('div', { id: 'overlay' });
      document.body.appendChild(overlayEl);
    }
    overlayEl.className = 'on';
    overlayEl.innerHTML = '';

    const wrap = make('div', { class: 'diary' });
    wrap.appendChild(make('div', { class: 'bar' }, [
      make('b', { text: '备忘录' }),
      document.createTextNode('　' + (node.title || '情绪日记')),
    ]));

    const list = make('div', { class: 'list' });
    const foot = make('div', { class: 'foot' });

    const total = node.entries.length;
    let opened = 0;

    node.entries.forEach(function (entry) {
      const btn = make('button', { class: 'entry', type: 'button' });
      btn.appendChild(make('span', { class: 'day', text: entry.day }));
      btn.appendChild(make('span', { class: 'peek', text: entry.lines[0] }));

      const full = make('span', { class: 'full' });
      entry.lines.forEach(function (ln) {
        // 最后一行是那句话本身，最要紧，提亮
        const strong = ln === entry.lines[entry.lines.length - 1] && entry.lines.length > 1;
        full.appendChild(make('span', { class: 'line' + (strong ? ' strong' : ''), text: ln }));
      });
      if (entry.note) full.appendChild(make('span', { class: 'note', text: entry.note }));
      btn.appendChild(full);

      btn.addEventListener('click', function () {
        const wasOpen = btn.classList.contains('open');
        btn.classList.toggle('open');
        if (!wasOpen) {
          E.recordDiary(entry.id);
          opened = node.entries.filter(function (e2) {
            return E.state.diaryRead.indexOf(e2.id) >= 0;
          }).length;
          refreshFoot();
        }
      });
      list.appendChild(btn);
    });

    function refreshFoot() {
      // 提示只在还值得看的时候出现。都看过了就别再念叨。
      if (opened >= total) {
        tip.textContent = '四条都看完了。挑一条跟他谈。';
        tip.style.color = '#6f6c66';
      } else if (opened === 0) {
        tip.textContent = node.hint || '点开看看他都记了什么。';
        tip.style.color = '';
      } else {
        tip.textContent = '还有 ' + (total - opened) + ' 条没看。最少挑一条跟他谈。';
        tip.style.color = '';
      }
      cta.disabled = opened === 0;
      cta.textContent = opened === 0 ? '先点开一条' : '先谈哪一条';
    }

    wrap.appendChild(list);

    const actions = make('div', { class: 'foot' });
    actions.style.textAlign = 'right';
    var cta = make('button', { class: 'btn primary', type: 'button', text: '先点开一条' });
    cta.addEventListener('click', function () {
      closeOverlay();
      onDone();
    });
    actions.appendChild(cta);

    // 提示：不看完也能继续，但得先看一条
    var tip = make('div', { class: 'foot', text: '' });
    wrap.appendChild(tip);
    wrap.appendChild(actions);
    refreshFoot();

    overlayEl.appendChild(wrap);
    cta.focus({ preventScroll: true });
  }

  X.ui.showDiary = showDiary;

  // --------------------------------------------------------------------------
  // 顶栏
  // --------------------------------------------------------------------------
  function renderTop(chapter) {
    const top = $('#top');
    top.innerHTML = '';
    top.appendChild(make('div', { id: 'brand' }, [
      make('span', { class: 'zh', text: '心理咨询' }),
      make('span', { class: 'en', text: 'xlzx' }),
      chapter ? make('span', { class: 'chapter', text: chapter }) : null,
    ]));
    top.appendChild(make('div', { class: 'spacer' }));

    if (state.screen === 'story' || state.screen === 'end') {
      const back = make('button', { id: 'crisisBtn', type: 'button', text: '我很难受' });
      back.style.color = '#9d9a92';
      back.style.borderColor = '#3d3e4d';
      back.addEventListener('click', function () { openCrisisHelp(); });
      // 回标题
      const home = make('button', { id: 'homeBtn', type: 'button', text: '回标题' });
      home.style.cssText = 'font-family:inherit;font-size:13px;color:#6f6c66;background:transparent;' +
        'border:1px solid #3d3e4d;border-radius:2px;padding:5px 12px;cursor:pointer;letter-spacing:.06em';
      home.addEventListener('click', function () {
        E.saveCurrent();
        state.screen = 'title';
        render();
      });
      top.appendChild(home);
      top.appendChild(make('span', { style: 'width:8px' }));
      top.appendChild(back);
    } else {
      const help = make('button', { id: 'crisisBtn', type: 'button', text: '我很难受' });
      help.addEventListener('click', function () { openCrisisHelp(); });
      top.appendChild(help);
    }
  }

  /** 任何一屏都能点到的求助资源。这是"热线出现 3 处"里的第 2 处。 */
  function openCrisisHelp() {
    showPaper({
      kind: 'resource',
      title: '如果你或你身边的人正在经历这些',
      lines: [
        '全国心理援助热线：12356（国家卫健委统一号码）',
        '北京心理危机研究与干预中心：010-82951332',
        '如果存在立即的危险，请拨打 120，或直接前往最近的急诊。',
      ],
      footer: '这不是「小题大做」。打这个电话的人，每天都在打。',
      button: '回到游戏',
    });
  }

  // --------------------------------------------------------------------------
  // 标题页
  // --------------------------------------------------------------------------
  function renderTitle() {
    renderTop(null);
    const main = $('#main');
    const panel = $('#panel');
    panel.innerHTML = '';
    panel.style.display = 'none';
    main.style.display = '';
    main.innerHTML = '';

    const page = make('div', { class: 'page' });
    const grid = make('div', { class: 'title-grid' });

    // ---- 左：标题 ----
    const left = make('div', { class: 'title-main' });
    left.appendChild(make('div', { class: 'kicker', text: '康复心理学 · 课程作业' }));
    left.appendChild(make('h1', { text: '心理咨询' }));
    left.appendChild(make('div', { class: 'sub', text: 'counselling room' }));
    left.appendChild(make('p', {
      class: 'pitch',
      html: '你是康复医院心理门诊的咨询师。这间诊室每天下午开门，<em>来访者不是来听道理的</em>，' +
        '他们是被转介来的、被家人劝来的，或者自己也不知道为什么坐在这儿。<br><br>' +
        '你要做的不是劝他想开点，是让他自己看见那句话——<em>那个让他停下来的结论，' +
        '往往不是事实，是当时脑子里的一句话</em>。',
    }));

    const start = make('button', { class: 'start', type: 'button' });
    start.appendChild(make('span', { text: '开始' }));
    start.appendChild(make('span', { class: 'arrow', text: '→' }));
    start.addEventListener('click', function () {
      state.screen = 'choose';
      render();
    });
    left.appendChild(start);

    const cur = E.save().current;
    if (cur && cur.story) {
      const story = (X.stories || {})[cur.story] || null;
      const meta = story ? E.sectionMeta(story, cur.line) : null;
      const resume = make('button', {
        class: 'resume', type: 'button',
        text: '接着上次玩 · ' + (story ? story.title : '') + (meta ? ' · ' + meta.title : ''),
      });
      resume.addEventListener('click', function () {
        if (E.restore(cur)) {
          state.screen = 'story';
          render();
          renderNode();
        }
      });
      left.appendChild(resume);
    }
    grid.appendChild(left);

    // ---- 右：声明 + 资源 ----
    const side = make('div', { class: 'title-side' });
    side.appendChild(make('h3', { text: '关于这个作品' }));
    side.appendChild(make('p', {
      class: 'disc',
      html: '<b>本作品为康复心理学课程作业。</b><br>故事、人物、机构均为虚构，' +
        '与任何真实的人、单位、事件无关。<br>本作品不构成任何医疗建议，不能替代真实心理咨询。',
    }));

    side.appendChild(make('hr'));
    side.appendChild(make('h3', { text: '如果你需要帮助' }));
    const hot = make('div', { class: 'hotline' });
    hot.appendChild(make('span', {
      class: 'n',
      html: '12356<small>全国心理援助热线（国家卫健委统一号码）</small>',
    }));
    hot.appendChild(make('span', {
      class: 'n',
      html: '010-82951332<small>北京心理危机研究与干预中心</small>',
    }));
    hot.appendChild(make('span', {
      class: 'n',
      html: '120<small>存在立即的危险，请拨打或直接前往最近的急诊</small>',
    }));
    side.appendChild(hot);

    side.appendChild(make('hr'));
    side.appendChild(make('p', {
      html: '<span style="color:#6f6c66;font-size:12.5px">' +
        '进度只存在这台电脑的浏览器里，不会上传。清掉浏览器数据就没有了。</span>',
    }));
    grid.appendChild(side);

    page.appendChild(grid);
    main.appendChild(page);
  }

  // --------------------------------------------------------------------------
  // 选线页
  // --------------------------------------------------------------------------
  function renderChoose() {
    renderTop(null);
    const main = $('#main');
    const panel = $('#panel');
    panel.innerHTML = '';
    panel.style.display = 'none';
    main.style.display = '';
    main.innerHTML = '';

    const page = make('div', { class: 'page' });
    const head = make('div', { class: 'choose-head' });
    head.appendChild(make('div', { class: 'kicker', text: '选一条线' }));
    head.appendChild(make('h2', { text: '同一间诊室，不同的人' }));
    head.appendChild(make('p', {
      text: '三条完全独立的故事线，选一条走完。每条都是一次完整的过程，' +
        '不用按顺序玩。目前只有第一条写完了，另外两条还在写。',
    }));
    page.appendChild(head);

    const list = make('div', { class: 'lines' });
    const done = E.save().done;

    X.storySlots.forEach(function (slot) {
      const ready = !!slot.ready;
      const card = make('button', {
        class: 'line-card', type: 'button',
        'data-ready': String(ready),
        'data-done': String(!!done[slot.id]),
        disabled: ready ? null : 'disabled',
      });
      card.appendChild(make('span', { class: 'num', text: slot.numeral }));
      const meta = make('span', { class: 'meta' });
      meta.appendChild(make('h3', { text: slot.title }));
      meta.appendChild(make('div', { class: 'who', text: slot.who }));
      meta.appendChild(make('div', { class: 'what', text: slot.lead }));
      card.appendChild(meta);

      let badgeText = '即将推出';
      if (ready) badgeText = done[slot.id] ? '✓ 已完成' : '可玩 · 约 8 分钟';
      card.appendChild(make('span', { class: 'badge', text: badgeText }));

      if (ready) {
        card.addEventListener('click', function () { startStory((X.stories || {})[slot.id]); });
      } else {
        // 剪影：没写的线用一条人的形状占位，不假装能玩
        card.appendChild(make('span', {
          class: 'silhouette',
          html: '<svg viewBox="0 0 20 20" width="40" height="40">' +
            '<circle cx="10" cy="5" r="3.4" fill="#3d3e4d"/>' +
            '<path d="M4 20c0-4 2.7-7 6-7s6 3 6 7z" fill="#3d3e4d"/></svg>',
        }));
      }
      list.appendChild(card);
    });

    page.appendChild(list);
    main.appendChild(page);
  }

  // --------------------------------------------------------------------------
  // 进游戏
  // --------------------------------------------------------------------------
  let typer = null;        // 当前这一句的逐字写出句柄
  let awaitingChoice = false;
  let paperOpen = false;

  function startStory(story) {
    state.story = story;
    state.line = story.start;
    state.node = E.getNode(story, story.start);
    state.flags = {};
    state.choices = [];
    state.itemsSeen = [];
    state.cardsSeen = [];
    state.diaryRead = [];
    state.act = 1;
    state.warmth = 1;
    state.screen = 'story';
    E.enter(state.node);
    render();
    renderNode();
  }

  X.ui.startStory = startStory;

  // --------------------------------------------------------------------------
  // 场景
  // --------------------------------------------------------------------------
  function currentClickable() {
    const node = state.node || {};
    const allowed = node.allowItems || [];
    if (!allowed.length || !X.roomItems) return [];

    const act = state.act;
    // 既有内容、又被这一段允许的，才是热的
    return allowed.filter(function (id) {
      if (id === 'mobility') return true;
      const item = X.roomItems[id];
      return item && item.acts && item.acts[act];
    });
  }

  function renderRoom() {
    const host = $('#room');
    if (!host) return;
    host.innerHTML = '';
    const clickable = currentClickable();
    const svg = E.renderScene({
      act: state.act,
      warmth: state.warmth,
      withPeople: true,
      clickable: clickable,
      onItem: openRoomItem,
    });
    host.appendChild(svg);
    scaleRoom();
  }

  function openRoomItem(id) {
    E.recordItem(id);
    if (id === 'mobility') {
      // 文案来自故事数据：故事线一是轮椅，故事线二是双拐。
      const m = (state.story && state.story.mobility) || null;
      if (m) {
        showPaper({ kind: 'science', title: m.title, lines: m.lines, button: '继续聊' });
      }
      return;
    }
    const item = X.roomItems[id];
    if (!item) return;
    const actData = item.acts[state.act];
    if (!actData) return;
    showPaper({
      kind: actData.kind,
      title: actData.title,
      lines: actData.lines,
      footer: actData.footer,
      button: '知道了',
      write: actData.kind === 'referral',
      speed: 18,
    });
  }

  /** 房间按视口缩放（保持整数倍，否则像素会糊） */
  function scaleRoom() {
    const room = $('#room');
    const wrap = $('#roomWrap');
    if (!room || !wrap) return;
    const cssW = wrap.clientWidth || 636;
    const avail = window.innerHeight;
    // 636×360 是原始尺寸，底下还要给对话区留 300px
    const maxH = Math.max(220, avail - 320);
    let factor = Math.min(1, maxH / 360);
    factor = Math.max(0.5, factor);
    if (factor >= 0.999) {
      room.style.transform = '';
      wrap.style.height = '';
    } else {
      room.style.transform = 'scale(' + factor.toFixed(3) + ')';
      wrap.style.height = Math.round(360 * factor) + 'px';
    }
  }

  // --------------------------------------------------------------------------
  // 正文渲染
  // --------------------------------------------------------------------------
  function setWho(who, role) {
    const who$ = $('#who');
    who$.textContent = who || '';
    who$.setAttribute('data-role', role || who || '');
  }

  function clearChoices() {
    const c = $('#choices');
    if (c) { c.innerHTML = ''; c.style.display = 'none'; }
    awaitingChoice = false;
  }

  function setHint(text) {
    const hint = $('#hint');
    if (!hint) return;
    hint.innerHTML = '';
    if (text) {
      hint.appendChild(make('span', { class: 'dot' }));
      hint.appendChild(make('span', { text: text }));
    }
    const right = make('span', { class: 'right', text: '' });
    hint.appendChild(right);
  }

  function caretSlot() {
    const t = $('#text');
    const c = make('span', { class: 'caret', text: '▌' });
    t.appendChild(c);
    return c;
  }

  /** 画当前节点 */
  function renderSay(node) {
    if (state.screen !== 'story') return;
    renderTop(chapterLabel());
    renderRoom();

    const textEl = $('#text');
    clearChoices();

    paperOpen = false;
    const role = node.who || '旁白';
    setWho(role === '旁白' ? '' : role, role);

    // 督导笔记是挂在台词上的一张纸：先把话说出来，再弹纸
    const hasNote = !!node.note;

    if (typer) typer.skip();

    if (!node.text) {
      textEl.textContent = '';
      advance(node.next);
      return;
    }

    const caret = caretSlot();
    let advanced = false;

    function allowAdvance() {
      const hintText = node.hint
        || (currentClickable().length ? '点房间里发光的东西，可以看它的来历' : '');
      setHint(hintText);
      const right = $('#hint .right');
      if (right) right.textContent = '空格 / 点文字继续';
    }

    function hit() {
      if (advanced || paperOpen || awaitingChoice) return;
      if (typer && !typer.done()) { typer.skip(); return; }  // 第一下：把字补完
      if (hasNote) return;                                  // 纸自己会推进
      advanced = true;                                      // 第二下：往下走
      advance(node.next);
    }

    // 纸上的标题由数据决定。督导笔记默认不写标题——左上角的类型标签
    // 已经说明了这是什么，再写一遍"督导笔记"就是同一句话说两次。
    var noteMeta = node.note || { kind: 'supervision' };

    // **必须在启动打字机之前就挂上**。
    // 打字机跑的时候每次都重建了 #text 的内容，但 _advance 要是这时候还没挂，
    // 玩家在头一两秒里点文字就完全没反应——看起来像卡住了。
    textEl.onclick = hit;
    textEl._advance = hit;
    // 这一段答完之后会滑进来一张纸。纸自己会推进，所以这一小段时间里
    // 点文字是"没反应"的——把这件事说出来，别让调用方以为卡住了。
    textEl._awaitingNote = hasNote;

    typer = typewrite(textEl, node.text, {
      onEnd: function () {
        if (caret) caret.classList.remove('off');
        allowAdvance();
        if (hasNote) {
          // 话说完了，纸从右边滑进来
          showPaper({
            kind: noteMeta.kind || 'supervision',
            title: noteMeta.title || '',
            lines: [noteMeta.text || node.text],
            button: '知道了',
            slide: true,
            write: true,
            speed: 24,
            onClose: function () { advance(node.next); },
          });
        }
      },
    });
    if (caret) caret.classList.add('off');

    if (node.next === null || node.next === undefined) allowAdvance();
  }

  /** 画一个选择点：先把提示句说出来，再挂选项 */
  function renderChoice(node) {
    if (state.screen !== 'story') return;
    renderTop(chapterLabel());
    renderRoom();

    if (typer) typer.skip();
    setWho('', '');

    const textEl = $('#text');
    textEl.onclick = null;
    textEl._advance = null;
    textEl.textContent = node.prompt || '';

    const choicesEl = $('#choices');
    choicesEl.innerHTML = '';
    choicesEl.style.display = '';
    awaitingChoice = true;

    node.options.forEach(function (opt, i) {
      const btn = make('button', { class: 'choice', type: 'button' });
      btn.appendChild(make('span', { class: 'key', text: String(i + 1) }));
      btn.appendChild(make('span', { class: 'label', text: opt.label }));
      btn.addEventListener('click', function () { X.ui.chooseOption(i); });
      choicesEl.appendChild(btn);
      if (i === 0) window.setTimeout(function () { btn.focus({ preventScroll: true }); }, 30);
    });

    setHint(node.hint || '');
    const right = $('#hint .right');
    if (right) right.textContent = '按 1–' + node.options.length + ' 也能选';
  }

  /** 总入口：按节点类型分派 */
  function renderNode() {
    if (state.screen !== 'story') return;
    const node = state.node;
    if (!node) return;

    if (node.type === 'choice') return renderChoice(node);
    if (node.type === 'say') return renderSay(node);

    // 以下是"纸"类的节点，正文区空着，靠弹层推进
    renderTop(chapterLabel());
    renderRoom();
    const textEl = $('#text');
    if (typer) typer.skip();
    textEl.onclick = null;
    textEl._advance = null;
    clearChoices();
    paperOpen = true;

    if (node.type === 'card') {
      setWho('', '');
      textEl.textContent = '';
      setHint('');
      showPaper({
        kind: node.kind || 'science',
        title: node.title,
        lines: node.lines,
        footer: node.footer,
        button: node.button,
        onClose: function () {
          paperOpen = false;
          if (node.ending) { finishStory(); return; }
          advance(node.next);
        },
      });
      return;
    }

    if (node.type === 'result') {
      setWho('', '');
      textEl.textContent = '';
      setHint('');
      showResult(node);
      return;
    }

    if (node.type === 'diary') {
      setWho('', '');
      textEl.textContent = '';
      setHint('');
      showDiary(node, function () { paperOpen = false; advance(node.next); });
      return;
    }
  }

  function chapterLabel() {
    const meta = E.sectionMeta(state.story, state.line);
    if (!meta) return '';
    return state.story.title + ' · ' + meta.title + (meta.subtitle ? ' · ' + meta.subtitle : '');
  }

  /** 推进到下一个节点并重画 */
  function advance(target) {
    if (state.screen !== 'story') return;
    const before = state.line;
    const node = E.go(target);
    if (!node) return;
    const beforeSec = before.split('/')[0];
    const afterSec = state.line.split('/')[0];
    E.enter(node);

    // 换小节：淡出淡入一次
    if (beforeSec !== afterSec) {
      transition(function () { renderNode(); });
    } else {
      renderNode();
    }
    E.saveCurrent();
  }

  function transition(mid) {
    const fade = $('#fade');
    fade.classList.add('on');
    window.setTimeout(function () {
      mid();
      window.setTimeout(function () { fade.classList.remove('on'); }, 90);
    }, 480);
  }

  // --------------------------------------------------------------------------
  // 成绩单
  // --------------------------------------------------------------------------
  /** 成绩单只看一次：看过之后按钮改成"继续"，别一直让人以为还有新东西 */
  let resultSeen = false;

  function showResult(node) {
    const flags = state.flags;
    const choices = state.choices;

    // 这一节真正发生了什么，全部从 choices / flags 里读出来，不写死
    const lines = [];
    const openB = flags.openB;
    lines.push(['开场', openB ? '你先问他想聊什么，而不是复述转介单。'
      : flags.openA ? '你复述了转介单上「配合度差」那句。'
        : '你问了「最近怎么样」，换回一个安全答案。']);
    lines.push(['保密例外', flags.askedBoundary
      ? '你把边界讲清楚了，他追问了一次——说明他听进去了。'
      : '你讲完了设置，但没确认他听懂没有。']);
    lines.push(['王医生的托付', flags.ethB ? '你没替来访者做主，也没当面驳他。'
      : flags.ethA ? '你答应了一件不该由你答应的事。'
        : '你指出了医学事实，但那是你在走廊里替他定的调。']);
    lines.push(['危机筛查', flags.screened
      ? (flags.crisisTriggered ? '你问了。他说了。你按写死的流程接住了他。' : '你问了，他答了。')
      : '你没问。这不扣分，但下次得问。']);

    const diaryRead = state.diaryRead.length;
    lines.push(['情绪日记', diaryRead >= 4 ? '四条都看了。你从里头认出了自动化思维、个人化、读心术和回避。'
      : '你看了 ' + diaryRead + ' 条。剩下的没看，也就没谈。']);

    lines.push(['「等我能走了」', flags.waiting ? '你没拆他的目标，你把「等」摆到了桌面上。'
      : flags.reality ? '你宣布了「接受现实」——目标是他的，不该由你说。'
        : '你抛回了一个太虚的问题，他接不住。']);

    const cards = state.cardsSeen.length;
    lines.push(['看过的资料', cards + ' 张']);

    const body = make('div', {});
    const ul = make('ul', { class: 'tally' });
    lines.forEach(function (pair) {
      const li = make('li', {});
      li.appendChild(make('span', { class: 'k', text: pair[0] }));
      const v = make('span', { class: 'v', text: pair[1] });
      if (/没问|不该|不安全|没看|接不住|复述/.test(pair[1])) v.className = 'v miss';
      li.appendChild(v);
      ul.appendChild(li);
    });
    body.appendChild(ul);

    if (!flags.screened) {
      body.appendChild(make('p', {
        style: 'color:#8a5a20',
        text: '提醒：这条线里你没有做危机筛查。脊髓损伤的人里，抑郁很容易被漏掉——' +
          '「没劲儿」「不想动」「睡不好」太容易被当成身体的问题。下一次，得问。',
      }));
    }
    body.appendChild(make('p', {
      style: 'color:#6d6250;font-size:13.5px;margin-top:14px',
      text: '同一件事有不止一种做法，没有哪一次选择会卡死。',
    }));

    const paper = make('div', { class: 'paper', 'data-kind': 'result' });
    paper.appendChild(make('div', { class: 'head' }, [
      make('span', { class: 'label', text: '成绩' }),
      make('span', { class: 'rule' }),
    ]));
    paper.appendChild(make('h2', { text: node.title }));
    if (node.lead) {
      // lead 用衬线，和台词分开——这是"结论"，不是"对话"
      paper.appendChild(make('p', {
        class: 'result-lead',
        text: node.lead,
      }));
    }
    const bodyWrap = make('div', { class: 'body' });
    bodyWrap.appendChild(body);
    paper.appendChild(bodyWrap);

    const actions = make('div', { class: 'actions' });
    const btn = make('button', {
      class: 'btn primary', type: 'button',
      text: resultSeen ? '继续' : (node.button || '继续'),
    });
    resultSeen = true;
    actions.appendChild(btn);
    paper.appendChild(actions);
    overlayEl.innerHTML = '';
    overlayEl.className = 'on';
    overlayEl.appendChild(paper);
    btn.focus({ preventScroll: true });
    btn.addEventListener('click', function () {
      closeOverlay();
      paperOpen = false;
      advance(node.next);
    });
  }

  // --------------------------------------------------------------------------
  // 通关
  // --------------------------------------------------------------------------
  function finishStory() {
    E.markDone(state.story.id);
    E.clearCurrent();
    state.screen = 'end';
    renderEnd();
  }

  function renderEnd() {
    renderTop('');
    const main = $('#main');
    const panel = $('#panel');
    panel.style.display = '';
    main.style.display = 'none';
    panel.innerHTML = '';

    panel.appendChild(make('div', { id: 'who' }));
    const h = make('div', {
      style: 'font-size:26px;letter-spacing:.06em;margin:0 0 14px',
      text: (state.story && state.story.end && state.story.end.heading) || '本节 · 完',
    });
    panel.appendChild(h);

    const text = make('div', {
      style: 'font-size:18px;line-height:1.95;color:#b9b5ac;max-width:38em',
      text: (state.story && state.story.end && state.story.end.closing) || '',
    });
    panel.appendChild(text);

    const row = make('div', { style: 'display:flex;gap:10px;margin-top:24px;flex-wrap:wrap' });
    const again = make('button', { class: 'btn primary', type: 'button', text: '再来一遍' });
    again.addEventListener('click', function () { startStory(state.story); });
    const home = make('button', { class: 'btn', type: 'button', text: '回标题页' });
    home.addEventListener('click', function () { state.screen = 'title'; render(); });
    const help = make('button', { class: 'btn', type: 'button', text: '求助资源' });
    help.addEventListener('click', function () { openCrisisHelp(); });
    row.appendChild(again); row.appendChild(home); row.appendChild(help);
    panel.appendChild(row);
  }

  // --------------------------------------------------------------------------
  // 总渲染
  // --------------------------------------------------------------------------
  function render() {
    if (state.screen === 'title') return renderTitle();
    if (state.screen === 'choose') return renderChoose();
    if (state.screen === 'story') return renderStoryShell();
    if (state.screen === 'end') return renderEnd();
  }

  function renderStoryShell() {
    const main = $('#main');
    const panel = $('#panel');
    main.style.display = 'none';
    main.innerHTML = '';
    panel.style.display = '';
    panel.innerHTML = '';

    // 场景
    const stage = make('div', { id: 'stage' });
    stage.appendChild(make('div', { id: 'roomWrap' }, [
      make('div', { id: 'room' }),
    ]));
    // 对话区
    const who = make('div', { id: 'who' });
    const text = make('div', { id: 'text' });
    const choices = make('div', { id: 'choices' });
    choices.style.display = 'none';
    const hint = make('div', { id: 'hint' });
    panel.appendChild(who); panel.appendChild(text);
    panel.appendChild(choices); panel.appendChild(hint);

    // stage 放在 panel 之前：DOM 顺序决定上下位置
    panel.parentNode.insertBefore(stage, panel);
  }

  X.ui.render = render;
  X.ui.renderNode = function () { renderNode(); };
  X.ui.showResult = showResult;
  X.ui.advance = advance;
  X.ui.openCrisisHelp = openCrisisHelp;
  X.ui.startStory = startStory;
  X.ui.scaleRoom = scaleRoom;

  /**
   * 清干净回到标题页。
   * 别让外部直接改 state 再调 render()——那样上一局的 overlay / 打字机 /
   * 选项状态都还留着，下一页会莫名其妙（测试里踩过）。
   */
  X.ui.restart = function () {
    if (typer) { typer.skip(); typer = null; }
    closeOverlay();
    awaitingChoice = false;
    paperOpen = false;
    resultSeen = false;
    state.screen = 'title';
    state.story = null;
    state.node = null;
    state.line = null;
    render();
  };

  // 选选项
  X.ui.chooseOption = function (index) {
    const node = state.node;
    if (!node || node.type !== 'choice' || !awaitingChoice) return;
    const opt = node.options[index];
    if (!opt) return;
    E.recordChoice(state.line, opt);
    awaitingChoice = false;
    clearChoices();
    advance(opt.next);
  };

  // --------------------------------------------------------------------------
  // 键盘
  // --------------------------------------------------------------------------
  document.addEventListener('keydown', function (ev) {
    if (ev.metaKey || ev.ctrlKey || ev.altKey) return;

    // 纸开着时，空格 / 回车 = 点那张纸的按钮
    if (overlayEl && overlayEl.classList.contains('on')) {
      if (ev.key === ' ' || ev.key === 'Enter') {
        const btn = $('.btn.primary', overlayEl) || $('.btn', overlayEl);
        if (btn) { ev.preventDefault(); btn.click(); }
      }
      return;
    }

    if (state.screen !== 'story') {
      if (ev.key === 'Escape' && state.screen !== 'title') {
        state.screen = 'title';
        render();
      }
      return;
    }

    if (awaitingChoice) {
      const n = parseInt(ev.key, 10);
      if (n >= 1 && n <= 9) {
        ev.preventDefault();
        X.ui.chooseOption(n - 1);
      }
      return;
    }

    if (ev.key === ' ' || ev.key === 'Enter') {
      ev.preventDefault();
      const t = $('#text');
      if (t && t._advance) t._advance();
    }
  });

  window.addEventListener('resize', function () {
    if (state.screen === 'story') scaleRoom();
  });

  // --------------------------------------------------------------------------
  // 启动
  // --------------------------------------------------------------------------
  X.ui.boot = function () {
    E.load();
    render();
  };
})(window.XLZX = window.XLZX || {});
