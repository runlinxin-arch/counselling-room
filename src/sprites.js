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

};

// 轮椅（14 × 17）：大轮 + 小前轮 + 脚踏 + 推手。
// 关键：**大轮要有浅色轮辋（s）**。全用深色框（D）的话，轮子会糊进沙发和地板的暗部，
// 整把椅子就只剩一个悬空的小前轮，看起来像画错了。
// 轮辐之间留空，让墙和地板透过轮子——读起来才是个"轮"。
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
  client: { chair: WHEELCHAIR, chairX: 51, chairY: 34, body: LINYUE, bodyX: 63, bodyY: 33 },
  // 咨询师：左边那把（sofaL 在 x=20，坐垫 x=27–36），朝向画面右
  counselor: { body: COUNSELOR, bodyX: 25, bodyY: 31 },
};

// 钟针的时段变体。方案 B 的钟是「两点十分」，这里补另外两节要的时间。
// 钟 9×9，圆心在 (4,4)。
const CLOCK_VARIANTS = {
  // 第 1 节 14:10 —— 分针指 2，时针刚过 2
  c1: [
    'GGGGGGGGG',
    'GiiiDiiiG',
    'GiiiDiiiG',
    'GiiiDiiiG',
    'GDiiDDDDG',
    'GiiiiiiiG',
    'GiiiiiiiG',
    'GiiiDiiiG',
    'GGGGGGGGG',
  ],
  // 第 2 节 14:05 —— 分针指 1，时针压在 2 正上
  c2: [
    'GGGGGGGGG',
    'GiiiDiiiG',
    'GiiiDiiiG',
    'GiDiDiiiG',
    'GiiDDiiDG',
    'GiiiiiiiG',
    'GiiiiiiiG',
    'GiiiDiiiG',
    'GGGGGGGGG',
  ],
  // 第 3 节 13:50 —— 分针指 10，时针快到 2
  c3: [
    'GGGGGGGGG',
    'GiiiDiiiG',
    'GiiiDiiiG',
    'GDiipiiiG',
    'GDiiDiiiG',
    'GiiiiiiiG',
    'GiiiiiiiG',
    'GiiiDiiiG',
    'GGGGGGGGG',
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
XLZX.REFERRAL = REFERRAL;
XLZX.TISSUE = TISSUE;
XLZX.LINYUE = LINYUE;
XLZX.COUNSELOR = COUNSELOR;
XLZX.CHARS = CHARS;
XLZX.CLOCK_VARIANTS = CLOCK_VARIANTS;
XLZX.WARMTH = WARMTH;

