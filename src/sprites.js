// 立绘 + 场景时段变体。
// 方案 B 冻结的是「空房间」，没有画人；这里补上两个人和几处随剧情变的东西。
//
// 坐标系统一：和方案 B 一样，每个字符 = 1 个逻辑像素，空格 = 透明，106 × 60 的画布。
// 渲染时不做缩放，所以人必须画在房间尺度的像素上。
// 立绘风格参考《元气骑士》：头占比大、一圈深色描边、平涂色块、四肢短粗。
// 头宽 10 px（原先 6 px）——头小的话五官没有落笔的地方。

// 方案 B 的 39 色只画家具，没有肤色/发色/服装色，这里补齐。
// 服装用用户指定的配色：咨询师白上衣+卡其裤；来访者墨绿上衣+土黄裤。
// 另加一个深色 D 作描边 —— 白上衣对墙面只有 1.21:1，没有描边会看不见人。
const PAL_EXT = {
  H: '#2a2622', // 头发（黑）
  Y: '#3d3830', // 头发高光（顶光落在发顶，把"一团黑"打开）
  Z: '#bd8e6b', // 皮肤
  z: '#9c7154', // 皮肤暗面
  X: '#221f1c', // 瞳
  D: '#241f1a', // 描边（元气骑士式深色轮廓，兼作发色）

  // 咨询师：白上衣 + 卡其裤（用户指定）
  A: '#f2eee4', // 白上衣
  a: '#d3ccbd', // 白上衣暗面
  N: '#b99a63', // 卡其裤
  n: '#967b4a', // 卡其裤暗面

  // 来访者 林越：墨绿上衣 + 土黄裤（用户指定）
  J: '#33513d', // 墨绿上衣
  j: '#243b2c', // 墨绿上衣暗面
  Q: '#d9b04e', // 土黄裤（提亮过：原 #c19a4e 在木地板上偏棕）
  q: '#b08c3c', // 土黄裤暗面
  // 陈静（故事线三）：砖红上衣 + 深灰裤 + 旧棕包。
  // 砖红是三个角色里唯一的暖色上衣，和沙发蓝、卡其、墨绿都错得开。
  R: '#9c5348', // 砖红上衣
  r: '#7d3f36', // 砖红上衣暗面
  M: '#5c5f66', // 深灰裤
  m: '#45474d', // 深灰裤暗面
  I: '#8a6a4f', // 包（旧棕）

  // 许予安（v2 新线）：14 岁，校服藏青 + 深灰运动裤 + 下肢矫形支具。
  // 藏青是四个角色里唯一的冷色上衣（林越墨绿、周航土黄、陈静砖红），一眼分得开。
  U: '#37476b', // 藏青校服
  W: '#2a3752', // 藏青暗面
  L: '#4a4a52', // 深灰运动裤
  l: '#3a3a41', // 深灰运动裤暗面
  K: '#c9c6bd', // 支具（医用塑料，冷灰）
  E: '#9a968b', // 支具暗面 / 绑带
};

// 轮椅（14 × 17）：大轮 + 小前轮 + 脚踏 + 推手。
// 关键：**大轮要有浅色轮辋（s）**。全用深色框（D）的话，轮子会糊进沙发和地板的暗部，
// 整把椅子就只剩一个悬空的小前轮，看起来像画错了。
// 轮辐之间留空，让墙和地板透过轮子——读起来才是个"轮"。
// 周航（故事线二）：41 岁，右小腿截肢。
// 复用林越的骨架，但换配色与发型，避免两个人看起来是同一个。
// 外套用土黄（Q/q），工装裤用深灰蓝（E/e 之外的 N/n 是卡其，这里用 g 系）。
// 陈静（故事线三）：38 岁，慢性下背痛。
// 骨架沿用，但换配色与发型：头发扎起来（两侧收窄、后脑鼓一点），
// 与林越（厚发帘）和周航（短发）都能一眼分开。
const CHENJING = [
  '    YYYY       ',
  '   YYYYYY      ',
  '  HHHHHHHH     ',
  '  HZZZZZZH     ',
  '  ZXZZZZXZ     ',
  '  ZZZZZZZZ     ',
  '   ZZZZZZ      ',
  '   ZzzzZ       ',
  '  DRRRRRRD     ',
  ' DRRRRRRRRD    ',
  ' DRRRRRRRRD    ',
  ' DRRRRRRRRD    ',
  ' DRrRRRRrRD    ',
  ' DRRRRRRRRD    ',
  ' DRRRRRRRRD    ',
  ' DMMMMMMMMD    ',
  ' DMMMMMMMMD    ',
  ' DMMMDDMMMD    ',
  ' DMMMDDMMMD    ',
  ' DMMMDDMMMD    ',
  ' DmmmDDmmmD    ',
  '  DDD  DDD     ',
];

// 她的包（8 × 7）：放在脚边，敞口，露出本子一角（w 是纸白）
const BAG = [
  '  IIII  ',
  ' IIIIII ',
  'IIwwIIII',
  'IIwwIIII',
  'IIIIIIII',
  'IIIIIIII',
  ' IIIIII ',
];

const ZHOUHANG = [
  '   DYYYYYD  ',
  '  DYYYYYYYD ',
  '  DHHHHHHHD ',
  '  DHZZZZZHD ',
  '  DZXZZXZZD ',
  '  DZZZZZZZD ',
  '   DZZZZZD  ',
  '   DzzzzD   ',
  '  DQQQQQQD  ',
  ' DQQQQQQQQD ',
  ' DQQQQQQQQD ',
  ' DQQQQQQQQD ',
  ' DQqQQQQqQD ',
  ' DQQQQQQQQD ',
  ' DQQQQQQQQD ',
  ' DNNNNNNNND ',
  ' DNNNNNNNND ',
  ' DNNNDDNNND ',
  ' DNNNDDNNND ',
  ' DNNNDDNNND ',
  ' DnnnDDnnnD ',
  '  DDD  DDD  ',
];

const CRUTCH = [
  ' dddd  ',
  'dddddd ',
  ' dddd  ',
  '  dd   ',
  '  dd   ',
  '  dd   ',
  '  dd   ',
  '  dd   ',
  '  dd   ',
  '  dd   ',
  '  DD   ',
  '  dd   ',
  '  DD   ',
  '  dd   ',
  '  dd   ',
  '  DD   ',
  '  dd   ',
  '  dd   ',
  '  dd   ',
  '  XX   ',
  '  XX   ',
];

const WHEELCHAIR = [
  '  sSS         ',
  ' SsssS        ',
  'Ss   Ss   S   ',
  'Ss D sS  SS   ',
  'Ss D sS SSS   ',
  'Ss D sS SS    ',
  'Ss D sS S     ',
  'Ss D sS       ',
  'Ss   sS       ',
  ' SsssS        ',
  '  sssssssss   ',
  '  SS          ',
  '   SS         ',
  '   S          ',
  '   S          ',
  '   SS         ',
  '  uuu         ',
];
// 林越：坐姿，深色头发、灰蓝卫衣、手搭在扶手上，腿朝右搁在脚踏上
const LINYUE = [
  '  DYYYYYYD  ',
  ' DYYYYYYYYD ',
  ' DHHHHHHHHD ',
  ' DHHZZZZHHD ',
  ' DHZXZZXZHD ',
  ' DHZZZZZZHD ',
  '  DZZZZZZD  ',
  '  DzzzzzD   ',
  '   DJJJJJD  ',
  '  DJJJJJJJD ',
  ' DJJJJJJJJJD',
  ' DJJJJJJJJJD',
  ' DJJJJJJJJJD',
  ' DJJJJJJJJJD',
  ' DjJJJJJJJjD',
  ' DQQQQQQQQD ',
  ' DQQQQQQQQD ',
  ' DQQQDDQQQD ',
  ' DQQQDDQQQD ',
  ' DQQQDDQQQD ',
  ' DqqqDDqqqD ',
  '  DDD  DDD  ',
];

// 咨询师（玩家）：坐在左边沙发上，面朝右，手里的笔和本子是玩家自己的视角，
// 所以不画——画了会变成"看着自己"，很怪。
// 林越 · 坐姿版：上半身与原立绘一致，下半身改成"坐在轮椅上"。
// 原立绘是站姿（双腿竖直），坐在轮椅上会两条直腿戳到脚踏下面去。
// 这里把大腿压平（落在座垫上）、小腿下垂（落到脚踏），膝盖在座沿处弯。
const LINYUE_SEATED = [
  '  DYYYYYYD  ',
  ' DYYYYYYYYD ',
  ' DHHHHHHHHD ',
  ' DHHZZZZHHD ',
  ' DHZXZZXZHD ',
  ' DHZZZZZZHD ',
  '  DZZZZZZD  ',
  '  DzzzzzD   ',
  '   DJJJJJD  ',
  '  DJJJJJJJD ',
  ' DJJJJJJJJJD',
  ' DJJJJJJJJJD',
  ' DJJJJJJJJJD',
  ' DJJJJJJJJJD',
  // 大腿：平铺在座垫上（占座垫宽度）
  ' DQQQQQQQQD ',
  ' DQQQQQQQQD ',
  // 膝盖折下来：小腿 + 脚，落在脚踏上
  '  DQQQQQD   ',
  '  DQQQQQD   ',
  '  Dq qQD    ',
  '  DDD DDD   ',
];

// 许予安（v2 唯一一条线）：14 岁，初二，车祸后遗留下肢功能障碍。
// 右侧小腿戴矫形支具（从膝到踝），平时拄双拐；短距离能自己走。
// 表情按规格写死成「警惕和忍耐」，不是悲伤：眼睛是平视的，嘴角不往下掉。
// 骨架沿用（头 10 px、四肢短粗），换发型（短、露出耳朵，与林越的厚发帘分开）、
// 换配色（藏青校服 + 深灰运动裤），坐姿与咨询师同一套（大腿平、小腿垂到地面）。
const XUYUAN_SEATED = [
  '  DYYYYYYD  ',
  ' DYYYYYYYYD ',
  ' DHHHHHHHHD ',
  ' DHZZZZZZHD ',
  ' DZXZZZZXZD ',
  ' DZZZZZZZZD ',
  '  DZZZZZZD  ',
  '  DzzzzD    ',
  '   DUUUUD   ',
  '  DUUUUUUD  ',
  ' DUUUUUUUUD ',
  ' DUUwUUUUUD ',
  ' DUUUUUUUUD ',
  ' DUuUUUUuUD ',
  ' DUUUUUUUUD ',
  ' DLLLLLLLLD ',
  ' DLLLLLLLLD ',
  '  DKKD LLD  ',
  '  DKED LLD  ',
  '  DKKD LLD  ',
  '  DKED LLD  ',
  '  DKKD LLD  ',
  '  DDDD DDD  ',
];

// 双拐（12 × 22）：靠沙发扶手立着，不在手上。
// 拄着拐站着是「患者」的手势，坐着把拐放在一边才是这个人的常态。
// 深色腋托 / 铝色杆 / 棕色握把 / 深色脚垫；两根略呈外八字，读起来是一对而不是两根竿。
const CRUTCH_PAIR = [
  ' DDD   DDD  ',
  'DkkkD DkkkD ',
  ' kkk   kkk  ',
  ' k k   k k  ',
  ' k k   k k  ',
  ' k k   k k  ',
  ' k k   k k  ',
  ' k k   k k  ',
  '  kk    kk  ',
  '  kk    kk  ',
  '  kkk   kkk ',
  '  kkk   kkk ',
  '  kk    kk  ',
  '  kk    kk  ',
  '  kk    kk  ',
  '  kk    kk  ',
  '  kk    kk  ',
  '  kk    kk  ',
  '  kk    kk  ',
  '  XX    XX  ',
  '  XX    XX  ',
  '  XX    XX  ',
];
const COUNSELOR = [
  '   DYYYYYD  ',
  '  DYYYYYYYD ',
  '  DHHHHHHHD ',
  '  DHZZZZZHD ',
  '  DZXXZXXZD ',
  '  DZZZZZZZD ',
  '   DZZZZZD  ',
  '   DzzzzD   ',
  '   DAAAAAD  ',
  '  DAAAAAAAD ',
  ' DAAAAAAAAAD',
  ' DAAaaaAAAD ',
  ' DAAaaaAAAD ',
  ' DAAAAAAAAD ',
  ' DaAAAAAAaD ',
  ' DNNNNNNNND ',
  ' DNNNNNNNND ',
  ' DNNNDDNNND ',
  ' DNNNDDNNND ',
  ' DNNNDDNNND ',
  ' DnnnDDnnnD ',
  '  DDD  DDD  ',
];

// 人的画法分两种，别搞混：
//   · 坐沙发的人（咨询师）——**后画**，腿被坐垫吃掉才是"坐着"
//   · 坐轮椅的人（林越）——**先画椅子、后画人**，椅子的框架要从人的腿前面穿过去
//     （真实坐姿就是这样：人坐在架子中间，大轮和脚踏在人和地面之间）
//
// 沙发坐垫在第 13–18 行（沙发摆 y=26 → 画布 y=39–44）。
// 头 y≈30–34，髋部 y≈41，腿 y≈42–45。
const CHARS = {
  // 林越：靠门那把沙发（sofaR 在 x=56，坐垫 x=63–72）。
  // 立绘从 11 行加高到 23 行，身体 y 下移 2 —— 否则发顶会顶进墙上的挂画。
  client: { chair: WHEELCHAIR, chairX: 51, chairY: 34, body: LINYUE_SEATED, bodyX: 51, bodyY: 30 },
  // 咨询师：左边那把（sofaL 在 x=20，坐垫 x=27–36），朝向画面右
  counselor: { body: COUNSELOR, bodyX: 25, bodyY: 31 },
};

// 钟针的时段变体。方案 B 的钟是「两点十分」，这里补另外两节要的时间。
// 钟 9×9，圆心在 (4,4)。
const CLOCK_VARIANTS = {
  // 第 1 节 14:10 —— 分针指 2，时针刚过 2
  c1: [
    'OOOOOOOOO',
    'OiiiDiiiO',
    'OiiiDiiiO',
    'OiiiDiiiO',
    'ODiiDDDDO',
    'OiiiiiiiO',
    'OiiiiiiiO',
    'OiiiDiiiO',
    'OOOOOOOOO',
  ],
  // 第 2 节 14:05 —— 分针指 1，时针压在 2 正上
  c2: [
    'OOOOOOOOO',
    'OiiiDiiiO',
    'OiiiDiiiO',
    'OiDiDiiiO',
    'OiiDDiiDO',
    'OiiiiiiiO',
    'OiiiiiiiO',
    'OiiiDiiiO',
    'OOOOOOOOO',
  ],
  // 第 3 节 13:50 —— 分针指 10，时针快到 2
  c3: [
    'OOOOOOOOO',
    'OiiiDiiiO',
    'OiiiDiiiO',
    'ODiipiiiO',
    'ODiiDiiiO',
    'OiiiiiiiO',
    'OiiiiiiiO',
    'OiiiDiiiO',
    'OOOOOOOOO',
  ],
};

// 茶几上的转介单（5 × 5）+ 纸巾盒（4 × 4）。
//
// 尺寸是按现实比例定的，不是按"看得清"定的：沙发坐垫 10 像素宽（≈60cm），
// 那 A4 纸就该是 5 像素左右、纸巾盒 4 像素左右。画大了虽然显眼，
// 但整张茶几会立刻失去尺度感——一眼就看出是"贴上去的图标"。
// 方案 B 原来那盒纸巾是 7×5，同样偏大，这里是缩过的版本。
const REFERRAL = [
  'wwwwk',
  'wkkkk',
  'wwwww',
  'wkkkw',
  'wwwww',
];

const TISSUE = [
  ' ww  ',
  'kkkk ',
  'TTTT ',
  'TTTT ',
];

// 三节咨询的房间亮度。开局最暗（遮光窗帘拉着、灯还没开），一节比一节亮一点，
// 但**不会全亮**——终章也只是"下午的房间里有一块暖光"，不是"痊愈了"。
const WARMTH = {
  1: { glow: 0.10, vignette: 0.36 },
  2: { glow: 0.15, vignette: 0.28 },
  3: { glow: 0.21, vignette: 0.20 },
};

// ---------------------------------------------------------------------------
// 挂到命名空间上。产物只有一段脚本，所以这里不写 export。
// ---------------------------------------------------------------------------
var XLZX = (typeof window !== 'undefined' && window.XLZX) || {};
if (typeof window !== 'undefined') window.XLZX = XLZX;

// 场景数据（从方案 B 抽出来的像素地图）在页面里那段 application/json 里。
// **必须在这里就抓进来**：engine.js 是在加载时就把 pal / sprites 解构成常量的，
// 等启动脚本再赋值就晚了，会直接抛 "cannot read properties of undefined"。
if (typeof document !== 'undefined') {
  var dataEl = document.getElementById('sprites-data');
  if (dataEl) XLZX.sprites = JSON.parse(dataEl.textContent);
}

XLZX.PAL_EXT = PAL_EXT;
XLZX.WHEELCHAIR = WHEELCHAIR;
XLZX.CRUTCH = CRUTCH;
XLZX.ZHOUHANG = ZHOUHANG;
XLZX.CHENJING = CHENJING;
XLZX.BAG = BAG;
XLZX.REFERRAL = REFERRAL;
XLZX.TISSUE = TISSUE;
XLZX.LINYUE = LINYUE;
XLZX.LINYUE_SEATED = LINYUE_SEATED;
XLZX.XUYUAN_SEATED = XUYUAN_SEATED;
XLZX.CRUTCH_PAIR = CRUTCH_PAIR;
XLZX.COUNSELOR = COUNSELOR;
XLZX.CHARS = CHARS;
XLZX.CLOCK_VARIANTS = CLOCK_VARIANTS;
XLZX.WARMTH = WARMTH;

