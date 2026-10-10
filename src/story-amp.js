//=============================================================================
// 内容数据 · 故事线二：截肢
//-----------------------------------------------------------------------------
// 全部台词来自 docs/story/故事线2-截肢.md（剧本 · 日常口语版）。
// 这里只做三件事：拆行、挂跳转、挂科普卡。
// **不改台词**——台词的问题应该在剧本文件里改，改完再同步到这里。
//
// 主角：周航，41 岁，右小腿截肢（车祸），伤后 5 个月、出院 2 个月。
// 选这个时点是因为手册第 16 章把「出院后」列为心理风险最高的时点之一，
// 且有现成的数据：伤后即刻焦虑/抑郁各 23.5% → 住院康复期降到 2.9%
// → 出院后升回 17.6% / 19.1%（Singh et al., 2009）。
//
// 本线所有数字的出处见 docs/reference/ 手册第 16 章，逐条登记在下方注释里。
//=============================================================================

var XLZX = (typeof window !== 'undefined' && window.XLZX) || {};
if (typeof window !== 'undefined') window.XLZX = XLZX;

// ---------------------------------------------------------------------------
// 第 1 节：出院两个月
// ---------------------------------------------------------------------------
const AMP_S1 = {
  // ---- 开场 ----
  'n1': {
    type: 'say', who: '旁白', act: 1, warmth: 1,
    text: '他进来的时候先看了眼沙发，挑的是靠门那把——坐下时左边空着，放拐。',
    next: 'n2',
  },
  'n2': {
    type: 'say', who: '旁白',
    text: '他妻子跟到门口，站着没进来。',
    next: 'n3',
  },
  'n3': {
    type: 'say', who: '周航',
    text: '让她在外头等吧。',
    next: 'n4',
  },
  'n4': {
    type: 'say', who: '周航',
    text: '（顿了一下）她跟着我，我说话不实在。',
    next: 'c1',
  },

  // ---- 选项 1：怎么接「她跟着我，我说话不实在」 ----
  'c1': {
    type: 'choice',
    prompt: '怎么接这一句',
    options: [
      { key: 'A', label: '那今天就咱俩说。她那边需要我做什么，回头再说。', next: 'a1', flag: 'ampAlone' },
      { key: 'B', label: '她跟着你，是担心什么？', next: 'b1', flag: 'ampAskedWife' },
      { key: 'C', label: '先说说你自己吧，最近怎么样？', next: 'd1', flag: 'ampOpen' },
    ],
  },
  'a1': { type: 'say', who: '周航', text: '……行。', next: 'a2' },
  'a2': {
    type: 'say', who: '周航',
    text: '其实也没啥不能让她听的。就是有些话，说了她晚上睡不着。',
    next: 'a3',
  },
  'a3': {
    type: 'say', note: { kind: 'supervision' },
    text: '他说「怕她睡不着」。这句话里有他对妻子的照顾，也有他一个人扛的部分——两边都值得被看见。',
    next: 'setup1',
  },

  'b1': { type: 'say', who: '周航', text: '怕我摔。', next: 'b2' },
  'b2': {
    type: 'say', who: '周航',
    text: '家里厕所门口有个坎，不高。我出院到现在，她每次都站在我后头。',
    next: 'b3',
  },
  'b3': {
    type: 'say', who: '周航',
    text: '站了两个月了。',
    next: 'b4',
  },
  'b4': {
    type: 'say', note: { kind: 'supervision' },
    text: '「站了两个月了」——他没说累，也没说烦，但这句话本身就是在说累。',
    next: 'setup1',
  },

  'd1': { type: 'say', who: '周航', text: '还行吧。', next: 'd2' },
  'd2': {
    type: 'say', who: '周航',
    text: '（笑了一下）大夫都夸我，说我这心态算好的。',
    next: 'd3',
  },
  'd3': {
    type: 'say', note: { kind: 'supervision' },
    text: '「还行吧」加上一个笑，是你最该留神的一种开场。夸他的人越多，他越不好说自己不好。',
    next: 'setup1',
  },

  // ---- 咨询设置（与其他线一致）----
  'setup1': {
    type: 'say', who: '咨询师',
    text: '先说几句规矩，省得你后头有顾虑。',
    next: 'setup2',
  },
  'setup2': {
    type: 'say', who: '咨询师',
    text: '咱俩说的话，我不往外说——包括你爱人。除非你同意，或者有危险。',
    next: 'setup3',
  },
  'setup3': {
    type: 'say', who: '咨询师',
    text: '一次五十分钟。墙上那个钟我这儿能看见，你不用管时间。',
    next: 'c2',
  },
  'c2': {
    type: 'choice',
    prompt: '说完设置之后',
    options: [
      { key: 'A', label: '这样行吗？有哪条想再问细点？', next: 'c2a1', flag: 'askedSetting' },
      { key: 'B', label: '直接往下：那说说，出院之后都怎么样？', next: 'c2b1' },
    ],
  },
  'c2a1': { type: 'say', who: '周航', text: '嗯，行。', next: 'c2a2' },
  'c2a2': {
    type: 'say', note: { kind: 'supervision' },
    text: '他答得很快。快到你不知道他是真明白了，还是不想在这儿多花时间。',
    next: 'room1',
  },
  'c2b1': { type: 'say', who: '周航', text: '行。', next: 'room1' },

  // ---- 咨询室可点物件（第 1 节）----
  'room1': {
    type: 'say', who: '旁白',
    text: '房间里有几样东西带光晕。点一下，会告诉你它们是干什么用的。',
    next: 'r1',
  },
  'r1': {
    type: 'say', who: '咨询师',
    text: '你刚才进门先看了一眼沙发，才坐下。',
    next: 'r2',
  },
  'r2': {
    type: 'say', who: '周航',
    text: '习惯。得挑一边靠着墙，拐能竖着放。',
    next: 'e1',
  },

  // ---- 病房 vs 家里：U 形曲线 ----
  'e1': {
    type: 'say', who: '咨询师',
    text: '出院两个月了。刚回家那阵，跟住院时候比，哪个更难？',
    next: 'e2',
  },
  'e2': {
    type: 'say', who: '周航',
    text: '住院那会儿好。',
    next: 'e3',
  },
  'e3': {
    type: 'say', who: '周航',
    text: '在医院，有人管你。几点做什么，都排好了。走廊里都是跟你一样的，抬头就能看见人。',
    next: 'e4',
  },
  'e4': {
    type: 'say', who: '周航',
    text: '回家第一天，我在客厅坐了一上午。',
    next: 'e5',
  },
  'e5': {
    type: 'say', who: '周航',
    text: '（停了会儿）没人告诉我该干啥。',
    next: 'card_u',
  },
  'card_u': {
    type: 'card', kind: 'science',
    title: '为什么出院以后反而更难',
    lines: [
      '这不是「不够坚强」。有一项追踪了三年的研究，测了截肢者不同阶段的焦虑和抑郁：',
      '刚截肢时，焦虑和抑郁各 23.5%；',
      '住院康复期，降到 2.9%；',
      '出院之后，又升到 17.6% 和 19.1%。',
      '研究者认为，住院期间有系统在推着你走，出了院，这套支撑一下子撤了。',
    ],
    footer: '依据：第 16 章 · Psychological Adjustment（Singh et al., 2009）',
    next: 'e6',
  },
  'e6': {
    type: 'say', who: '咨询师',
    text: '住院时候你每天几点起？',
    next: 'e7',
  },
  'e7': {
    type: 'say', who: '周航',
    text: '六点半。七点训练。',
    next: 'e8',
  },
  'e8': {
    type: 'say', who: '咨询师',
    text: '现在呢？',
    next: 'e9',
  },
  'e9': {
    type: 'say', who: '周航',
    text: '……不知道几点醒。反正不起。',
    next: 'e10',
  },
  'e10': {
    type: 'say', who: '周航',
    text: '起了干啥呢。',
    next: 'e11',
  },
  'e11': {
    type: 'say', note: { kind: 'supervision' },
    text: '「起了干啥呢」不是懒。是那套把一天排满的外部结构没了，他还没长出自己的一套。',
    next: 'e12',
  },
  'e12': {
    type: 'say', who: '咨询师',
    text: '你爱人早上几点起？',
    next: 'e13',
  },
  'e13': {
    type: 'say', who: '周航',
    text: '六点。她得上班。',
    next: 'e14',
  },
  'e14': {
    type: 'say', who: '周航',
    text: '她起来就轻手轻脚的，怕吵着我。其实我早醒了。',
    next: 'e15',
  },
  'e15': {
    type: 'say', who: '周航',
    text: '我就是躺着。',
    next: 'c3',
  },

  // ---- 选项 2：他躺着不起来 ----
  'c3': {
    type: 'choice',
    prompt: '怎么回应「我就是躺着」',
    options: [
      { key: 'A', label: '躺着的时候，脑子里都在想什么？', next: 'f1', flag: 'ampThoughts' },
      { key: 'B', label: '那咱先定一件小事：明天她想让你几点起？', next: 'g1', flag: 'ampGoalEarly' },
      { key: 'C', label: '你爱人知道你躺着吗？', next: 'h1', flag: 'ampWifeKnows' },
    ],
  },
  'f1': { type: 'say', who: '周航', text: '啥都想。', next: 'f2' },
  'f2': {
    type: 'say', who: '周航',
    text: '想以前开车的时候。想我那车还没卖。',
    next: 'f3',
  },
  'f3': {
    type: 'say', who: '周航',
    text: '想以后。想到后头就不敢想了。',
    next: 'f4',
  },
  'f4': {
    type: 'say', note: { kind: 'supervision' },
    text: '他说「不敢想」。这不是回避，是那条思路走到头了。先别急着把它掰回正面。',
    next: 'i1',
  },

  'g1': { type: 'say', who: '周航', text: '定几点？', next: 'g2' },
  'g2': {
    type: 'say', who: '周航',
    text: '……七点吧。跟她一块儿吃口饭。',
    next: 'g3',
  },
  'g3': {
    type: 'say', note: { kind: 'supervision' },
    text: '你给了他一个具体到可以做的小目标。他改成了「跟她一块儿吃饭」——这是他自己找的意义，比你的那个准。',
    next: 'i1',
  },

  'h1': { type: 'say', who: '周航', text: '不知道。', next: 'h2' },
  'h2': {
    type: 'say', who: '周航',
    text: '她要是知道，又该请假了。',
    next: 'h3',
  },
  'h3': {
    type: 'say', note: { kind: 'supervision' },
    text: '他不说，是为了不让她请假。照顾是双向的——记住这一层，后面谈他妻子的过度照顾时才不会只讲一边。',
    next: 'i1',
  },

  // ---- 幻肢痛第一次出现 ----
  'i1': {
    type: 'say', who: '咨询师',
    text: '晚上睡得怎么样？',
    next: 'i2',
  },
  'i2': {
    type: 'say', who: '周航',
    text: '不太好。',
    next: 'i3',
  },
  'i3': {
    type: 'say', who: '周航',
    text: '脚麻。',
    next: 'i4',
  },
  'i4': {
    type: 'say', who: '咨询师',
    text: '哪个脚？',
    next: 'i5',
  },
  'i5': {
    type: 'say', who: '周航',
    text: '（抬了一下眼）……右边那个。',
    next: 'i6',
  },
  'i6': {
    type: 'say', who: '周航',
    text: '我知道它没了。可它晚上就在那儿，麻，有时候像抽筋，脚趾头往里抠。',
    next: 'i7',
  },
  'i7': {
    type: 'say', who: '周航',
    text: '我说这个，别人以为我脑子有毛病。',
    next: 'i8',
  },
  'i8': {
    type: 'say', note: { kind: 'supervision' },
    text: '「别人以为我脑子有毛病」——他先替你解释了。先把「这是常见的」说清楚，他才敢往下讲。',
    next: 'card_phantom',
  },
  'card_phantom': {
    type: 'card', kind: 'science',
    title: '已经不在了的那只脚，为什么会痛',
    lines: [
      '这叫幻肢痛。痛的地方是已经不存在的部位，痛却是真的。',
      '它很常见，不是幻觉，也不是「想出来的」。',
      '需要说清楚的是：幻肢痛目前没有可靠根治的办法。',
      '有研究显示，镜像治疗对一部分人有效；但也有报告说，这个操作会让另一些人更难受。',
    ],
    footer: '依据：第 16 章 · Pain（phantom limb pain；mirror therapy 段落）',
    next: 'i9',
  },
  'i9': {
    type: 'say', who: '咨询师',
    text: '那不怪你。也不是你想出来的。这个待会儿咱细说。',
    next: 'i10',
  },
  'i10': {
    type: 'say', who: '周航',
    text: '（点头）',
    next: 'j1',
  },

  // ---- 妻子：过度照顾的第一次露面 ----
  'j1': {
    type: 'say', who: '咨询师',
    text: '你刚才说，她每次都站你后头。',
    next: 'j2',
  },
  'j2': {
    type: 'say', who: '周航',
    text: '嗯。',
    next: 'j3',
  },
  'j3': {
    type: 'say', who: '咨询师',
    text: '你什么感觉？',
    next: 'j4',
  },
  'j4': {
    type: 'say', who: '周航',
    text: '……烦。',
    next: 'j5',
  },
  'j5': {
    type: 'say', who: '周航',
    text: '（很快）但她也是为我好。',
    next: 'j6',
  },
  'j6': {
    type: 'say', note: { kind: 'supervision' },
    text: '他给你两个字「烦」，紧跟着就自己把话收回去。别顺着「为你好」往下走，也别批评这句话——先把那个「烦」留在屋里。',
    next: 'j7',
  },
  'j7': {
    type: 'say', who: '咨询师',
    text: '嗯，「为你好」我信。那个「烦」也是真的。',
    next: 'j8',
  },
  'j8': {
    type: 'say', who: '周航',
    text: '（没说话）',
    next: 'j9',
  },
  'j9': {
    type: 'say', who: '周航',
    text: '……有时候我故意多走两趟。',
    next: 'j10',
  },
  'j10': {
    type: 'say', who: '周航',
    text: '就为了让她看见我走得动。',
    next: 'j11',
  },
  'j11': {
    type: 'say', note: { kind: 'supervision' },
    text: '他在用「证明」换空间。这条路很累，而且它说明家里现在缺一个更省事的说法。',
    next: 'k1',
  },

  // ---- 危机筛查（可以不问）----
  'k1': {
    type: 'say', who: '旁白',
    text: '还剩十几分钟。',
    next: 'crisis1',
  },
  'crisis1': {
    type: 'choice',
    prompt: '问不问',
    options: [
      { key: 'A', label: '最近有没有觉得，活着挺没意思的？或者不想醒过来？', next: 'cr1', flag: 'ampScreened' },
      { key: 'B', label: '不问。今天头一回，先不碰这个。', next: 'cn1', flag: 'ampScreenSkipped' },
    ],
  },

  'cr1': { type: 'say', who: '周航', text: '（很久）', next: 'cr2' },
  'cr2': {
    type: 'say', who: '周航',
    text: '有过。',
    next: 'cr3',
  },
  'cr3': {
    type: 'say', who: '周航',
    text: '就有一回。晚上，她睡着了。我坐在客厅，看着窗户。',
    next: 'cr4',
  },
  'cr4': {
    type: 'say', who: '周航',
    text: '坐了得有一个钟头。后来我去睡了。',
    next: 'cr5',
  },
  'cr5': {
    type: 'say', who: '咨询师',
    text: '谢谢你告诉我这个。这不丢人，也不代表你「想死」——但我要跟你把话说全。',
    // 危机关怀写死在数据里：引擎看到 effect:'crisis' 就置 crisisTriggered，
    // 不经过任何模型判断。
    effect: 'crisis',
    next: 'card_crisis',
  },
  'card_crisis': {
    type: 'card', kind: 'resource',
    title: '如果这种时刻再出现',
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
    text: '下次那种时候，别一个人坐一个钟头。打我电话，或者打上面那个。',
    next: 'cr7',
  },
  'cr7': {
    type: 'say', who: '周航',
    text: '……行。',
    next: 'cr8',
  },
  'cr8': {
    type: 'say', note: { kind: 'supervision' },
    text: '他把这件事说出来了。这一次问，值。',
    next: 'hw1',
  },

  'cn1': {
    type: 'say', note: { kind: 'supervision' },
    text: '你没问。这不算错——第一次见面，关系还没建立。但你在心里记一笔：他有夜里独坐的记录，下一次别一直绕开。',
    next: 'hw1',
  },

  // ---- 留作业：情绪日记 ----
  'hw1': {
    type: 'say', who: '咨询师',
    text: '给你留个小作业，不难。',
    next: 'hw2',
  },
  'hw2': {
    type: 'say', who: '咨询师',
    text: '晚上脚难受、或者心里堵的时候，手机备忘录上记一句。就一句，写当时脑子里冒出来的那句话。',
    next: 'hw3',
  },
  'hw3': {
    type: 'say', who: '周航',
    text: '记那个干啥？',
    next: 'hw4',
  },
  'hw4': {
    type: 'say', who: '咨询师',
    text: '因为有些话，你天天在心里说，但自己听不见。写出来才听得见。',
    next: 'hw5',
  },
  'hw5': {
    type: 'say', who: '周航',
    text: '……行吧。',
    next: 'end1',
  },

  // ---- 第 1 节结束 ----
  'end1': {
    type: 'result',
    title: '第 1 节 · 完',
    lead: '出院之后那段回落，是常见的，不是他不够坚强。',
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
// 第 2 节：那只脚还在
// ---------------------------------------------------------------------------
const AMP_S2 = {
  'n1': {
    type: 'say', who: '旁白', act: 2, warmth: 2,
    text: '这次他没让妻子在门口等。她自己说去楼下转一圈。',
    next: 'n2',
  },
  'n2': {
    type: 'say', who: '周航',
    text: '上回你说，那玩意儿不是我想出来的。',
    next: 'n3',
  },
  'n3': {
    type: 'say', who: '周航',
    text: '我回去查了。查完更烦。',
    next: 'n4',
  },
  'n4': {
    type: 'say', who: '周航',
    text: '说治不好。',
    next: 'c1',
  },

  // ---- 选项 1：他说「治不好」 ----
  'c1': {
    type: 'choice',
    prompt: '怎么接「治不好」',
    options: [
      { key: 'A', label: '是有这么一说。咱先别急着找治法，说说它晚上具体怎么折腾你。', next: 'a1', flag: 'ampDetail' },
      { key: 'B', label: '你查到的是哪篇？咱们一起看看它到底说了什么。', next: 'b1', flag: 'ampCheckedSource' },
      { key: 'C', label: '你别灰心，现在医学发展很快的。', next: 'd1', flag: 'ampFalseHope' },
    ],
  },
  'a1': { type: 'say', who: '周航', text: '……十一点多开始。', next: 'a2' },
  'a2': {
    type: 'say', who: '周航',
    text: '先是麻。然后脚趾头开始抠，往里抠，抠得我出冷汗。',
    next: 'a3',
  },
  'a3': {
    type: 'say', who: '周航',
    text: '我拿手去摸，摸到的是被截掉那截。',
    next: 'a4',
  },
  'a4': {
    type: 'say', note: { kind: 'supervision' },
    text: '你在收集具体的描述，而不是评价。这比任何安慰都更能让他觉得被听懂了。',
    next: 'e1',
  },

  'b1': { type: 'say', who: '周航', text: '就手机推的。', next: 'b2' },
  'b2': {
    type: 'say', who: '周航',
    text: '……标题挺吓人的。',
    next: 'b3',
  },
  'b3': {
    type: 'say', note: { kind: 'supervision' },
    text: '你问出处，问对了。他已经在用「查资料」处理恐惧，但这个动作现在反过来在喂它。',
    next: 'e1',
  },

  'd1': { type: 'say', who: '周航', text: '……嗯。', next: 'd2' },
  'd2': {
    type: 'say', who: '周航',
    text: '（停了一会儿）你也这么说。',
    next: 'd3',
  },
  'd3': {
    type: 'say', who: '周航',
    text: '上一个大夫也这么说。',
    next: 'd4',
  },
  'd4': {
    type: 'say', note: { kind: 'supervision' },
    text: '你给了一个他早就听过、而且已经不信的答案。安慰如果是空的，它会把人推远一点。',
    next: 'e1',
  },

  // ---- 情绪日记 ----
  'e1': {
    type: 'say', who: '咨询师',
    text: '作业记了吗？',
    next: 'e2',
  },
  'e2': {
    type: 'say', who: '周航',
    text: '记了几条。',
    next: 'e3',
  },
  'e3': {
    type: 'say', who: '咨询师',
    text: '拿来咱看看？',
    next: 'diary1',
  },
  'diary1': {
    type: 'diary',
    title: '情绪日记 · 周航的手机备忘录',
    hint: '点开看看他都记了什么',
    entries: [
      {
        id: 'mon', day: '周一',
        lines: ['2:40。又麻。', '这玩意儿要跟我一辈子了。'],
        note: '「一辈子」——从今晚这一阵，推到余生。这是灾难化的典型形状。',
      },
      {
        id: 'wed', day: '周三',
        lines: ['她端洗脚水进来。我说我自己来。她说你够不着。', '我没说话。'],
        note: '这里没有一句抱怨，但记下来了。他记的是「说了也没用」。',
      },
      {
        id: 'fri', day: '周五',
        lines: ['楼下老张问我腿咋样了。我说好多了。', '然后上楼的时候扶着栏杆歇了两回。'],
        note: '「好多了」是给别人的答案。两条并排写在一起，他自己也看见了。',
      },
    ],
    next: 'e4',
  },
  'e4': {
    type: 'say', who: '咨询师',
    text: '周一那条。你说的「一辈子」，是当时就想到的？',
    next: 'e5',
  },
  'e5': {
    type: 'say', who: '周航',
    text: '是。',
    next: 'e6',
  },
  'e6': {
    type: 'say', who: '周航',
    text: '不然呢？它本来就没好过。',
    next: 'e7',
  },
  'e7': {
    type: 'say', who: '咨询师',
    text: '那我想跟你较个真。你从「今晚两点四十很痛」，跳到「一辈子都这样」。中间那一段，是怎么过去的？',
    next: 'e8',
  },
  'e8': {
    type: 'say', who: '周航',
    text: '（没答上来）',
    next: 'e9',
  },
  'e9': {
    type: 'say', who: '周航',
    text: '……我不知道。反正就是那么想的。',
    next: 'card_cat',
  },
  'card_cat': {
    type: 'card', kind: 'science',
    title: '从「今晚很痛」到「这辈子完了」',
    lines: [
      '这个跳跃有个名字：灾难化。指的是把一件事往最坏处想，并且认定那就是结局。',
      '研究里，灾难化能预测截肢者的疼痛干扰程度、抑郁症状、自评失能程度，以及社会功能受损。',
      '换句话说：痛有多痛是一回事，痛把人困住多少，灾难化在里面起了作用。',
      '所以 CBT 处理疼痛时，重点常常不是「把痛想没」，而是盯着这类想法，检验它，同时把人重新推到活动里去。',
    ],
    footer: '依据：第 16 章 · Pain（catastrophizing 段落；Hill et al., 1995；Jensen et al., 2002）',
    next: 'e10',
  },
  'e10': {
    type: 'say', who: '咨询师',
    text: '我说清楚一点：我不是说你想错了，也不是让你「别这么想」。',
    next: 'e11',
  },
  'e11': {
    type: 'say', who: '咨询师',
    text: '我是说，那句话它自己冒出来，然后替你做了决定——今晚啥也别干了。',
    next: 'e12',
  },
  'e12': {
    type: 'say', who: '周航',
    text: '……好像是。',
    next: 'e13',
  },
  'e13': {
    type: 'say', who: '周航',
    text: '疼起来的时候，我就躺着等它过去。',
    next: 'e14',
  },
  'e14': {
    type: 'say', note: { kind: 'supervision' },
    text: '他说出了一个循环：痛 → 「一辈子」 → 躺下等 → 白天更没有力气。这是要处理的地方，不是那句想法本身对错。',
    next: 'f1',
  },

  // ---- 镜像治疗：期待管理 ----
  'f1': {
    type: 'say', who: '周航',
    text: '我在网上看见个法子。拿镜子照，说能治。',
    next: 'f2',
  },
  'f2': {
    type: 'say', who: '周航',
    text: '那个有用吗？',
    next: 'c2',
  },
  'c2': {
    type: 'choice',
    prompt: '他怎么问镜像治疗',
    options: [
      { key: 'A', label: '对一部分人有用，对另一部分人没用，还有人做了更难受。得试了才知道。', next: 'g1', flag: 'ampHonestMirror' },
      { key: 'B', label: '有用，你回去试试，很多人都好了。', next: 'h1', flag: 'ampOverPromise' },
      { key: 'C', label: '那个是偏方，别信。', next: 'i1', flag: 'ampDismiss' },
    ],
  },
  'g1': { type: 'say', who: '周航', text: '……还有可能更难受？', next: 'g2' },
  'g2': {
    type: 'say', who: '咨询师',
    text: '有。所以试的时候有个说法：先试两三次，你说管用就接着做，没用或者更糟就停，不用硬撑。',
    next: 'g3',
  },
  'g3': {
    type: 'say', who: '周航',
    text: '（点头）这个我能接受。',
    next: 'card_mirror',
  },
  'card_mirror': {
    type: 'card', kind: 'science',
    title: '镜像治疗到底有多大把握',
    lines: [
      '幻肢痛目前没有能可靠根治的治疗。',
      '在各种心理干预里，镜像治疗是证据相对明确的一个例外。',
      '最早的报告显示，它对一部分人止痛有效，对另一部分人无效；后续研究看到了一些希望，',
      '但也有报告说，这个操作会让一些人的痛苦加重。',
      '所以它值得一试，但不该被说成「很多人都好了」。',
    ],
    footer: '依据：第 16 章 · Pain（Ramachandran & Rogers-Ramachandran, 1996；Chan et al., 2007）',
    next: 'g4',
  },
  'g4': {
    type: 'say', who: '咨询师',
    text: '我说这么细，是因为要是有人跟你保证「肯定好」，你试完没好，你会觉得是自己不行。',
    next: 'g5',
  },
  'g5': {
    type: 'say', who: '周航',
    text: '……嗯。',
    next: 'j1',
  },

  'h1': { type: 'say', who: '周航', text: '真的？', next: 'h2' },
  'h2': {
    type: 'say', who: '周航',
    text: '那我回去就试。',
    next: 'h3',
  },
  'h3': {
    type: 'say', note: { kind: 'supervision' },
    text: '你给了他一个你保证不了的承诺。两周后他要是不好，他失去的不只是那个法子，还有对你的信任。',
    next: 'j1',
  },

  'i1': { type: 'say', who: '周航', text: '……哦。', next: 'i2' },
  'i2': {
    type: 'say', who: '周航',
    text: '（把手机收回兜里）',
    next: 'i3',
  },
  'i3': {
    type: 'say', note: { kind: 'supervision' },
    text: '他好不容易自己找了一条路，你一句「别信」就关掉了。而且它不是偏方——它是这一章里少数几个有名字的干预。',
    next: 'j1',
  },

  // ---- 妻子的过度照顾 ----
  'j1': {
    type: 'say', who: '咨询师',
    text: '周三那条。她说「你够不着」。',
    next: 'j2',
  },
  'j2': {
    type: 'say', who: '周航',
    text: '嗯。',
    next: 'j3',
  },
  'j3': {
    type: 'say', who: '咨询师',
    text: '那句话，你当时什么反应？',
    next: 'j4',
  },
  'j4': {
    type: 'say', who: '周航',
    text: '没反应。她说得对，我确实够不着。',
    next: 'j5',
  },
  'j5': {
    type: 'say', who: '周航',
    text: '……就是她说完，我就觉得，那行吧。',
    next: 'j6',
  },
  'j6': {
    type: 'say', who: '周航',
    text: '那行吧，我就不试了。',
    next: 'j7',
  },
  'j7': {
    type: 'say', note: { kind: 'supervision' },
    text: '「那行吧」是这一段的关键。她替他做了一件事，他就少做一件——这个循环会自己长大。',
    next: 'c3',
  },

  // ---- 选项 3：怎么跟他说「照顾」这件事 ----
  'c3': {
    type: 'choice',
    prompt: '怎么跟他说照顾这件事',
    options: [
      { key: 'A', label: '她替你做得越多，你自己能做的就越少。这不是她的错，也不是你的错。', next: 'k1', flag: 'ampCareLoop' },
      { key: 'B', label: '你爱人这样，是不是有点过了？', next: 'l1', flag: 'ampBlameWife' },
      { key: 'C', label: '下次她再要帮你，你不会拒绝一次试试？', next: 'm1', flag: 'ampJustTry' },
    ],
  },
  'k1': { type: 'say', who: '周航', text: '……', next: 'k2' },
  'k2': {
    type: 'say', who: '周航',
    text: '那是她的错？',
    next: 'k3',
  },
  'k3': {
    type: 'say', who: '咨询师',
    text: '不是。她看着你摔倒过一次，她怕。她做这些，是在处理她自己的怕。',
    next: 'k4',
  },
  'k4': {
    type: 'say', who: '咨询师',
    text: '但结果是，你少练了很多次。所以这事得两个人一起调，不能只让你一个人扛。',
    next: 'k5',
  },
  'k5': {
    type: 'say', who: '周航',
    text: '（停了会儿）她要是听见这个，能松口气。',
    next: 'k6',
  },
  'k6': {
    type: 'say', note: { kind: 'supervision' },
    text: '你把「她做得太多」说成了「我们俩的事」。所以他立刻想到的是妻子能松口气——这是同盟，不是指控。',
    next: 'n1b',
  },

  'l1': { type: 'say', who: '周航', text: '（很快）她没错。', next: 'l2' },
  'l2': {
    type: 'say', who: '周航',
    text: '她就我这么一个人。',
    next: 'l3',
  },
  'l3': {
    type: 'say', note: { kind: 'supervision' },
    text: '你批评了他妻子一句，他立刻站到了她那边。这个回合，你失去了他一点。',
    next: 'n1b',
  },

  'm1': { type: 'say', who: '周航', text: '拒绝？', next: 'm2' },
  'm2': {
    type: 'say', who: '周航',
    text: '她一伸手，我说「不用」，她那个脸色……',
    next: 'm3',
  },
  'm3': {
    type: 'say', note: { kind: 'supervision' },
    text: '你把一件需要两个人重新协商的事，变成了他一个人的任务。他做不到，就会觉得自己又失败一次。',
    next: 'n1b',
  },

  'n1b': {
    type: 'say', who: '咨询师',
    text: '今天差不多了。下回我想请你爱人一起来一趟——不是告状，是让她也听见你刚才那句话。',
    next: 'n2b',
  },
  'n2b': {
    type: 'say', who: '周航',
    text: '……她能来？',
    next: 'n3b',
  },
  'n3b': {
    type: 'say', who: '咨询师',
    text: '你问她。她要是来，我这儿有地方坐。',
    next: 'end1',
  },

  'end1': {
    type: 'result',
    title: '第 2 节 · 完',
    lead: '痛是真的，那句「一辈子」也是真的——但后面那句，是可以拿出来商量的。',
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
// 第 3 节：明天几点起
// ---------------------------------------------------------------------------
const AMP_S3 = {
  'n1': {
    type: 'say', who: '旁白', act: 3, warmth: 3,
    text: '她来了。坐在靠门那把沙发上，包抱在腿上。',
    next: 'n2',
  },
  'n2': {
    type: 'say', who: '周航妻',
    text: '他让我来，我就来了。',
    next: 'n3',
  },
  'n3': {
    type: 'say', who: '周航妻',
    text: '是不是我在家做得不对？',
    next: 'c1',
  },

  // ---- 选项 1：妻子一进门就自责 ----
  'c1': {
    type: 'choice',
    prompt: '怎么回应她的自责',
    options: [
      { key: 'A', label: '先别急着认错。上回他说了一句话，我想让你亲耳听听。', next: 'a1', flag: 'ampWifeHear' },
      { key: 'B', label: '没有对错。你们俩现在都累，咱看看怎么能都轻一点。', next: 'b1', flag: 'ampBothTired' },
      { key: 'C', label: '他跟我说，你每次跟在他后头，他有点烦。', next: 'd1', flag: 'ampRelayBlame' },
    ],
  },
  'a1': { type: 'say', who: '周航妻', text: '什么话？', next: 'a2' },
  'a2': {
    type: 'say', who: '咨询师',
    text: '周航，你自己说。',
    next: 'a3',
  },
  'a3': { type: 'say', who: '周航', text: '（低头）', next: 'a4' },
  'a4': {
    type: 'say', who: '周航',
    text: '我说，她要是听见这个，能松口气。',
    next: 'a5',
  },
  'a5': {
    type: 'say', who: '周航妻',
    text: '（很久没说话）',
    next: 'a6',
  },
  'a6': {
    type: 'say', who: '周航妻',
    text: '我以为你嫌我。',
    next: 'a7',
  },
  'a7': {
    type: 'say', note: { kind: 'supervision' },
    text: '你让那句话由他自己说出口。这一句比你说十句都管用——而且它没有被你加工过。',
    next: 'e1',
  },

  'b1': { type: 'say', who: '周航妻', text: '……都累。', next: 'b2' },
  'b2': {
    type: 'say', who: '周航妻',
    text: '我晚上不敢睡实。他一起身我就醒。',
    next: 'b3',
  },
  'b3': {
    type: 'say', note: { kind: 'supervision' },
    text: '你把「互相指责」的框架换成了「共同处境」。她立刻说出了自己的那一半——这是能往下走的位置。',
    next: 'e1',
  },

  'd1': { type: 'say', who: '周航妻', text: '（愣住）', next: 'd2' },
  'd2': {
    type: 'say', who: '周航妻',
    text: '烦……',
    next: 'd3',
  },
  'd3': { type: 'say', who: '周航', text: '我没说烦！', next: 'd4' },
  'd4': {
    type: 'say', who: '周航',
    text: '我说的是「有时候」。',
    next: 'd5',
  },
  'd5': {
    type: 'say', note: { kind: 'supervision' },
    text: '你把他私下那两个字，直接转述给了她，还去掉了限定。现在他们俩得先处理你造成的这场误会。',
    next: 'e1',
  },

  // ---- 两个人各自的一天 ----
  'e1': {
    type: 'say', who: '咨询师',
    text: '咱今天不做检讨。我想请你们各自说说，一天是怎么过的。',
    next: 'e2',
  },
  'e2': {
    type: 'say', who: '咨询师',
    text: '从早上起床开始。',
    next: 'e3',
  },
  'e3': {
    type: 'say', who: '周航妻',
    text: '我六点起。给他把水放好，药摆出来。然后做早饭。',
    next: 'e4',
  },
  'e4': {
    type: 'say', who: '周航妻',
    text: '走之前我得看一眼他在哪儿。',
    next: 'e5',
  },
  'e5': {
    type: 'say', who: '周航',
    text: '我在床上。',
    next: 'e6',
  },
  'e6': {
    type: 'say', who: '周航妻',
    text: '（停了）我以为你睡到九点。',
    next: 'e7',
  },
  'e7': {
    type: 'say', who: '周航',
    text: '我六点半就醒了。',
    next: 'e8',
  },
  'e8': {
    type: 'say', who: '周航妻',
    text: '那你躺着干啥？',
    next: 'e9',
  },
  'e9': { type: 'say', who: '周航', text: '……', next: 'e10' },
  'e10': {
    type: 'say', who: '周航',
    text: '起来也没事干。',
    next: 'e11',
  },
  'e11': {
    type: 'say', who: '周航妻',
    text: '（声音低了）我以为你是难受。',
    next: 'e12',
  },
  'e12': {
    type: 'say', who: '周航妻',
    text: '我以为你不想看见我。',
    next: 'e13',
  },
  'e13': {
    type: 'say', note: { kind: 'supervision' },
    text: '两个人在同一间屋里，各自猜了两个月。今天第一次把日程摊开——这是这一节真正发生的事。',
    next: 'card_schedule',
  },
  'card_schedule': {
    type: 'card', kind: 'science',
    title: '为什么「各过各的猜测」会越滚越大',
    lines: [
      '截肢之后，家务和照顾的分工往往会重新洗牌。',
      '研究提示，家人的支持对适应很重要；但过度照顾会替代掉本人练习的机会，',
      '于是「他做不了—我来做—他更做不了」会自己转起来。',
      '解开的办法通常不是谁让步，而是把分工重新摆到桌面上谈。',
    ],
    footer: '依据：第 16 章 · Psychological Adjustment / Participation（家人支持与过度照顾；Williams et al., 2004）',
    next: 'f1',
  },

  // ---- 定目标：不从「恢复」出发 ----
  'f1': {
    type: 'say', who: '咨询师',
    text: '咱定个具体的事。不是「以后要怎么样」，是这周。',
    next: 'f2',
  },
  'f2': {
    type: 'say', who: '咨询师',
    text: '周航，你说。',
    next: 'f3',
  },
  'f3': { type: 'say', who: '周航', text: '……', next: 'c2' },
  'c2': {
    type: 'choice',
    prompt: '目标从哪来',
    options: [
      { key: 'A', label: '不着急。你先说一件这周你想自己做的事，哪怕很小。', next: 'g1', flag: 'ampSmallGoal' },
      { key: 'B', label: '我觉得可以先从走路开始，每天多走两百米。', next: 'h1', flag: 'ampTherapistGoal' },
      { key: 'C', label: '目标就是慢慢变回以前那样，你说是不是？', next: 'i1', flag: 'ampBackToNormal' },
    ],
  },
  'g1': { type: 'say', who: '周航', text: '……厕所那个坎。', next: 'g2' },
  'g2': {
    type: 'say', who: '周航',
    text: '我想自己过。不用她站后头。',
    next: 'g3',
  },
  'g3': {
    type: 'say', who: '周航妻',
    text: '（看着他）',
    next: 'g4',
  },
  'g4': {
    type: 'say', who: '咨询师',
    text: '那这个星期就这一件。她可以在客厅等。',
    next: 'g5',
  },
  'g5': {
    type: 'say', who: '周航妻',
    text: '……行。我在客厅。',
    next: 'g6',
  },
  'g6': {
    type: 'say', note: { kind: 'supervision' },
    text: '目标是他自己提的，而且小到能做成。这一类目标才推得动——专业人员定的大目标，通常两周后还在原地。',
    next: 'j1',
  },

  'h1': { type: 'say', who: '周航', text: '……两百米。', next: 'h2' },
  'h2': {
    type: 'say', who: '周航',
    text: '（没接话）',
    next: 'h3',
  },
  'h3': {
    type: 'say', who: '周航妻',
    text: '要不先一百？',
    next: 'h4',
  },
  'h4': {
    type: 'say', note: { kind: 'supervision' },
    text: '你定的距离，最后由他妻子来打折。目标不是从他嘴里出来的，这个回合谁都没往前走。',
    next: 'j1',
  },

  'i1': { type: 'say', who: '周航', text: '变回以前那样？', next: 'i2' },
  'i2': {
    type: 'say', who: '周航',
    text: '（笑了一下）你说这个，我腿就能长出来？',
    next: 'i3',
  },
  'i3': {
    type: 'say', who: '周航妻',
    text: '（别过脸）',
    next: 'i4',
  },
  'i4': {
    type: 'say', note: { kind: 'supervision' },
    text: '「变回以前那样」是这类工作里最该避开的说法。他要的不是长回一条腿，是能过的日子——那是两件事。',
    next: 'j1',
  },

  // ---- 重新定义目标：工作与同伴 ----
  'j1': {
    type: 'say', who: '咨询师',
    text: '还有一件事想问你。你现在还想回去开车吗？',
    next: 'j2',
  },
  'j2': { type: 'say', who: '周航', text: '……想。', next: 'j3' },
  'j3': {
    type: 'say', who: '周航',
    text: '但那个得看人家要不要我。',
    next: 'j4',
  },
  'j4': {
    type: 'say', who: '咨询师',
    text: '这不是你一个人的事。有一项数据：截肢之后大约三分之二的人能回到工作，但很多人是兼职，或者换了岗位。',
    next: 'j5',
  },
  'j5': {
    type: 'say', who: '咨询师',
    text: '所以「回不去原来的岗」不等于「你没用」。这是这一群人的普遍情况。',
    next: 'card_work',
  },
  'card_work': {
    type: 'card', kind: 'science',
    title: '回到工作这件事',
    lines: [
      '截肢之后，大约三分之二的人能重新就业，其中不少人只做兼职。',
      '上肢截肢者往往需要换岗，新岗位通常对体力要求更低、对教育程度要求更高。',
      '能不能回去、回去做什么，受年龄、伤前功能、假肢使用、教育程度和雇主支持等因素影响。',
    ],
    footer: '依据：第 16 章 · Educational and Vocational Capacities（Burger, 2009；Hebert & Burger, 2016）',
    next: 'j6',
  },
  'j6': {
    type: 'say', who: '周航',
    text: '……那我现在能干啥？',
    next: 'j7',
  },
  'j7': {
    type: 'say', who: '咨询师',
    text: '你以前跑的是哪条线？',
    next: 'j8',
  },
  'j8': {
    type: 'say', who: '周航',
    text: '城东那一片。建材。',
    next: 'j9',
  },
  'j9': {
    type: 'say', who: '周航',
    text: '……调度也是我干的。单子都在我脑子里。',
    next: 'j10',
  },
  'j10': {
    type: 'say', who: '咨询师',
    text: '那这一条，可能是能接着用的。',
    next: 'j11',
  },
  'j11': {
    type: 'say', note: { kind: 'supervision' },
    text: '你没有把「回不去」当成结局，而是去找他还剩什么。这是目标调整的落点。',
    next: 'k1',
  },

  // ---- 同伴支持 ----
  'k1': {
    type: 'say', who: '咨询师',
    text: '还有一个东西，我建议你了解。叫同伴探访——就是让也截过肢的人来看看你。',
    next: 'k2',
  },
  'k2': {
    type: 'say', who: '周航',
    text: '让我去听别人讲这些？',
    next: 'k3',
  },
  'k3': {
    type: 'say', who: '咨询师',
    text: '我知道你这话什么意思。不过数据上它是有用的。',
    next: 'k4',
  },
  'k4': {
    type: 'say', who: '咨询师',
    text: '有一项自我管理课程的研究，参加的人抑郁症状更少、日常功能更好、自我效能更高。',
    next: 'k5',
  },
  'k5': {
    type: 'say', who: '咨询师',
    text: '而且效果最好的是两类人：六十五岁以下，和截肢不到三年的。你两条都占。',
    next: 'card_peer',
  },
  'card_peer': {
    type: 'card', kind: 'science',
    title: '见别的截肢者，为什么会有用',
    lines: [
      '有一项针对截肢者的自我管理课程（PALS）做过随机对照试验。',
      '和对照组比，参加者报告的抑郁症状更少，对日常限制的困扰更少，',
      '功能更好，一般自我效能更高，情绪也更积极。',
      '效果在完成课程的人、65 岁以下的人，以及截肢不到 3 年的人身上最明显。',
      '研究者的提示是：越早介入可能越有效。',
    ],
    footer: '依据：第 16 章 · Intervention（PALS 自我管理课程；Wegener et al., 2009）',
    next: 'k6',
  },
  'k6': {
    type: 'say', who: '周航',
    text: '（想了会儿）……那要是有个能问问假肢磨不磨的人，也行。',
    next: 'k7',
  },
  'k7': {
    type: 'say', who: '咨询师',
    text: '有。回头我把联系方式给你。',
    next: 'k8',
  },
  'k8': {
    type: 'say', who: '周航妻',
    text: '（拿出手机）我记一下。',
    next: 'l1',
  },

  // ---- 身体与亲密：轻轻碰一下 ----
  'l1': {
    type: 'say', who: '咨询师',
    text: '还有一件，问得直白一点，你们不想答可以不答。',
    next: 'l2',
  },
  'l2': {
    type: 'say', who: '咨询师',
    text: '身体变了之后，两个人之间亲近这件事，有没有受影响？',
    next: 'l3',
  },
  'l3': { type: 'say', who: '周航', text: '（没说话）', next: 'l4' },
  'l4': {
    type: 'say', who: '周航妻',
    text: '（很轻）他不让我碰那条腿。',
    next: 'l5',
  },
  'l5': {
    type: 'say', who: '周航',
    text: '……难看。',
    next: 'l6',
  },
  'l6': {
    type: 'say', note: { kind: 'supervision' },
    text: '你把一个通常没人敢问的事摆到了桌上。他们答了——说明这个门是能开的。',
    next: 'card_body',
  },
  'card_body': {
    type: 'card', kind: 'science',
    title: '身体变了之后',
    lines: [
      '截肢会改变身体意象和自我概念，对一部分人来说，也会影响性亲密。',
      '研究提示，性活动是整体生活质量的一部分，但这个领域在截肢者中研究得很少，',
      '临床上常常被跳过——不是因为它不重要，是因为没人问。',
      '它不需要被解决成一个「问题」，但值得被提出来。',
    ],
    footer: '依据：第 16 章 · Sexual Functioning（Holzer et al., 2014；Geertzen et al., 2009）',
    next: 'l7',
  },
  'l7': {
    type: 'say', who: '咨询师',
    text: '我今天不解决这个。就是让你们知道，这事可以说。',
    next: 'l8',
  },
  'l8': {
    type: 'say', who: '周航妻',
    text: '（点头）',
    next: 'm1',
  },

  // ---- 收束 ----
  'm1': {
    type: 'say', who: '咨询师',
    text: '今天到这儿。这周就三件事：厕所那个坎、同伴探访的电话、还有你那条线先去问问。',
    next: 'm2',
  },
  'm2': {
    type: 'say', who: '周航',
    text: '（点头）',
    next: 'm3',
  },
  'm3': {
    type: 'say', who: '周航妻',
    text: '大夫，我问一句。',
    next: 'm4',
  },
  'm4': {
    type: 'say', who: '周航妻',
    text: '他那个疼，真没办法了？',
    next: 'm5',
  },
  'm5': {
    type: 'say', who: '咨询师',
    text: '没有根治的办法。这句话我不绕。',
    next: 'm6',
  },
  'm6': {
    type: 'say', who: '咨询师',
    text: '但我们能改的不是那个疼，是它占多大地方。',
    next: 'm7',
  },
  'm7': {
    type: 'say', who: '周航',
    text: '……这个我信。',
    next: 'end1',
  },

  'end1': {
    type: 'say', who: '旁白',
    text: '（这一节到这儿。他说下周还想来。）',
    next: 'end3',
  },
  'end3': {
    type: 'say', who: '旁白',
    text: '（他起身的时候，先把拐拿稳，再站。这个动作他已经不用想了。）',
    next: 'end/1',
  },
};

// ---------------------------------------------------------------------------
// 终章。与故事线一同形：先成绩单，再资源卡。
// ---------------------------------------------------------------------------
const AMP_END = {
  '1': {
    type: 'result',
    title: '故事线二 · 完',
    lead: '心理干预的目标，不是让那条腿长回来，也不是把疼消掉。是功能、自我效能，和一个他觉得值得过的日子。',
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

XLZX.storyAmp = {
  id: 'amp',
  title: '截肢',
  numeral: '二',
  lead: '身体意象、幻肢痛，和出院之后那一段情绪回落',
  client: {
    name: '周航',
    line1: '41 岁 · 男',
    line2: '右小腿截肢（车祸）· 伤后 5 个月',
    line3: '出院回家 2 个月',
  },
  sections: [
    { id: 's1', title: '第 1 节', subtitle: '第一次见面', nodes: AMP_S1 },
    { id: 's2', title: '第 2 节', subtitle: '两周后', nodes: AMP_S2 },
    { id: 's3', title: '第 3 节', subtitle: '「明天几点起」', nodes: AMP_S3 },
  ],
  endingNodes: AMP_END,
  // 周航用双拐，不是轮椅。
  clientArt: {
    prop: 'CRUTCH', propX: 58, propY: 33,
    body: 'ZHOUHANG', bodyX: 63, bodyY: 33,
  },
  mobility: {
    title: '他的双拐',
    lines: [
      '双拐靠在沙发扶手边上，是他自己放的角度——伸手就够得着，又不会倒。',
      '用过拐的人都有这个动作：先试一下地面滑不滑，再把重心交出去。',
      '第 1 节，他进门先看沙发，挑了靠门那把。拐能竖着放，不挡路。',
    ],
  },
  start: 's1/n1',
  ending: 'end/1',
  end: {
    heading: '故事线二 · 完',
    closing: '他没等到那条腿长回来，也没等到疼消失。'
      + '他等到的是：这周自己过一次厕所的坎，问清楚同伴探访的电话，'
      + '还有想起城东那条线的时候，想到的是单子，不是腿。',
  },
};
