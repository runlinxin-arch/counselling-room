//=============================================================================
// 内容数据 · 故事线三：慢性疼痛
//-----------------------------------------------------------------------------
// 全部台词来自 docs/story/故事线3-慢性疼痛.md（剧本 · 日常口语版）。
// 这里只做三件事：拆行、挂跳转、挂科普卡。
// **不改台词**——台词的问题应该在剧本文件里改，改完再同步到这里。
//
// 主角：陈静，38 岁，慢性下背痛 3 年（工地搬抬时受伤起病）。
// 核心冲突：看不见的痛、灾难化思维、配偶过度照顾反而强化疼痛。
//
// 本线依据全部来自手册第 14 章 Chronic Pain。与故事线一、二不同的是：
// 第 14 章**没有给出患病率一类的百分比**，所以这一条线里不出现任何百分数——
// 不是省略，是书里没有的就不编。可引的是定性结论，逐条注在对应节点旁。
//=============================================================================

var XLZX = (typeof window !== 'undefined' && window.XLZX) || {};
if (typeof window !== 'undefined') window.XLZX = window.XLZX;

// ---------------------------------------------------------------------------
// 第 1 节：片子拍不出来
// ---------------------------------------------------------------------------
const PAIN_S1 = {
  'n1': {
    type: 'say', who: '旁白', act: 1, warmth: 1,
    text: '她进门先坐下，手一直压在腰上。坐姿换了三次。',
    next: 'n2',
  },
  'n2': {
    type: 'say', who: '陈静',
    text: '不好意思，我坐着不太舒服。',
    next: 'n3',
  },
  'n3': {
    type: 'say', who: '陈静',
    text: '不用管我，你说你的。',
    next: 'c1',
  },

  // ---- 选项 1：她先说「不用管我」 ----
  'c1': {
    type: 'choice',
    prompt: '怎么接「不用管我」',
    options: [
      { key: 'A', label: '不用管你，可你一直没坐踏实。咱先说这个。', next: 'a1', flag: 'painNotice' },
      { key: 'B', label: '那你换个舒服的姿势，站着说也行。', next: 'b1', flag: 'painAdjust' },
      { key: 'C', label: '好，那咱开始。今天想聊点什么？', next: 'd1', flag: 'painSkip' },
    ],
  },
  'a1': { type: 'say', who: '陈静', text: '（停了一下）', next: 'a2' },
  'a2': { type: 'say', who: '陈静', text: '……你不用管我。真的。', next: 'a3' },
  'a3': { type: 'say', who: '陈静', text: '（又换了一次姿势）我习惯了。', next: 'a4' },
  'a4': {
    type: 'say', note: { kind: 'supervision' },
    text: '「我习惯了」是她今天第一句实话，也是第一句掩话。你把注意力放在她身体上，她先否认了一次，然后漏出来一点。',
    next: 'setup1',
  },

  'b1': { type: 'say', who: '陈静', text: '（笑了一下）那多奇怪。', next: 'b2' },
  'b2': { type: 'say', who: '陈静', text: '来这儿的人不都坐着吗。', next: 'b3' },
  'b3': {
    type: 'say', note: { kind: 'supervision' },
    text: '你给了她一个具体的、能立刻用的办法。她没有接受，也没有拒绝——她在确认这里允不允许她「不方便」。',
    next: 'setup1',
  },

  'd1': { type: 'say', who: '陈静', text: '……都行。', next: 'd2' },
  'd2': { type: 'say', who: '陈静', text: '你说聊什么就聊什么。', next: 'd3' },
  'd3': {
    type: 'say', note: { kind: 'supervision' },
    text: '她把选择权让给了你。这种「都行」通常不是随和，是久了之后不敢提要求。',
    next: 'setup1',
  },

  // ---- 咨询设置 ----
  'setup1': {
    type: 'say', who: '咨询师',
    text: '先说几句规矩。咱俩说的话我不往外说，包括你爱人。除非你同意，或者有危险。',
    next: 'setup2',
  },
  'setup2': {
    type: 'say', who: '咨询师',
    text: '一次五十分钟。中间你要站起来走走、靠着、或者停一下，都行，不用问我。',
    next: 'setup3',
  },
  'setup3': { type: 'say', who: '陈静', text: '（点头）', next: 'room1' },

  // ---- 咨询室箭头标注 ----
  'room1': {
    type: 'say', who: '旁白',
    text: '房间里几样东西，箭头标出了它们是干什么用的。',
    allowItems: ['referral', 'tissue', 'clock', 'sofa'],
    next: 'r1',
  },
  'r1': { type: 'say', who: '陈静', text: '这个沙发挺软的。', next: 'r2' },
  'r2': {
    type: 'say', who: '陈静',
    text: '软的我反而坐不住。家里那个硬板凳我坐着好点。',
    next: 'r3',
  },
  'r3': {
    type: 'say', note: { kind: 'supervision' },
    text: '她在跟你说她自己的身体经验。这类细节比「我疼」三个字有用得多——疼是怎么个疼法、什么时候轻，都藏在这里。',
    next: 'e1',
  },

  // ---- 主诉：片子拍不出来 ----
  'e1': {
    type: 'say', who: '咨询师',
    text: '转介单上写着「慢性下背痛三年」。这三年，是怎么过来的？',
    next: 'e2',
  },
  'e2': { type: 'say', who: '陈静', text: '拍片子拍了不知道多少次。', next: 'e3' },
  'e3': {
    type: 'say', who: '陈静',
    text: 'CT、核磁，都做过。大夫说没什么大问题。',
    next: 'e4',
  },
  'e4': { type: 'say', who: '陈静', text: '（停了一下）没什么大问题。', next: 'e5' },
  'e5': { type: 'say', who: '陈静', text: '可我就是疼。', next: 'card_imaging' },
  'card_imaging': {
    type: 'card', kind: 'science',
    title: '片子拍不出问题，不等于痛是假的',
    lines: [
      '在慢性下背痛里，用影像去找致痛的病灶，常常找不到。',
      '反过来也成立：很多没有任何疼痛的人，片子上却有看起来应该会痛的改变。',
      '所以「影像正常」和「痛是真的」这两件事，可以同时成立。',
      '痛是一种体验，不只是组织损伤的读数。',
    ],
    footer: '依据：第 14 章 · Psychological Factors（Geisser et al., 2007；Turk & Flor, 1999）',
    next: 'e6',
  },
  'e6': { type: 'say', who: '陈静', text: '后来我就不说了。', next: 'e7' },
  'e7': { type: 'say', who: '咨询师', text: '跟谁说？', next: 'e8' },
  'e8': { type: 'say', who: '陈静', text: '我老公。我姐。单位。', next: 'e9' },
  'e9': {
    type: 'say', who: '陈静',
    text: '一开始还说。后来他们那个眼神，我就懂了。',
    next: 'e10',
  },
  'e10': { type: 'say', who: '陈静', text: '片子都好的，你还疼什么。', next: 'e11' },
  'e11': { type: 'say', who: '陈静', text: '这话我听过不止一遍。', next: 'e12' },
  'e12': {
    type: 'say', note: { kind: 'supervision' },
    text: '「片子都好的，你还疼什么」——这句话把一个医学结论变成了对她的质疑。她今天的沉默就是从这儿开始的。',
    next: 'f1',
  },

  // ---- 怕动 → 越不动越差 ----
  'f1': { type: 'say', who: '咨询师', text: '现在一天大概怎么过？', next: 'f2' },
  'f2': {
    type: 'say', who: '陈静',
    text: '早上好点。送孩子上学，回来收拾收拾。',
    next: 'f3',
  },
  'f3': { type: 'say', who: '陈静', text: '下午就沉了。到晚上，翻身都费劲。', next: 'f4' },
  'f4': { type: 'say', who: '咨询师', text: '弯腰拿东西呢？', next: 'f5' },
  'f5': { type: 'say', who: '陈静', text: '不弯。', next: 'f6' },
  'f6': {
    type: 'say', who: '陈静',
    text: '要捡地上的东西，我用脚勾过来，或者叫我老公。',
    next: 'f7',
  },
  'f7': { type: 'say', who: '咨询师', text: '从什么时候开始不弯的？', next: 'f8' },
  'f8': { type: 'say', who: '陈静', text: '（想了一下）……有一年多了吧。', next: 'f9' },
  'f9': {
    type: 'say', who: '陈静',
    text: '弯下去那一下，像被电。我试过几次，就不试了。',
    next: 'card_fear',
  },
  'card_fear': {
    type: 'card', kind: 'science',
    title: '越怕越不动，越不动越怕',
    lines: [
      '痛的心理研究里，被引用最多的一类模型叫「恐惧—回避」。',
      '它的说法是：人因为怕痛，会去改掉活动方式，尽量不让自己遇到那种痛。',
      '结果是活动量慢慢降下来，参与的事情也一件件退出。',
      '短期确实少疼了，长期反而更差——身体能力和信心都跟着退。',
    ],
    footer: '依据：第 14 章 · Psychological Factors（Vlaeyen & Linton, 2000）',
    next: 'f10',
  },
  'f10': {
    type: 'say', who: '咨询师',
    text: '你刚才说「试过几次就不试了」。不试之后，弯腰这件事，是更敢了还是更不敢了？',
    next: 'f11',
  },
  'f11': { type: 'say', who: '陈静', text: '（没说话）', next: 'f12' },
  'f12': { type: 'say', who: '陈静', text: '……更不敢。', next: 'f13' },
  'f13': {
    type: 'say', who: '陈静',
    text: '现在就是弯腰捡个袜子，我都得先想一下。',
    next: 'f14',
  },
  'f14': {
    type: 'say', note: { kind: 'supervision' },
    text: '她自己把这个循环说出来了。你没有讲道理，只是问了一句「更敢还是更不敢」。',
    next: 'g1',
  },

  // ---- 配偶的过度照顾第一次露面 ----
  'g1': {
    type: 'say', who: '咨询师',
    text: '刚才你说，捡东西会叫你老公。',
    next: 'g2',
  },
  'g2': { type: 'say', who: '陈静', text: '他听见我起来就过来。', next: 'g3' },
  'g3': {
    type: 'say', who: '陈静',
    text: '我还没说要干嘛呢，他就说「你别动，我来」。',
    next: 'g4',
  },
  'g4': { type: 'say', who: '咨询师', text: '那你什么感觉？', next: 'g5' },
  'g5': { type: 'say', who: '陈静', text: '（很快）他对我挺好的。', next: 'g6' },
  'g6': { type: 'say', who: '陈静', text: '我们结婚十年，他从来没这样过。', next: 'g7' },
  'g7': {
    type: 'say', who: '陈静',
    text: '（停了一下）可我现在……好像什么也干不了了。',
    next: 'g8',
  },
  'g8': {
    type: 'say', note: { kind: 'supervision' },
    text: '她说了一句「他对我挺好的」，又补了一句「我什么也干不了了」。这两句不矛盾——它们正是同一个循环的两头。',
    next: 'crisis1',
  },

  // ---- 危机筛查（可以不问）----
  'crisis1': {
    type: 'choice',
    prompt: '问不问',
    options: [
      { key: 'A', label: '疼了三年，有没有过觉得，这么活着没什么意思？', next: 'cr1', flag: 'painScreened' },
      { key: 'B', label: '不问。今天头一回，先不碰这个。', next: 'cn1', flag: 'painScreenSkipped' },
    ],
  },
  'cr1': { type: 'say', who: '陈静', text: '（看了你一眼）', next: 'cr2' },
  'cr2': { type: 'say', who: '陈静', text: '有。', next: 'cr3' },
  'cr3': { type: 'say', who: '陈静', text: '但不是想死那种。', next: 'cr4' },
  'cr4': {
    type: 'say', who: '陈静',
    text: '就是有时候想，要是一觉睡过去，不用醒来面对这一天，挺好的。',
    next: 'cr5',
  },
  'cr5': {
    type: 'say', who: '咨询师',
    text: '谢谢你告诉我。这句话很重要，我要跟你把它说全。',
    // 危机关怀写死在数据里：引擎看到 effect:'crisis' 就置 crisisTriggered，
    // 不经过任何模型判断。
    effect: 'crisis',
    next: 'card_crisis',
  },
  'card_crisis': {
    type: 'card', kind: 'resource',
    title: '如果这种时候再出现',
    lines: [
      '全国心理援助热线：12356（国家卫健委统一号码）',
      '北京心理危机研究与干预中心：010-82951332',
      '如果存在立即的危险，请拨打 120，或直接前往最近的急诊。',
    ],
    footer: '这不是「小题大做」。打这个电话的人，每天都在打。',
    button: '知道了',
    next: 'cr6',
  },
  'cr6': {
    type: 'say', who: '咨询师',
    text: '「想睡过去不用醒」这种念头，不等于你想死。但它说明你已经很累了，累到不想再撑一天。',
    next: 'cr7',
  },
  'cr7': { type: 'say', who: '陈静', text: '……嗯。', next: 'cr8' },
  'cr8': {
    type: 'say', note: { kind: 'supervision' },
    text: '她说出了那个念头，而且分得清它和「想死」不是一回事。这一次问，值。',
    next: 'hw1',
  },

  'cn1': {
    type: 'say', note: { kind: 'supervision' },
    text: '你没问。第一次见，关系还没建立，这不算错。但记住：慢性疼痛的人情绪低落很常见，下一次别一直绕开。',
    effect: 'markScreenMissed',
    next: 'hw1',
  },

  // ---- 留作业 ----
  'hw1': {
    type: 'say', who: '咨询师',
    text: '给你留个作业。不难，但需要你留意。',
    next: 'hw2',
  },
  'hw2': {
    type: 'say', who: '咨询师',
    text: '一天里挑三回，记一下当时在干什么、心里冒出来的第一句话是什么。',
    next: 'hw3',
  },
  'hw3': { type: 'say', who: '陈静', text: '记这个有用吗？', next: 'hw4' },
  'hw4': {
    type: 'say', who: '咨询师',
    text: '因为有些话你每天在心里说，说得太快，自己都没听见。写下来才听得见。',
    next: 'hw5',
  },
  'hw5': { type: 'say', who: '陈静', text: '……那我试试。', next: 'end1' },

  'end1': {
    type: 'result',
    title: '第 1 节 · 完',
    lead: '片子正常和痛是真的，可以同时成立。她需要的不是再拍一张片子，是有人相信她说的。',
    button: '看这一节的成绩单',
    next: 'end2',
  },
  'end2': {
    type: 'card', kind: 'resource',
    title: '如果你或你身边的人正在经历这些',
    lines: [
      '全国心理援助热线：12356（国家卫健委统一号码）',
      '北京心理危机研究与干预中心：010-82951332',
      '如果存在立即的危险，请拨打 120，或直接前往最近的急诊。',
    ],
    footer: '这不是「小题大做」。打这个电话的人，每天都在打。',
    button: '知道了',
    next: 's2/n1',
  },
};

// ---------------------------------------------------------------------------
// 第 2 节：那句话
// ---------------------------------------------------------------------------
const PAIN_S2 = {
  'n1': {
    type: 'say', who: '旁白', act: 2, warmth: 2,
    text: '这次她自己带了本子。翻开的时候手指按着腰。',
    next: 'n2',
  },
  'n2': { type: 'say', who: '陈静', text: '记了。就是有点乱。', next: 'n3' },
  'n3': {
    type: 'say', who: '陈静',
    text: '有些是我自己看了都脸红的话。',
    next: 'c1',
  },

  // ---- 选项 1：她说「看了都脸红」 ----
  'c1': {
    type: 'choice',
    prompt: '怎么接「看了都脸红」',
    options: [
      { key: 'A', label: '那就从最脸红的那条开始。', next: 'a1', flag: 'painWorst' },
      { key: 'B', label: '这些想法不用不好意思，几乎人人都有。', next: 'b1', flag: 'painNormalize' },
      { key: 'C', label: '你自己觉得哪条最不像你？', next: 'd1', flag: 'painNotMe' },
    ],
  },
  'a1': { type: 'say', who: '陈静', text: '……行。', next: 'a2' },
  'a2': {
    type: 'say', note: { kind: 'supervision' },
    text: '你没有评价那些想法，只是请她挑一条最重的。她挑得出来——说明她已经看过很多遍了。',
    next: 'diary1',
  },

  'b1': { type: 'say', who: '陈静', text: '真的？', next: 'b2' },
  'b2': { type: 'say', who: '陈静', text: '我以为就我这样。', next: 'b3' },
  'b3': {
    type: 'say', note: { kind: 'supervision' },
    text: '「我以为就我这样」——她在自我污名上松了一下。但她还没往具体内容走，下一步要把话拉回本子。',
    next: 'diary1',
  },

  'd1': { type: 'say', who: '陈静', text: '哪条都不像我。', next: 'd2' },
  'd2': { type: 'say', who: '陈静', text: '我以前不是这样的人。', next: 'd3' },
  'd3': {
    type: 'say', note: { kind: 'supervision' },
    text: '她在说「这不像我」。这是自我认同被动摇的信号，值得记下来，但今天先看本子。',
    next: 'diary1',
  },

  // ---- 情绪日记 ----
  'diary1': {
    type: 'diary',
    title: '情绪日记 · 陈静的本子',
    hint: '点开看看她记了什么',
    entries: [
      {
        id: 'mon', day: '周一',
        lines: ['拖地拖到一半，腰沉。坐下歇。', '才拖了一半就这样，我算是废了。'],
        note: '「才……就这样」加上「我算是废了」——从一个动作推到对整个人的判决。',
      },
      {
        id: 'wed', day: '周三',
        lines: ['他下班回来看我靠着，问要不要去医院。', '去也没用，查不出来。我这辈子就这样了。'],
        note: '「这辈子」是灾难化的典型时间跨度：把今天下午的状态说成了余生。',
      },
      {
        id: 'fri', day: '周五',
        lines: ['孩子让我陪他去楼下打球。我说妈妈腰疼。', '他说「你老是腰疼」。'],
        note: '孩子那句话没有恶意，但她记下来了。她怕的正是这个——被当成老在说疼的人。',
      },
    ],
    next: 'e1',
  },

  // ---- 灾难化 ----
  'e1': {
    type: 'say', who: '咨询师',
    text: '周三这条。当时你靠着，具体是什么感觉？',
    next: 'e2',
  },
  'e2': { type: 'say', who: '陈静', text: '就是沉，发紧。不算最疼的时候。', next: 'e3' },
  'e3': {
    type: 'say', who: '咨询师',
    text: '那从「发紧」到「这辈子就这样了」，中间隔了几分钟？',
    next: 'e4',
  },
  'e4': { type: 'say', who: '陈静', text: '……没隔。', next: 'e5' },
  'e5': { type: 'say', who: '陈静', text: '当时就那么想的。', next: 'e6' },
  'e6': {
    type: 'say', who: '咨询师',
    text: '我不是说你想错了。我是说，那句话跑得太快，快到替你把这辈子定了。',
    next: 'e7',
  },
  'e7': { type: 'say', who: '陈静', text: '（笑了一下）那我还能怎么想？', next: 'card_cat' },
  'card_cat': {
    type: 'card', kind: 'science',
    title: '从「今天发紧」到「这辈子就这样了」',
    lines: [
      '这个跳跃叫灾难化：对痛的过度负面的想法，和反复反刍式的反应。',
      '研究里，灾难化被反复发现与更差的躯体功能和社会心理功能相关，',
      '而且这种关联在统计上控制了疼痛强度之后依然存在。',
      '也就是说：痛有多痛是一回事，灾难化让痛占多大地方是另一回事。',
      'CBT 处理疼痛时，识别并修正这类想法通常是核心成分之一。',
    ],
    footer: '依据：第 14 章 · Psychological Factors / Cognitive Behavior Therapy（Sullivan et al., 1995, 2001）',
    next: 'e8',
  },
  'e8': {
    type: 'say', who: '咨询师',
    text: '所以我不打算让你「别这么想」。我想跟你一起看看，那句话有没有别的可能。',
    next: 'e9',
  },
  'e9': { type: 'say', who: '陈静', text: '比如？', next: 'f1' },
  'f1': {
    type: 'say', who: '咨询师',
    text: '比如，「我今天拖了一半就撑不住」和「我这辈子就这样了」，是不是同一件事？',
    next: 'f2',
  },
  'f2': { type: 'say', who: '陈静', text: '（停了很久）……不是。', next: 'f3' },
  'f3': { type: 'say', who: '陈静', text: '今天我是没睡好。孩子昨天发烧。', next: 'f4' },
  'f4': {
    type: 'say', note: { kind: 'supervision' },
    text: '她自己找到了另一个解释，而且是真的。这一步不能你替她说——你替她说，就变成你在安慰她。',
    next: 'g1',
  },

  // ---- 活动节奏：一好就猛干 ----
  'g1': {
    type: 'say', who: '咨询师',
    text: '还有一件事想问你。有没有那种日子——感觉还行，就把攒的活全干了？',
    next: 'g2',
  },
  'g2': { type: 'say', who: '陈静', text: '有。', next: 'g3' },
  'g3': {
    type: 'say', who: '陈静',
    text: '上周日。他带孩子出去了，我一个人在家，把两个屋都擦了，还把窗帘拆了。',
    next: 'g4',
  },
  'g4': { type: 'say', who: '陈静', text: '干完挺痛快。', next: 'g5' },
  'g5': { type: 'say', who: '咨询师', text: '然后呢？', next: 'g6' },
  'g6': { type: 'say', who: '陈静', text: '然后躺了两天。', next: 'g7' },
  'g7': { type: 'say', who: '陈静', text: '这三天什么都没干。', next: 'card_pace' },
  'card_pace': {
    type: 'card', kind: 'science',
    title: '一好就猛干，然后躺三天',
    lines: [
      '这个忽高忽低的模式，在疼痛治疗里有名字，叫「活动过量—活动不足」的循环。',
      'CBT 里有一项专门针对它的技术：活动节奏（activity pacing）。',
      '目标不是让你少干活，而是把活摊开——别让「今天感觉好」变成明天的代价。',
      '这也是 CBT 处理疼痛的常规成分之一，通常配合放松训练、行为激活和目标设定。',
    ],
    footer: '依据：第 14 章 · Cognitive Behavior Therapy（activity pacing；Ehde et al., 2014）',
    next: 'g8',
  },
  'g8': {
    type: 'say', who: '陈静',
    text: '那我不趁好的时候干，什么时候干？',
    next: 'g9',
  },
  'g9': {
    type: 'say', who: '咨询师',
    text: '问得好。这正是要一起算的账——不是让你少干，是让你别一次赔进去三天。',
    next: 'g10',
  },
  'g10': {
    type: 'say', note: { kind: 'supervision' },
    text: '她的反问是对的：对一个必须做家务的人说「少干点」没有用。你把问题换成了「怎么分配」，她才可能配合。',
    next: 'h1',
  },

  // ---- 配偶的反应方式 ----
  'h1': {
    type: 'say', who: '咨询师',
    text: '上次你说，你还没说要干嘛，他就说「你别动，我来」。',
    next: 'h2',
  },
  'h2': { type: 'say', who: '陈静', text: '嗯。', next: 'h3' },
  'h3': {
    type: 'say', who: '咨询师',
    text: '我想跟你讲一个研究里的分类，可能有点扎人，但你听听像不像你家。',
    next: 'h4',
  },
  'h4': {
    type: 'say', who: '咨询师',
    text: '家里人看见你疼，一般有三种反应。',
    next: 'h5',
  },
  'h5': {
    type: 'say', who: '咨询师',
    text: '一种是嫌你烦、觉得你在夸大。一种是自己上手全替你干，特别周到。还有一种是拉你一块做点别的，把注意力带开。',
    next: 'card_solicitous',
  },
  'card_solicitous': {
    type: 'card', kind: 'science',
    title: '照顾得太周到，为什么反而不好',
    lines: [
      '痛行为会受身边人的反应影响，这是疼痛心理学里很早就被提出的看法。',
      '把家人的反应分三类：惩罚式（不高兴、嫌烦）、过度照顾式（什么都替你干）、分散注意式（拉你一起做事）。',
      '研究一般认为，分散注意式的回应最能减少失能和抑郁情绪。',
      '而过度照顾式的回应会不知不觉地强化疼痛和疼痛行为，让这些表现出现得更多。',
      '关键在于：过度照顾不是「坏」，它常常是爱，只是它的结果和它想达到的相反。',
    ],
    footer: '依据：第 14 章 · Psychological Factors（Fordyce, 1976；Kerns et al., 1985；McCracken, 2005）',
    next: 'h6',
  },
  'h6': { type: 'say', who: '陈静', text: '（很轻）……第二种。', next: 'h7' },
  'h7': {
    type: 'say', who: '陈静',
    text: '那你意思是他对我好，害了我？',
    next: 'c2',
  },

  // ---- 选项 2：她听出了「是他害了我」 ----
  'c2': {
    type: 'choice',
    prompt: '她问「是他害了我」',
    options: [
      { key: 'A', label: '不是害。是他做的这件事，结果和你想的不一样。他也被这个循环困着。', next: 'i1', flag: 'painNotBlame' },
      { key: 'B', label: '不能这么说，但客观上确实有这个效果。', next: 'j1', flag: 'painObjective' },
      { key: 'C', label: '倒也不能怪他，你也没跟他讲过你真实想法。', next: 'k1', flag: 'painBlameHer' },
    ],
  },
  'i1': { type: 'say', who: '陈静', text: '他也被困着？', next: 'i2' },
  'i2': {
    type: 'say', who: '咨询师',
    text: '他看着你疼了三年，越帮越多，你还是没好。他也没别的办法了。',
    next: 'i3',
  },
  'i3': {
    type: 'say', who: '陈静',
    text: '（很久）他前几天说，是不是他没用。',
    next: 'i4',
  },
  'i4': {
    type: 'say', note: { kind: 'supervision' },
    text: '你把「怪他」换成了「我们俩都在这个循环里」。所以她立刻想起了他说过的那句话——这是个能一起往前走的落点。',
    next: 'l1',
  },

  'j1': { type: 'say', who: '陈静', text: '……', next: 'j2' },
  'j2': {
    type: 'say', who: '陈静',
    text: '那我就更没法跟他说了。',
    next: 'j3',
  },
  'j3': {
    type: 'say', note: { kind: 'supervision' },
    text: '你说的是事实，但「客观上」三个字让这件事变成了一份判决书。她接下来只想怎么瞒着他。',
    next: 'l1',
  },

  'k1': { type: 'say', who: '陈静', text: '（很快）我怪他？', next: 'k2' },
  'k2': { type: 'say', who: '陈静', text: '我从来没怪他。', next: 'k3' },
  'k3': { type: 'say', who: '陈静', text: '是我不对。我什么也没说。', next: 'k4' },
  'k4': {
    type: 'say', note: { kind: 'supervision' },
    text: '你把她推到了自责那一头。她本来就习惯这样，你这一句正好合上了她的旧剧本。',
    next: 'l1',
  },

  'l1': {
    type: 'say', who: '咨询师',
    text: '下一节，我想请你爱人一起来。不是让他来挨批评，是有些账得两个人一起算。',
    next: 'l2',
  },
  'l2': { type: 'say', who: '陈静', text: '他能来。', next: 'l3' },
  'l3': { type: 'say', who: '陈静', text: '他一直想来。是我没让。', next: 'end1' },

  'end1': {
    type: 'result',
    title: '第 2 节 · 完',
    lead: '灾难化不是「想太多」，它和失能之间的关系，在控制了疼痛强度之后依然存在。',
    button: '看这一节的成绩单',
    next: 'end2',
  },
  'end2': {
    type: 'card', kind: 'resource',
    title: '如果你或你身边的人正在经历这些',
    lines: [
      '全国心理援助热线：12356（国家卫健委统一号码）',
      '北京心理危机研究与干预中心：010-82951332',
      '如果存在立即的危险，请拨打 120，或直接前往最近的急诊。',
    ],
    footer: '这不是「小题大做」。打这个电话的人，每天都在打。',
    button: '知道了',
    next: 's3/n1',
  },
};

// ---------------------------------------------------------------------------
// 第 3 节：把活摊开
// ---------------------------------------------------------------------------
const PAIN_S3 = {
  'n1': {
    type: 'say', who: '旁白', act: 3, warmth: 3,
    text: '她丈夫来了。个子不高，进来先看她的腰，再看椅子。',
    next: 'n2',
  },
  'n2': {
    type: 'say', who: '陈静夫',
    text: '大夫，她这个到底能不能好？',
    next: 'n3',
  },
  'n3': {
    type: 'say', who: '陈静夫',
    text: '我查了很多。有的说能，有的说不能。',
    next: 'c1',
  },

  // ---- 选项 1：他一进门就问「能不能好」 ----
  'c1': {
    type: 'choice',
    prompt: '怎么回答「能不能好」',
    options: [
      { key: 'A', label: '我不敢给你保证。但今天要谈的不是好没好，是这日子怎么过。', next: 'a1', flag: 'painNoPromise' },
      { key: 'B', label: '能好，只要坚持治疗和锻炼。', next: 'b1', flag: 'painPromise' },
      { key: 'C', label: '这个问题我们放一放，先听你爱人说。', next: 'd1', flag: 'painDefer' },
    ],
  },
  'a1': { type: 'say', who: '陈静夫', text: '……', next: 'a2' },
  'a2': { type: 'say', who: '陈静夫', text: '我就是想听个准话。', next: 'a3' },
  'a3': {
    type: 'say', who: '咨询师',
    text: '准话我给不了。慢性疼痛里，没人能保证。但有一件事我能说准：你今天做的事，会让接下来三年不一样。',
    next: 'a4',
  },
  'a4': { type: 'say', who: '陈静夫', text: '（点头）那你说。', next: 'a5' },
  'a5': {
    type: 'say', note: { kind: 'supervision' },
    text: '你没有给假保证，也没有把他推开。他把「要个准话」换成了「那你说」——这是能往下谈的位置。',
    next: 'e1',
  },

  'b1': { type: 'say', who: '陈静夫', text: '真的？', next: 'b2' },
  'b2': {
    type: 'say', who: '陈静',
    text: '（看着他，没说话）',
    next: 'b3',
  },
  'b3': {
    type: 'say', note: { kind: 'supervision' },
    text: '你给的保证会在几个月后失效，那时候他会觉得连医生都在骗他。而且你爱人比谁都清楚那句话不是真的。',
    next: 'e1',
  },

  'd1': { type: 'say', who: '陈静夫', text: '（有点急）她跟我说不出口。', next: 'd2' },
  'd2': { type: 'say', who: '陈静夫', text: '她什么都憋着。', next: 'd3' },
  'd3': {
    type: 'say', note: { kind: 'supervision' },
    text: '你挡了他一句，他立刻替她说起话来。这不是错，只是他又一次替她做了事——正好是今天要谈的那件事。',
    next: 'e1',
  },

  // ---- 把日程摊开 ----
  'e1': {
    type: 'say', who: '咨询师',
    text: '咱今天不看片子，看一周。谁在什么时候做什么。',
    next: 'e2',
  },
  'e2': { type: 'say', who: '咨询师', text: '从周日那天开始，你说说。', next: 'e3' },
  'e3': {
    type: 'say', who: '陈静',
    text: '周日我一个人在家，把两个屋擦了，窗帘也拆了。',
    next: 'e4',
  },
  'e4': { type: 'say', who: '陈静夫', text: '窗帘？！', next: 'e5' },
  'e5': {
    type: 'say', who: '陈静夫',
    text: '我回来看到窗帘在地上，我说你怎么不叫我。',
    next: 'e6',
  },
  'e6': {
    type: 'say', who: '陈静',
    text: '叫你回来一趟，就为了拆个窗帘？',
    next: 'e7',
  },
  'e7': { type: 'say', who: '陈静夫', text: '那怎么了。', next: 'e8' },
  'e8': { type: 'say', who: '陈静', text: '（没接话）', next: 'e9' },
  'e9': {
    type: 'say', note: { kind: 'supervision' },
    text: '「叫你回来一趟，就为了拆个窗帘」——这句话里有她的算账方式：请人帮忙是要还的。这一点值得后面单独谈。',
    next: 'f1',
  },

  // ---- 一起算账：分散注意式回应 ----
  'f1': {
    type: 'say', who: '咨询师',
    text: '上次我跟你爱人讲过一个分类。今天想请你配合做个实验。',
    next: 'f2',
  },
  'f2': {
    type: 'say', who: '咨询师',
    text: '她说腰沉的时候，你一般怎么说？',
    next: 'f3',
  },
  'f3': { type: 'say', who: '陈静夫', text: '我就说你别动，我来。', next: 'f4' },
  'f4': { type: 'say', who: '陈静夫', text: '或者问她要不要去医院。', next: 'f5' },
  'f5': {
    type: 'say', who: '咨询师',
    text: '还有第三种。比如说——「那你坐着，把那件衣服叠了行不行」。',
    next: 'f6',
  },
  'f6': { type: 'say', who: '陈静夫', text: '（愣）这也算帮忙？', next: 'f7' },
  'f7': {
    type: 'say', who: '咨询师',
    text: '算。研究里管这叫「分散注意式」的回应，一般认为它对减少失能和情绪低落最有利。它做的事是：把她留在生活里，而不是留在病里。',
    next: 'card_distract',
  },
  'card_distract': {
    type: 'card', kind: 'science',
    title: '一句话的差别',
    lines: [
      '「你别动，我来」——她少做一件，也多一次「我不行」。',
      '「要不要去医院」——问题被推回给医疗系统，答案通常是「查不出来」。',
      '「那你坐着，把那件衣服叠了」——她还在参与，还是这个家的人。',
      '三种都是关心。区别在于前两种把她固定在病人位置上，第三种没有。',
    ],
    footer: '依据：第 14 章 · Psychological Factors（distracting responses；McCracken, 2005）',
    next: 'f8',
  },
  'f8': {
    type: 'say', who: '陈静夫',
    text: '（想了一会儿）那她要是真疼呢？',
    next: 'f9',
  },
  'f9': {
    type: 'say', who: '咨询师',
    text: '真疼的时候当然要停。这不是让你装看不见。是别把她所有能做的事，都提前拿走。',
    next: 'g1',
  },

  // ---- 定目标：从她的生活出发 ----
  'g1': {
    type: 'say', who: '咨询师',
    text: '咱定这周的事。不是「以后要怎么样」，是这七天。',
    next: 'g2',
  },
  'g2': {
    type: 'say', who: '咨询师',
    text: '陈静，你说一件你想做、但现在不做的。',
    next: 'c2',
  },

  // ---- 选项 2：目标从哪来 ----
  'c2': {
    type: 'choice',
    prompt: '目标从哪来',
    options: [
      { key: 'A', label: '不着急。你想想，有哪件事是你想自己做的。', next: 'h1', flag: 'painHerGoal' },
      { key: 'B', label: '我建议先从锻炼开始，每天走二十分钟，对腰好。', next: 'i1', flag: 'painTherapistGoal' },
      { key: 'C', label: '先把家务分一分，重活都交给你爱人。', next: 'j1', flag: 'painAssignChores' },
    ],
  },
  'h1': { type: 'say', who: '陈静', text: '……', next: 'h2' },
  'h2': {
    type: 'say', who: '陈静',
    text: '孩子星期六有亲子活动。上次我没去。',
    next: 'h3',
  },
  'h3': { type: 'say', who: '陈静', text: '一站就是一下午。我不敢。', next: 'h4' },
  'h4': {
    type: 'say', who: '咨询师',
    text: '那这次咱不想「能不能站一下午」。想中间怎么办。',
    next: 'h5',
  },
  'h5': {
    type: 'say', who: '陈静',
    text: '（想）……那边有长椅。我可以坐一会儿再回去。',
    next: 'h6',
  },
  'h6': {
    type: 'say', who: '咨询师',
    text: '那这件事就定了：去，中间坐两回。',
    next: 'h7',
  },
  'h7': { type: 'say', who: '陈静夫', text: '我陪你。', next: 'h8' },
  'h8': { type: 'say', who: '陈静', text: '（点头）', next: 'h9' },
  'h9': {
    type: 'say', note: { kind: 'supervision' },
    text: '目标是她自己提的，而且是她真正在意的事（孩子）。你没有把它换成「锻炼二十分钟」——那虽然对腰好，但不是她的目标。',
    next: 'k1',
  },

  'i1': { type: 'say', who: '陈静', text: '二十分钟？', next: 'i2' },
  'i2': { type: 'say', who: '陈静', text: '我走十分钟腰就沉。', next: 'i3' },
  'i3': { type: 'say', who: '陈静夫', text: '那走五分钟？', next: 'i4' },
  'i4': {
    type: 'say', note: { kind: 'supervision' },
    text: '你给的目标被家属打了折——因为那不是她想要的。目标不是从她嘴里出来的，这个回合谁都没往前走。',
    next: 'k1',
  },

  'j1': { type: 'say', who: '陈静', text: '（很快）不用。', next: 'j2' },
  'j2': { type: 'say', who: '陈静', text: '他上班也累。', next: 'j3' },
  'j3': { type: 'say', who: '陈静夫', text: '我不累。', next: 'j4' },
  'j4': {
    type: 'say', note: { kind: 'supervision' },
    text: '你替他们分了工，结果两个人当场对上了。重活归谁不是你能定的——那是他们家要自己谈的事。',
    next: 'k1',
  },

  // ---- 正念：目标不是消除疼痛 ----
  'k1': {
    type: 'say', who: '咨询师',
    text: '还有一件事，我想说清楚，因为很多人会误解。',
    next: 'k2',
  },
  'k2': {
    type: 'say', who: '咨询师',
    text: '现在常提的正念类方法，目标不是把痛消掉。',
    next: 'k3',
  },
  'k3': { type: 'say', who: '陈静', text: '那练它干嘛？', next: 'k4' },
  'k4': {
    type: 'say', who: '咨询师',
    text: '它练的是另一件事：痛来的时候，你能不能不立刻跟着它走。',
    next: 'card_mind',
  },
  'card_mind': {
    type: 'card', kind: 'science',
    title: '正念练的到底是什么',
    lines: [
      '以正念为基础的方法，核心是正念冥想：把注意力放在一个对象上（常常是呼吸），',
      '对出现的感受、情绪、想法保持不评判的觉察和接纳。',
      '有一项元分析报告：这类方法能减轻疼痛和抑郁症状，并改善生活质量。',
      '但正念认知疗法（MBCT）明确说过，它的目标不是去改变想法、情绪或行为本身，',
      '而只是留意当下的体验——在这个觉察里，才有机会换一种回应方式。',
      '所以「练了还是会疼」不等于没效果；它本来就不是冲着消除疼痛去的。',
    ],
    footer: '依据：第 14 章 · Mindfulness-Based Interventions（Hilton et al., 2017；Day, 2017）',
    next: 'k5',
  },
  'k5': { type: 'say', who: '陈静', text: '（想了会儿）那我不用非得跟它拼。', next: 'k6' },
  'k6': { type: 'say', who: '咨询师', text: '对。这是今天另一件事。', next: 'l1' },

  // ---- 收束 ----
  'l1': {
    type: 'say', who: '咨询师',
    text: '今天到这儿。这周两件事：周六去活动，中间坐两回；他试着用第三种说法。',
    next: 'l2',
  },
  'l2': { type: 'say', who: '陈静夫', text: '（掏出手机记）第三种说法……', next: 'l3' },
  'l3': { type: 'say', who: '陈静', text: '（看着他记，没说话）', next: 'l4' },
  'l4': { type: 'say', who: '陈静夫', text: '大夫，我问一句。', next: 'l5' },
  'l5': { type: 'say', who: '陈静夫', text: '我是不是这三年做错了？', next: 'l6' },
  'l6': {
    type: 'say', who: '咨询师',
    text: '你做的事，是想让她好。只是这个办法，把她越推越靠边。',
    next: 'l7',
  },
  'l7': {
    type: 'say', who: '咨询师',
    text: '这三年不是谁的错。但从今天起，可以换一个做法。',
    next: 'l8',
  },
  'l8': { type: 'say', who: '陈静', text: '（伸手碰了一下他的胳膊）', next: 'end1' },

  'end1': {
    type: 'say', who: '旁白',
    text: '（出门的时候她没扶腰。走了几步才想起来，又把手放上去——自己也愣了一下。）',
    next: 'end/1',
  },
};

// ---------------------------------------------------------------------------
// 终章
// ---------------------------------------------------------------------------
const PAIN_END = {
  '1': {
    type: 'result',
    title: '故事线三 · 完',
    lead: '心理干预的目标不是把痛消掉。是让她重新参与自己的生活，并且相信这件事值得做。',
    button: '看这一节的成绩单',
    next: '2',
  },
  '2': {
    type: 'card', kind: 'resource',
    title: '如果你或你身边的人正在经历这些',
    lines: [
      '全国心理援助热线：12356（国家卫健委统一号码）',
      '北京心理危机研究与干预中心：010-82951332',
      '如果存在立即的危险，请拨打 120，或直接前往最近的急诊。',
    ],
    footer: '这不是「小题大做」。打这个电话的人，每天都在打。',
    button: '回标题页',
    ending: true,
    next: null,
  },
};

XLZX.storyPain = {
  id: 'pain',
  title: '慢性疼痛',
  numeral: '三',
  lead: '看不见的痛、灾难化思维，和照顾得太周到的家人',
  client: {
    name: '陈静',
    line1: '38 岁 · 女',
    line2: '慢性下背痛 · 三年',
    line3: '影像学检查未见明确病灶',
  },
  // 陈静既没有轮椅也没有拐，随身的是她自己的包
  clientArt: {
    prop: 'BAG', propX: 52, propY: 44,
    body: 'CHENJING', bodyX: 63, bodyY: 33,
  },
  mobility: {
    title: '她的包',
    lines: [
      '包放在脚边，敞着口，露出一个本子和一支笔——就是她记作业的那个本子。',
      '她一直用手压着腰。这个动作已经不需要想了，像别人跷腿一样自然。',
      '三年里她学会了一整套不弯腰的办法：用脚勾、叫别人、绕开。',
    ],
  },
  // 房间箭头标注里唯一要改的一条：转介单在三条线里是同一张纸，
  // 但上面写的人不一样。
  callouts: {
    referral: { name: '转介单', text: '别人对她的判断' },
  },
  sections: [
    { id: 's1', title: '第 1 节', subtitle: '第一次见面', nodes: PAIN_S1 },
    { id: 's2', title: '第 2 节', subtitle: '两周后', nodes: PAIN_S2 },
    { id: 's3', title: '第 3 节', subtitle: '把活摊开', nodes: PAIN_S3 },
  ],
  endingNodes: PAIN_END,
  start: 's1/n1',
  ending: 'end/1',
  end: {
    heading: '故事线三 · 完',
    closing: '她的片子还是那样，腰还是沉。'
      + '不一样的是这周她去了孩子的活动，中间坐了两回；'
      + '她丈夫学会了在她说疼的时候，问一句「那你坐着叠件衣服行不行」。'
      + '疼没有走，日子往前走了一点——这就是这条线上全部的成绩。',
  },
};
