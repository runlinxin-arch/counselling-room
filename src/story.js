// ============================================================================
// 内容数据 · 故事线一：脊髓损伤
// ----------------------------------------------------------------------------
// 全部台词来自 docs/story/故事线1-脊髓损伤.md（剧本草稿 v2 · 日常口语版）。
// 这里只做三件事：拆行、挂跳转、挂科普卡。
// **不改台词**——台词的问题应该在剧本文件里改，改完再同步到这里。
//
// 引擎只认识 say / choice / diary / card / end 五种节点，不认识"脊髓损伤"。
// 加第二条线只需要再写一份同样结构的数据。
// ============================================================================

// 全部挂在同一个命名空间上。产物只有一段脚本，但源码分文件写，
// 用命名空间比靠"变量提升"更稳，顺序也随便调。
var XLZX = (typeof window !== 'undefined' && window.XLZX) || {};
if (typeof window !== 'undefined') window.XLZX = XLZX;

// ---------------------------------------------------------------------------
// 第 1 节
// ---------------------------------------------------------------------------
const SCI_S1 = {
  // ---- 开场 ----
  'n1': {
    type: 'say', who: '旁白', act: 1, warmth: 1,
    text: '他比约定时间早到了十分钟。坐在靠门那把沙发上，轮椅停在手边。',
    next: 'n2',
  },
  'n2': {
    type: 'say', who: '咨询师',
    text: '你好，我是这儿的心理咨询师。今天大概五十分钟，你看行吗？',
    next: 'n3',
  },
  'n3': { type: 'say', who: '林越', text: '嗯。', next: 'c1' },

  // ---- 选项 1：开场白 ----
  'c1': {
    type: 'choice',
    prompt: '先说什么',
    options: [
      { key: 'A', label: '王医生说你这段时间训练不太配合，咱先聊聊这个。', next: 'a1', flag: 'openA' },
      { key: 'B', label: '今天想先认识一下你。你想聊啥，咱就聊啥。', next: 'b1', flag: 'openB' },
      { key: 'C', label: '最近怎么样？', next: 'd1', flag: 'openC' },
    ],
  },
  'a1': { type: 'say', who: '林越', text: '……哦。', next: 'a2' },
  'a2': { type: 'say', who: '林越', text: '他跟你说的？', next: 'a3' },
  'a3': { type: 'say', who: '林越', text: '我也去了啊。就是没笑而已。', next: 'a4' },
  'a4': {
    type: 'say', note: { kind: 'supervision' },
    text: '转介单上「配合度差」是别的判断。你一上来就复述它，他就把你归到「他们」那边去了。',
    next: 'setup1',
  },

  'b1': { type: 'say', who: '林越', text: '都行。', next: 'b2' },
  'b2': { type: 'say', who: '林越', text: '（顿了一下）我也不知道聊啥。', next: 'b3' },
  'b3': {
    type: 'say', note: { kind: 'supervision' },
    text: '他说「不知道聊啥」，不是拒绝，是在等你先开口。这时候别急着把话填满。',
    next: 'setup1',
  },

  'd1': { type: 'say', who: '林越', text: '还行。', next: 'd2' },
  'd2': {
    type: 'say', note: { kind: 'supervision' },
    text: '第一次见面就问「怎么样」，一般只能换回「还行」。他给你的是安全答案。',
    next: 'setup1',
  },

  // ---- 说明设置（必走）----
  'setup1': {
    type: 'say', who: '咨询师',
    text: '那我说一下这儿是怎么弄的。两三分钟，你听完再决定要不要接着聊。',
    next: 'setup2',
  },
  'setup2': { type: 'say', who: '咨询师', text: '一次五十分钟。你说的话我保密。', next: 'setup3' },
  'setup3': {
    type: 'say', who: '咨询师',
    text: '但有个例外。你要是说到想伤害自己或者别人，那我不能瞒着，得做点事——可能是联系你的医生，也可能联系你家里人。真到那一步，我会先跟你说一声，不会背着你弄。',
    next: 'setup4',
  },
  'setup4': {
    type: 'say', who: '咨询师',
    text: '还有，你要是不想回答哪个问题，直接说「这个不聊」就行，不影响的。',
    next: 'c2',
  },
  'c2': {
    type: 'choice',
    prompt: '说完设置之后',
    options: [
      { key: 'A', label: '听明白了吗？', next: 'c2a1' },
      { key: 'B', label: '这里面有哪条，你想再问细点？', next: 'c2b1', flag: 'askedBoundary' },
      { key: 'C', label: '直接往下：那咱说说，最近咋样？', next: 'c2c1' },
    ],
  },
  'c2a1': { type: 'say', who: '林越', text: '嗯。', next: 'c2a2' },
  'c2a2': {
    type: 'say', note: { kind: 'supervision' },
    text: '他答「嗯」，但你不知道他到底听懂没有。',
    next: 'room1',
  },

  'c2b1': { type: 'say', who: '林越', text: '（停了停）那个……「做点事」是啥意思？', next: 'c2b2' },
  'c2b2': { type: 'say', who: '咨询师', text: '看情况。要是有危险，可能得让人过来一趟。', next: 'c2b3' },
  'c2b3': { type: 'say', who: '林越', text: '……告诉我爸妈？', next: 'c2b4' },
  'c2b4': { type: 'say', who: '咨询师', text: '不一定。但不管做啥，我会先跟你说。', next: 'c2b5' },
  'c2b5': { type: 'say', who: '林越', text: '……行。', next: 'c2b6' },
  'c2b6': {
    type: 'say', note: { kind: 'supervision' },
    text: '他问的是边界，说明他听进去了。保密例外讲清楚，是拉近关系的东西，不是扫兴的免责声明。',
    next: 'room1',
  },

  'c2c1': {
    type: 'say', note: { kind: 'supervision' },
    text: '跳过设置直接往下，你还没跟他讲清楚「哪些话我会往外说」。这条以后会回来找你。',
    next: 'room1',
  },

  // ---- 房间可点（自由探索，不推进剧情）----
  'room1': {
    type: 'say', who: '旁白',
    text: '房间里有几样东西带光晕。点一下，会告诉你是干什么用的。',
    allowItems: ['referral', 'tissue', 'clock', 'sofa'],
    hint: '点房间里带光晕的东西',
    next: 'eth1',
  },

  // ---- 伦理抉择：走廊里的王医生 ----
  'eth1': {
    type: 'say', who: '旁白',
    text: '中间休息，你去走廊接水。迎面碰见康复科的王医生。',
    next: 'eth2',
  },
  'eth2': { type: 'say', who: '王医生', text: '哎，你见着他了吧？', next: 'eth3' },
  'eth3': {
    type: 'say', who: '王医生',
    text: '那孩子就是得有人在后面推一把。你跟他说说，让他好好练。你说话他听。',
    next: 'eth4',
  },
  'eth4': {
    type: 'say', who: '旁白',
    text: '（说完拍拍你肩膀，走了）',
    next: 'c3',
  },
  'c3': {
    type: 'choice',
    prompt: '怎么回他',
    options: [
      { key: 'A', label: '行，我下回跟他说说。', next: 'e3a1', flag: 'ethA' },
      { key: 'B', label: '我先看看他自己想干啥，再说。', next: 'e3b1', flag: 'ethB' },
      { key: 'C', label: '他这种情况站不起来的，这么说他更不愿意练。', next: 'e3c1', flag: 'ethC' },
    ],
  },
  'e3a1': {
    type: 'say', note: { kind: 'supervision' },
    text: '你答应了一件做不到、也不该做的事。下回你开口，他听到的会是你，还是「他们」？',
    next: 'crisis1',
  },
  'e3b1': { type: 'say', who: '王医生', text: '……也行。你们有你们的做法。', next: 'e3b2' },
  'e3b2': {
    type: 'say', note: { kind: 'supervision' },
    text: '你没当面驳他，也没替来访者做主。「目标得他自己定」是伦理要求，不是客气话。\n\n【依据：第 7 章 · 尊重人的权利与尊严、忠诚与责任】',
    next: 'crisis1',
  },
  'e3c1': { type: 'say', who: '王医生', text: '（有点尴尬）我知道，我就随口一说。', next: 'e3c2' },
  'e3c2': {
    type: 'say', note: { kind: 'supervision' },
    text: '医学上你说得对，但这句话里没有来访者。而且他能不能站起来，不该由你在走廊里替他定调。\n\n【依据：第 7 章 · 尊重人的权利与尊严、忠诚与责任】',
    next: 'crisis1',
  },

  // ---- 危机筛查（可以不问）----
  'crisis1': {
    type: 'say', who: '咨询师',
    text: '还有个事，问得有点直接。你要是不想答，可以不答。',
    next: 'c4',
  },
  'c4': {
    type: 'choice',
    prompt: '问不问',
    options: [
      { key: 'A', label: '最近有没有觉得，活着挺没意思的？或者不想醒过来？', next: 'cr1', flag: 'screened' },
      { key: 'B', label: '不问。今天第一次见，先不碰这个。', next: 'cn1', flag: 'screenSkipped' },
    ],
  },
  'cr1': { type: 'say', who: '旁白', text: '（他没说话，过了会儿）', next: 'cr2' },
  'cr2': { type: 'say', who: '林越', text: '……有吧。', next: 'cr3' },
  'cr3': { type: 'say', who: '林越', text: '也不是说要干啥。', next: 'cr4' },
  'cr4': {
    type: 'say', who: '林越',
    text: '就是晚上躺那儿，有时候想，要是睡过去不醒了，好像也行。',
    next: 'cr5',
  },
  'cr5': { type: 'say', who: '咨询师', text: '谢谢你跟我说这个。', next: 'cr6' },
  'cr6': {
    type: 'say', who: '咨询师',
    text: '我想多问一句——是觉得累，还是不想活了？',
    next: 'crisisBranch',
  },

  'cn1': {
    type: 'say', who: '林越', text: '（把轮椅往前挪了挪）那今天先这样？', next: 'cn2',
  },
  'cn2': {
    type: 'say', note: { kind: 'supervision' },
    text: '第一次见不问，可以。\n\n但记住一件事：脊髓损伤的人里，抑郁很容易被漏掉。而「睡过去不醒」这种念头，不会自己冒出来。下一次，得问。',
    effect: 'markScreenMissed',
    next: 'hw1',
  },

  // ---- 危机关怀分支（写死，不给"再想想"的机会）----
  'crisisBranch': {
    type: 'say', who: '咨询师', text: '谢谢你跟我说这个。能说出来，不容易。',
    effect: 'crisis',
    next: 'cb2',
  },
  'cb2': { type: 'say', who: '咨询师', text: '我想跟你多聊几句，行吗？', next: 'cb3' },
  'cb3': {
    type: 'say', who: '咨询师',
    text: '你刚说「睡过去不醒也挺省事」。我想分清楚一件事——是觉得活着太累了，还是不想活了？',
    next: 'cb4',
  },
  'cb4': { type: 'say', who: '林越', text: '……累。', next: 'cb5' },
  'cb5': { type: 'say', who: '林越', text: '也不是想死。', next: 'cb6' },
  'cb6': {
    type: 'say', who: '林越',
    text: '就是每天醒过来，发现还是这样。然后又要过一天。',
    next: 'cb7',
  },
  'cb7': { type: 'say', who: '咨询师', text: '我明白了。', next: 'cb8' },
  'cb8': {
    type: 'say', who: '咨询师',
    text: '这种累是真的。我不打算劝你「会好的」。',
    next: 'cb9',
  },
  'cb9': {
    type: 'say', who: '咨询师',
    text: '但有三件事，我现在得跟你说清楚。',
    next: 'cb10',
  },
  'cb10': {
    type: 'say', who: '咨询师',
    text: '第一，这种念头要是变强了，或者你开始想具体怎么做，一定要马上告诉人。告诉我、告诉王医生，或者打下面这个电话。这不是「麻烦别人」，这是你现在该做的事。',
    next: 'cb11',
  },
  'cb11': {
    type: 'say', who: '咨询师',
    text: '第二，你不是一个人。脊髓损伤之后有这种感受的人不少。这跟你「够不够坚强」没关系。',
    next: 'cb12',
  },
  'cb12': {
    type: 'say', who: '咨询师',
    text: '第三，接下来这段时间，我想跟你见得勤一点。',
    next: 'cbCard',
  },
  'cbCard': {
    type: 'card', kind: 'resource',
    title: '如果你或你身边的人正在经历这些',
    lines: [
      '全国心理援助热线：12356（国家卫健委统一号码）',
      '北京心理危机研究与干预中心：010-82951332',
      '如果存在立即的危险，请拨打 120，或直接前往最近的急诊。',
    ],
    footer: '这不是「小题大做」。打这个电话的人，每天都在打。',
    button: '知道了',
    next: 'hw1',
  },

  // ---- 留作业 ----
  'hw1': {
    type: 'say', who: '咨询师',
    text: '今天先到这儿。给你留个小东西，不用给谁看。',
    next: 'hw2',
  },
  'hw2': {
    type: 'say', who: '咨询师',
    text: '记一下每天啥时候最难受。一句话就行，写手机上。',
    next: 'hw3',
  },
  'hw3': { type: 'say', who: '林越', text: '记这干啥？', next: 'hw4' },
  'hw4': {
    type: 'say', who: '咨询师',
    text: '下回带来，咱一块看看。我想知道啥时候、因为啥事，你最不好受。',
    next: 'hw5',
  },
  'hw5': {
    type: 'say', who: '林越', text: '……行吧。',
    effect: 'unlockDiary',
    next: 's1end',
  },
  's1end': {
    type: 'say', who: '旁白',
    text: '他把手机揣回兜里，轮椅转到门口，停了一下才出去。',
    next: '@s2/n1',
  },
};

// ---------------------------------------------------------------------------
// 第 2 节
// ---------------------------------------------------------------------------
const SCI_S2 = {
  'n1': {
    type: 'say', who: '旁白', act: 2, warmth: 2,
    text: '一周后，同一间房。他从兜里掏出手机。',
    next: 'n2',
  },
  'n2': { type: 'say', who: '林越', text: '……记了。', next: 'n3' },
  'n3': { type: 'say', who: '林越', text: '没啥内容。', next: 'n4' },
  'n4': {
    type: 'say', who: '旁白',
    text: '手机递过来，备忘录里四条。',
    next: 'diary',
  },

  // ---- 情绪日记面板 ----
  'diary': {
    type: 'diary',
    title: '情绪日记 · 林越的手机备忘录',
    hint: '点开看看他都记了什么',
    entries: [
      {
        id: 'mon', day: '周一',
        lines: ['去楼下买水。走到单元门口，看见台阶。', '算了。', '反正也没啥意思。'],
        note: '这条里有第一句「自动化思维」。',
      },
      {
        id: 'wed', day: '周三',
        lines: ['我妈又哭了。以为我没看见。', '都怪我。'],
        note: '「都怪我」——典型的个人化。',
      },
      {
        id: 'fri', day: '周五',
        lines: ['老张问去不去看球。', '没回。', '去了也是累赘。他就是客气一下。'],
        note: '「他就是客气一下」——读心术。',
      },
      {
        id: 'sun', day: '周日',
        lines: ['今天还行。', '一天没出门。', '挺好。'],
        note: '这条最要紧。',
      },
    ],
    next: 'c5',
  },
  'c5': {
    type: 'choice',
    prompt: '先谈哪一条',
    hint: '四条都能谈，谈出来的东西不一样',
    options: [
      { key: 'A', label: '周一 · 「反正也没啥意思」', next: 'dm1' },
      { key: 'B', label: '周三 · 「都怪我」', next: 'dw1' },
      { key: 'C', label: '周五 · 「他就是客气一下」', next: 'df1' },
      { key: 'D', label: '周日 · 「一天没出门，挺好」', next: 'ds1' },
    ],
  },

  'dm1': {
    type: 'say', who: '咨询师',
    text: '周一这条。你说「反正也没啥意思」。',
    next: 'dm2',
  },
  'dm2': {
    type: 'say', who: '咨询师',
    text: '这句是你在门口想的，还是出门前就这么想的？',
    next: 'dm3',
  },
  'dm3': { type: 'say', who: '林越', text: '……啥意思？', next: 'dm4' },
  'dm4': {
    type: 'say', who: '咨询师',
    text: '就是，你走到门口之前，知道「没意思」吗？还是看见台阶那一下，才冒出来的？',
    next: 'dm5',
  },
  'dm5': { type: 'say', who: '林越', text: '（想了想）……看见台阶的时候吧。', next: 'dm6' },
  'dm6': { type: 'say', who: '咨询师', text: '嗯。', next: 'dm7' },
  'dm7': {
    type: 'say', who: '咨询师',
    text: '那这句是那会儿冒出来的，不是你查证过的事。',
    next: 'dm8',
  },
  'dm8': { type: 'say', who: '林越', text: '那不一个意思吗。', next: 'dm9' },
  'dm9': { type: 'say', who: '咨询师', text: '不太一样。', next: 'dm10' },
  'dm10': { type: 'say', who: '林越', text: '……', next: 'dm11' },
  'dm11': {
    type: 'say', note: { kind: 'supervision' },
    text: '这就是识别自动化思维。关键不是告诉他「你想错了」，是让他自己看见「这是个念头，不是判决」。',
    next: 'card3',
  },

  'dw1': {
    type: 'say', who: '咨询师',
    text: '周三。「我妈哭了，都怪我」。',
    next: 'dw2',
  },
  'dw2': {
    type: 'say', who: '咨询师',
    text: '这个「都」，是你确定的，还是猜的？',
    next: 'dw3',
  },
  'dw3': { type: 'say', who: '林越', text: '她哭我就知道。', next: 'dw4' },
  'dw4': {
    type: 'say', who: '咨询师',
    text: '嗯。那有没有可能是，她自己难受？看着你遭这个罪，她过不去。',
    next: 'dw5',
  },
  'dw5': { type: 'say', who: '林越', text: '（没说话）', next: 'dw6' },
  'dw6': { type: 'say', who: '林越', text: '那不还是因为我。', next: 'dw7' },
  'dw7': { type: 'say', who: '咨询师', text: '是因为这场事故。', next: 'dw8' },
  'dw8': { type: 'say', who: '咨询师', text: '不是因为你。', next: 'dw9' },
  'dw9': { type: 'say', who: '林越', text: '……', next: 'dw10' },
  'dw10': {
    type: 'say', note: { kind: 'supervision' },
    text: '这是个人化——把外面的事的因果揽到自己身上。注意你没说「你想多了」，你只是把「事故」和「你」分开了。',
    next: 'card3',
  },

  'df1': {
    type: 'say', who: '咨询师',
    text: '周五。老张约你看球，你没回。',
    next: 'df2',
  },
  'df2': {
    type: 'say', who: '咨询师',
    text: '你说「他就是客气一下」。这是他说的，还是你猜的？',
    next: 'df3',
  },
  'df3': { type: 'say', who: '林越', text: '……猜的吧。', next: 'df4' },
  'df4': { type: 'say', who: '林越', text: '还能咋的。', next: 'df5' },
  'df5': { type: 'say', who: '咨询师', text: '那就是不知道。', next: 'df6' },
  'df6': { type: 'say', who: '林越', text: '（笑了一下）你这不废话吗。', next: 'df7' },
  'df7': { type: 'say', who: '咨询师', text: '是废话。', next: 'df8' },
  'df8': {
    type: 'say', who: '咨询师',
    text: '但你现在是拿一个猜的东西，当不回消息的理由了。',
    next: 'df9',
  },
  'df9': {
    type: 'say', note: { kind: 'supervision' },
    text: '这是读心术——假定自己知道别人怎么想。你没让他「往好处想」，只是把「不知道」还回给「不知道」。',
    next: 'card3',
  },

  'ds1': {
    type: 'say', who: '咨询师',
    text: '周日。「一天没出门，挺好。」',
    next: 'ds2',
  },
  'ds2': {
    type: 'say', who: '咨询师',
    text: '我想问一下，这个「挺好」，是舒服，还是松口气？',
    next: 'ds3',
  },
  'ds3': { type: 'say', who: '林越', text: '（愣住）', next: 'ds4' },
  'ds4': { type: 'say', who: '林越', text: '……啥区别。', next: 'ds5' },
  'ds5': {
    type: 'say', who: '咨询师',
    text: '你今天没出门，是觉得挺自在，还是觉得这天算是躲过去了？',
    next: 'ds6',
  },
  'ds6': { type: 'say', who: '林越', text: '（很久）', next: 'ds7' },
  'ds7': { type: 'say', who: '林越', text: '……躲过去了。', next: 'ds8' },
  'ds8': {
    type: 'say', note: { kind: 'supervision' },
    text: '这是整份日记里最要紧的一条。回避经常伪装成「我还行」。',
    next: 'card3',
  },

  // ---- 科普卡 3 ----
  'card3': {
    type: 'card', kind: 'science',
    title: '脑子里冒出来的那句话',
    lines: [
      '认出它，是认知行为治疗最基础的一步。',
      '它的意思不是「你想错了」，而是：那个让你停下来的结论，往往不是事实，是当时脑子里的一句话。',
      '关于证据，有件事得说实话：CBT 用在脊髓损伤后的抑郁焦虑上，证据等级是中等——只有单项随机对照试验或小样本研究支持。它有用，但不是「最有效的疗法」。',
      '别的方向上，问题解决训练在减轻照护者抑郁上证据更强；动机式访谈对「还在犹豫的人」更合适。',
      '所以：别把 CBT 写成万能药。',
    ],
    footer: '依据：第 5 章 · 表 5.1 证据等级',
    button: '继续',
    next: 'end1',
  },
  'end1': {
    type: 'say', who: '咨询师',
    text: '今天不聊训练，也不聊以后。',
    next: 'end2',
  },
  'end2': {
    type: 'say', who: '咨询师',
    text: '就一件事：下回那个念头冒出来，你看它一眼。不用改，看一眼就行。',
    next: 'end3',
  },
  'end3': { type: 'say', who: '林越', text: '……看一眼。', next: 'end4' },
  'end4': { type: 'say', who: '咨询师', text: '嗯。', next: 'end5' },
  'end5': {
    type: 'say', who: '林越', text: '（推着轮椅到门口）行。',
    next: '@s3/n1',
  },
};

// ---------------------------------------------------------------------------
// 第 3 节
// ---------------------------------------------------------------------------
const SCI_S3 = {
  'n1': {
    type: 'say', who: '旁白', act: 3, warmth: 3,
    text: '第三次见面。他这次坐得离你近了点。',
    next: 'n2',
  },
  'n2': { type: 'say', who: '林越', text: '我想问个事。', next: 'n3' },
  'n3': { type: 'say', who: '林越', text: '王医生说，我要是好好练，以后没准能站。', next: 'n4' },
  'n4': { type: 'say', who: '林越', text: '你们是不是都觉得我在浪费时间。', next: 'n5' },
  'n5': { type: 'say', who: '林越', text: '等我能走了，这些事不都好办了吗。', next: 'c6' },

  'c6': {
    type: 'choice',
    prompt: '这是他最要紧的一句话',
    options: [
      { key: 'A', label: '你得接受现实。T6 完全性损伤，站起来的可能很小。', next: 'f6a1', flag: 'reality' },
      { key: 'B', label: '我听到的是——你在等。等能走了，再开始过。', next: 'f6b1', flag: 'waiting' },
      { key: 'C', label: '你有没有想过，也许生活不是这个顺序？', next: 'f6c1' },
    ],
  },
  'f6a1': { type: 'say', who: '林越', text: '（脸沉下来）', next: 'f6a2' },
  'f6a2': { type: 'say', who: '林越', text: '……所以你也这么觉得。', next: 'f6a3' },
  'f6a3': {
    type: 'say', note: { kind: 'supervision' },
    text: '你说的可能是医学事实。但「接受现实」这四个字，是由你来宣布的。这就变成了「哀伤阶段」那套假设——书里明确说别这么干。而且目标该由他定，不是你。',
    next: 'g1',
  },

  'f6b1': { type: 'say', who: '林越', text: '（没说话，挺久）', next: 'f6b2' },
  'f6b2': { type: 'say', who: '林越', text: '……嗯。', next: 'f6b3' },
  'f6b3': { type: 'say', who: '林越', text: '我就是想着，等能走了……', next: 'f6b4' },
  'f6b4': {
    type: 'say', who: '咨询师',
    text: '我不是说这个念头不对。',
    next: 'f6b5',
  },
  'f6b5': {
    type: 'say', who: '咨询师',
    text: '我就是想问一句——那这一年多，你在干啥？',
    next: 'f6b6',
  },
  'f6b6': { type: 'say', who: '林越', text: '（停了停）', next: 'f6b7' },
  'f6b7': { type: 'say', who: '林越', text: '……等着。', next: 'f6b8' },
  'f6b8': {
    type: 'say', note: { kind: 'supervision' },
    text: '你没拆他的目标，你只是把「等」摆到桌面上，让他自己看见。这就是目标调整。不是让他认命，是给卡住的目标腾个位置。',
    next: 'g1',
  },

  'f6c1': { type: 'say', who: '林越', text: '啥顺序？', next: 'f6c2' },
  'f6c2': { type: 'say', who: '林越', text: '（看着你）', next: 'f6c3' },
  'f6c3': { type: 'say', who: '咨询师', text: '……', next: 'f6c4' },
  'f6c4': {
    type: 'say', note: { kind: 'supervision' },
    text: '方向对，但你抛了个太虚的问题回去。具体一点，他才接得住。',
    next: 'g1',
  },

  // ---- 拆小目标 ----
  'g1': {
    type: 'say', who: '咨询师',
    text: '问你个事。今年有没有啥你其实想去、后来算了的？',
    next: 'g2',
  },
  'g2': { type: 'say', who: '林越', text: '（想了想）……老张结婚。下个月。', next: 'g3' },
  'g3': { type: 'say', who: '林越', text: '他跟我说了。我说看情况。', next: 'g4' },
  'g4': { type: 'say', who: '咨询师', text: '看情况是啥意思？', next: 'g5' },
  'g5': { type: 'say', who: '林越', text: '……就是不去了。', next: 'g6' },
  'g6': { type: 'say', who: '咨询师', text: '那咱不聊去不去。', next: 'g7' },
  'g7': {
    type: 'say', who: '咨询师',
    text: '就聊一件事：真要去，最麻烦的是哪一步？',
    next: 'g8',
  },
  'g8': { type: 'say', who: '林越', text: '……酒店那个台阶吧。', next: 'g9' },
  'g9': { type: 'say', who: '林越', text: '还有，坐一晚上腰受不了。', next: 'g10' },
  'g10': { type: 'say', who: '咨询师', text: '这俩都是能想办法的事。', next: 'g11' },
  'g11': {
    type: 'say', who: '咨询师',
    text: '台阶可以问酒店有没有坡道。坐久了难受，可以带个垫子，或者中途出来歇会儿。',
    next: 'g12',
  },
  'g12': {
    type: 'say', who: '咨询师',
    text: '这些都不用等能走了才能弄。',
    next: 'g13',
  },
  'g13': { type: 'say', who: '林越', text: '（沉默）', next: 'g14' },
  'g14': {
    type: 'say', who: '林越',
    text: '……那我得问他酒店有没有坡道？这咋问啊。',
    next: 'g15',
  },
  'g15': { type: 'say', who: '咨询师', text: '嗯。', next: 'g16' },
  'g16': {
    type: 'say', who: '咨询师',
    text: '你刚问的这句，就已经是个能做的动作了。',
    next: 'g17',
  },
  'g17': {
    type: 'say', note: { kind: 'supervision' },
    text: '目标调整的样子，不是「放弃婚礼」，是从「等我能走」变成「我先问问有没有坡道」。',
    next: 'card4',
  },

  // ---- 科普卡 4 ----
  'card4': {
    type: 'card', kind: 'science',
    title: '「适应」不是一条必经的悲伤阶梯',
    lines: [
      '很多人以为，遭遇脊髓损伤之后，人一定会依次经过否认、愤怒、讨价还价、抑郁、接受。',
      '这个「五阶段」说法缺乏实证支持。书里明确提醒：不要假定当事人正在经历哀伤反应——实际情况比想象中少得多，而且因人而异。',
      '真实的适应轨迹大概是：约 66% 适应良好；约 13% 一开始很痛苦，一年内缓解；约 10% 是迟发的；10%–11% 会持续处在痛苦中。',
      '所以「他一定会经过这几个阶段，熬过去就好了」——是错的。适应没有规定路线，也不是每个人都要走一遍。',
    ],
    footer: '依据：第 5 章 · Natural History；第 17 章',
    button: '继续',
    next: 'end1',
  },
  'end1': {
    type: 'say', who: '咨询师',
    text: '今天到这儿。我不问你下个月去不去。',
    next: 'end2',
  },
  'end2': {
    type: 'say', who: '咨询师',
    text: '就问一件事：这周，你会不会去问一下那个坡道？',
    next: 'end3',
  },
  'end3': { type: 'say', who: '旁白', text: '（推到门口，停了一下）', next: 'end4' },
  'end4': { type: 'say', who: '林越', text: '……我问问吧。', next: 'end5' },
  'end5': { type: 'say', who: '林越', text: '不一定去啊。', next: 'end6' },
  'end6': { type: 'say', who: '咨询师', text: '嗯。不一定去。', next: 'end7' },
  'end7': {
    type: 'say', who: '旁白',
    text: '这一节结束时，他没说「我好了」。他说的是——「我下周还来。」',
    next: 'end8',
  },
  'end8': {
    type: 'say', who: '咨询师（内心）',
    text: '一年以后他会不会去上班，我不知道。',
    next: 'end9',
  },
  'end9': {
    type: 'say', who: '咨询师（内心）',
    text: '伤后十年，脊髓损伤者的就业率是 24% 到 32%，截瘫大概是四肢瘫的两倍，而受教育程度是最强的预测因素。这些数字我都知道。',
    next: 'end10',
  },
  'end10': {
    type: 'say', who: '咨询师（内心）',
    text: '但今天他做的是：把「等我能走了」往后挪了一格，腾出一小块地方，放了一件今天就能做的事。',
    next: 'end11',
  },
  'end11': {
    type: 'say', who: '咨询师（内心）',
    text: '这就是今天全部的成绩。',
    next: '@end/1',
  },
};

// ---------------------------------------------------------------------------
// 终章
// ---------------------------------------------------------------------------
const SCI_END = {
  '1': {
    type: 'result',
    title: '故事线一 · 完',
    lead: '心理干预的目标，不是消除疼痛，也不是恢复行走，而是功能、自我效能，和一个人觉得值得过的生活。',
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
// ---------------------------------------------------------------------------
// 房间里的可点物件。分节写，因为同一件东西在不同小节要说的话不一样。
// 点开是「咨询设置」科普，不推进剧情。
// ---------------------------------------------------------------------------
const ROOM_ITEMS = {
  referral: {
    label: '茶几上的转介单',
    acts: {
      1: {
        kind: 'referral', title: '转介单',
        lines: [
          '林越，26 岁，T6 完全性脊髓损伤，伤后 14 个月。',
          '情绪低落，训练配合度差，建议心理干预。',
          '——康复科 王医生',
        ],
        footer: '这上面写的是别人对他的判断。他本人没说要来。',
      },
    },
  },
  tissue: {
    label: '茶几上的纸巾盒',
    acts: {
      1: {
        kind: 'science', title: '为啥这儿放着一盒纸巾',
        lines: [
          '它就在你一伸手够得到的地方。没人会说「别哭」。',
          '摆在那儿，本身就是一句话：在这儿，你可以哭。',
          '顺带说个数：脊髓损伤之后出现抑郁的人，比一般人想的要多——不同研究给的比例在 22% 到 28% 之间。',
          '而最容易被漏掉的，恰恰是最该被看见的那部分。因为「没劲儿」「不想动」「睡不好」这些表现，太容易被当成身体的问题了。',
          '一个人躺在那儿不动，可能是身体不行，也可能是心里不行。这两件事看着一样。',
        ],
        footer: '依据：第 17 章',
      },
    },
  },
  clock: {
    label: '墙上的钟',
    acts: {
      1: {
        kind: 'science', title: '为啥「出院后」是最危险的时候',
        lines: [
          '很多人觉得，出院说明最难的过去了。',
          '但对脊髓损伤的人来说，刚确诊之后和出院回家之后，是两个心理上最容易出事的时候。',
          '在医院里啥都给你安排好了：几点训练、几点吃饭、去哪儿检查。回到家，这些突然全没了。而门口那几级台阶、没有扶手的卫生间、别人的眼神——才刚开始。',
          '最难的不是事故那天晚上，是回家以后的某个下午。',
        ],
        footer: '依据：第 17 章',
      },
    },
  },
  sofa: {
    label: '两把沙发',
    acts: {
      1: {
        kind: 'science', title: '座位不是面对面的',
        lines: [
          '两把沙发没有正对着摆。它们之间有一个夹角，大概 90 到 120 度。',
          '这样你不想对视的时候，可以把目光自然地移开，看地板、看窗外都行。',
          '正面对着坐，更像审问，不像谈话。',
          '中间那张茶几也是一种缓冲——它让两个人之间不至于空得发慌。',
        ],
        footer: '依据：第 7 章 · 咨询设置',
      },
    },
  },
};

// ---------------------------------------------------------------------------
// 组装。
// sections 必须在四个分节都声明完之后才求值——不能写在上头，
// 那时候 SCI_S1 还在暂时性死区里。
// ---------------------------------------------------------------------------
XLZX.storySci = {
  id: 'sci',
  title: '脊髓损伤',
  numeral: '一',
  lead: '把「等我能走了」当成人生的前提，因而什么也不做',
  client: {
    name: '林越',
    line1: '26 岁 · 男',
    line2: 'T6 完全性脊髓损伤 · 伤后 14 个月',
    line3: '出院回家 6 个月',
  },
  sections: [
    { id: 's1', title: '第 1 节', subtitle: '第一次见面', nodes: SCI_S1 },
    { id: 's2', title: '第 2 节', subtitle: '一周后', nodes: SCI_S2 },
    { id: 's3', title: '第 3 节', subtitle: '「等我能走了」', nodes: SCI_S3 },
  ],
  endingNodes: SCI_END,
  start: 's1/n1',
  ending: 'end/1',
};

XLZX.roomItems = ROOM_ITEMS;

// 后两条线还没写。引擎已经支持，只是没有内容——
// 所以选线页把它们画成剪影，而不是假装"正在加载"。
XLZX.storySlots = [
  {
    id: 'sci', numeral: '一', title: '脊髓损伤', ready: true,
    lead: '把「等我能走了」当成人生的前提，因而什么也不做',
    who: '林越 · 26 岁 · T6 完全性脊髓损伤 · 伤后 14 个月',
  },
  {
    id: 'amp', numeral: '二', title: '截肢', ready: false,
    lead: '身体意象、幻肢痛，和出院之后那一段情绪回落',
    who: '——',
  },
  {
    id: 'pain', numeral: '三', title: '慢性疼痛', ready: false,
    lead: '影像学看不出问题，不代表痛是假的',
    who: '——',
  },
];

