// ============================================================================
// 内容数据 · 故事线 0：许予安（v2 唯一一条线）
// ----------------------------------------------------------------------------
// 正本：docs/story/故事线0-许予安.md（人物 / 前史 / 三节要求 / 红线自查）
// 这里只做三件事：拆行、挂跳转、挂科普卡。台词的问题在正本里改，改完再同步过来。
//
// 引擎只认识 say / choice / diary / card / result 五种节点，不认识「下肢功能障碍」。
// 主线是**伤残适应**，不是「治愈霸凌创伤」。霸凌是前史，不是这一次咨询要解决的问题。
//
// 核心洞察（写台词时别丢）：隐瞒霸凌和拒绝照顾是同一件事的两面——
// 都不能让别人看见我弱。
// ============================================================================

var XLZX = (typeof window !== 'undefined' && window.XLZX) || {};
if (typeof window !== 'undefined') window.XLZX = XLZX;

// ---------------------------------------------------------------------------
// 第 1 节 · 第一次见面
// ---------------------------------------------------------------------------
const XU_S1 = {
  // ---- 开场 ----
  'n1': {
    type: 'say', who: '旁白', act: 1, warmth: 1,
    text: '他比约定时间早到了十分钟。坐得很直，两只手放在膝盖上，双拐靠在沙发扶手上。',
    next: 'n2',
  },
  'n2': { type: 'say', who: '旁白', text: '看见你进来，他要站起来。', next: 'n3' },
  'n3': { type: 'say', who: '咨询师', text: '不用起来，坐着说就行。', next: 'n4' },
  'n4': { type: 'say', who: '许予安', text: '……哦。', next: 'c1' },

  // ---- 选项 1：开场白 ----
  'c1': {
    type: 'choice',
    prompt: '先说什么',
    options: [
      { key: 'A', label: '转介单上写着「不太愿意说话」，是这样吗？', next: 'a1', flag: 'openA' },
      { key: 'B', label: '我是这儿的心理咨询师。你想从哪儿说起都行。', next: 'b1', flag: 'openB' },
      { key: 'C', label: '最近怎么样？', next: 'd1', flag: 'openC' },
    ],
  },
  'a1': { type: 'say', who: '许予安', text: '……我不是不愿意说话。', next: 'a2' },
  'a2': { type: 'say', who: '许予安', text: '是没什么好说的。', next: 'a3' },
  'a3': {
    type: 'say', note: { kind: 'supervision' },
    text: '转介单上那句是别人写的判断。你一上来就复述它，他就得先花力气反驳那句话，而不是说自己的事。',
    next: 'setup1',
  },

  'b1': { type: 'say', who: '许予安', text: '都行。', next: 'b2' },
  'b2': { type: 'say', who: '许予安', text: '（停了一下）我也不知道该说啥。', next: 'b3' },
  'b3': {
    type: 'say', note: { kind: 'supervision' },
    text: '「不知道说啥」不是拒绝，是等你先开口。这时候别急着替他把话填满。',
    next: 'setup1',
  },

  'd1': { type: 'say', who: '许予安', text: '挺好的。', next: 'd2' },
  'd2': {
    type: 'say', note: { kind: 'supervision' },
    text: '第一次见面问「怎么样」，一般只能换回「挺好的」。他给你的是安全答案。',
    next: 'setup1',
  },

  // ---- 保密设置 ----
  'setup1': {
    type: 'say', who: '咨询师',
    text: '那我先说这儿是怎么弄的。两三分钟，你听完再决定要不要接着聊。',
    next: 'setup2',
  },
  'setup2': { type: 'say', who: '咨询师', text: '一次五十分钟。你说的话我保密。', next: 'setup3' },
  'setup3': {
    type: 'say', who: '咨询师',
    text: '但有例外。你要是说到想伤害自己或者别人，那我不能瞒着，得做点事。真到那一步，我会先跟你说一声，不会背着你弄。',
    next: 'setup4',
  },
  'setup4': {
    type: 'say', who: '咨询师',
    text: '还有，哪个问题你不想答，直接说「这个不聊」就行。不影响。',
    next: 'c2',
  },
  'c2': {
    type: 'choice',
    prompt: '说完设置之后',
    options: [
      { key: 'A', label: '听明白了吗？', next: 'c2a1' },
      { key: 'B', label: '这里面有哪条，你想再问细点？', next: 'c2b1', flag: 'askedBoundary' },
      { key: 'C', label: '那咱说说，你最近都在忙什么？', next: 'c2c1' },
    ],
  },
  'c2a1': { type: 'say', who: '许予安', text: '嗯。', next: 'c2a2' },
  'c2a2': {
    type: 'say', note: { kind: 'supervision' },
    text: '他答「嗯」，但你没确认他到底听懂没有。保密例外是拉近关系的东西，不是免责声明。',
    next: 'room1',
  },
  'c2b1': { type: 'say', who: '许予安', text: '（停了停）那个……「做点事」是啥意思？', next: 'c2b2' },
  'c2b2': { type: 'say', who: '咨询师', text: '看情况。要是有危险，可能得让人过来一趟。', next: 'c2b3' },
  'c2b3': { type: 'say', who: '许予安', text: '……告诉我爸妈？', next: 'c2b4' },
  'c2b4': { type: 'say', who: '咨询师', text: '不一定。但不管做啥，我会先跟你说。', next: 'c2b5' },
  'c2b5': { type: 'say', who: '许予安', text: '……行。', next: 'c2b6' },
  'c2b6': {
    type: 'say', note: { kind: 'supervision' },
    text: '他问的是边界。问出来，说明他听进去了，也说明他在考虑「要不要跟这个人说实话」。',
    next: 'room1',
  },
  'c2c1': {
    type: 'say', note: { kind: 'supervision' },
    text: '跳过设置直接往下：你还不知道他听懂了没有。这条以后会回来找你。',
    next: 'room1',
  },

  // ---- 房间可点 ----
  'room1': {
    type: 'say', who: '旁白',
    text: '房间里几样东西，箭头标出了它们是干什么用的。',
    allowItems: ['referral', 'tissue', 'clock', 'sofa'],
    next: 'v1',
  },

  // ---- 车祸：他主动提，但只提「还记得」的那部分 ----
  // 这一段是本节的骨：他能说的只有事故，说不出的都在事故之前。
  'v1': {
    type: 'say', who: '旁白',
    text: '他把拐杖往身边挪了挪，忽然开口。',
    next: 'v2',
  },
  'v2': { type: 'say', who: '许予安', text: '那天的事……我记不太清了。', next: 'v3' },
  'v3': { type: 'say', who: '许予安', text: '就记得很响。还有地上很烫。', next: 'v4' },
  'v4': { type: 'say', who: '许予安', text: '（停了停）我是不是该从头说说？', next: 'cv' },
  'cv': {
    type: 'choice',
    prompt: '他把话头递过来了',
    options: [
      { key: 'A', label: '那就说说你还记得的部分。', next: 'va1', flag: 'crashParts' },
      { key: 'B', label: '「记不清」是当时就模糊，还是后来想不起来？', next: 'vb1', flag: 'crashMemory' },
      { key: 'C', label: '不记得也没关系。', next: 'vc1', flag: 'crashSkip' },
    ],
  },
  'va1': { type: 'say', who: '许予安', text: '我记得我躺着。有人在喊，喊什么听不清。', next: 'va2' },
  'va2': { type: 'say', who: '许予安', text: '后来就是在医院了，中间啥也没有。', next: 'va3' },
  'va3': {
    type: 'say', note: { kind: 'supervision' },
    text: '他记得声音、记得地上烫、记得躺着——不记得前因。这不是回避，创伤后的记忆本来就是碎的。',
    next: 'vd',
  },
  'vb1': { type: 'say', who: '许予安', text: '（想了想）当时就是糊的。', next: 'vb2' },
  'vb2': { type: 'say', who: '许予安', text: '后来我妈跟我讲了好几遍，我才知道那天我走到马路中间去了。', next: 'vb3' },
  'vb3': {
    type: 'say', note: { kind: 'supervision' },
    text: '「我妈讲了好多遍」——他对那天的记忆是别人转述的。这很常见，也很要紧：他手上没有自己的版本。',
    next: 'vd',
  },
  'vc1': { type: 'say', who: '许予安', text: '……嗯。', next: 'vc2' },
  'vc2': {
    type: 'say', note: { kind: 'supervision' },
    text: '「没关系」把门关上了，但没锁。后面还能再敲一次，只是别在这儿敲。',
    next: 'vd',
  },
  'vd': {
    type: 'say', who: '旁白',
    text: '他讲住院、讲手术、讲第一次下地。语气很平，像在说别人的事。',
    next: 've',
  },
  've': { type: 'say', who: '许予安', text: '就这样。', next: 'vf' },
  'vf': {
    type: 'say', note: { kind: 'supervision' },
    text: '他把整件事说成了一份经过。你听不到一句「我难受」——第一次见面，这很正常，别急着要。',
    next: 'sc1',
  },
  'sc1': {
    type: 'card', kind: 'science',
    title: '伤后的情绪反应，不是「心理素质差」',
    lines: [
      '车祸之后睡不好、不想说话、什么都不想干，是最常见的反应之一，不是意志力的问题。',
      '把它说成「心理素质差」，会让人多背一层耻感：已经够难受了，还得为难受道歉。',
      '情绪反应和身体恢复不是两条赛道。它本来就属于康复的一部分。',
    ],
    footer: '依据：第 5 章',
    button: '知道了',
    next: 'e1',
  },

  // ---- 他把话题带回「什么时候能回去上课」----
  'e1': {
    type: 'say', who: '许予安',
    text: '那个……我想问一下，我什么时候能回去上课？',
    next: 'e2',
  },
  'e2': { type: 'say', who: '旁白', text: '这是他进门以后，第一次主动开口问事。', next: 'c3' },
  'c3': {
    type: 'choice',
    prompt: '他把话题带到了「回去上课」',
    options: [
      { key: 'A', label: '先接住：你很想回去。', next: 'f1', flag: 'joinHim' },
      { key: 'B', label: '你为什么这么急着回去？', next: 'g1', flag: 'askWhy' },
      { key: 'C', label: '你从头到尾只问了这一件事。', next: 'h1', flag: 'naming' },
    ],
  },
  'f1': { type: 'say', who: '许予安', text: '……嗯。', next: 'f2' },
  'f2': { type: 'say', who: '许予安', text: '在家待着也没事干。', next: 'f3' },
  'f3': {
    type: 'say', note: { kind: 'supervision' },
    text: '先接住再谈，他才会往下说。「没事干」这三个字后面藏着东西。',
    next: 'i1',
  },
  'g1': { type: 'say', who: '许予安', text: '（很快）就是……快期末了。', next: 'g2' },
  'g2': { type: 'say', who: '许予安', text: '落太多补不回来。', next: 'g3' },
  'g3': {
    type: 'say', note: { kind: 'supervision' },
    text: '他答得很快。太快了——这是准备好的答案，不是想出来的答案。',
    next: 'i1',
  },
  'h1': { type: 'say', who: '许予安', text: '……', next: 'h2' },
  'h2': { type: 'say', who: '许予安', text: '我就想问这个。', next: 'h3' },
  'h3': {
    type: 'say', note: { kind: 'supervision' },
    text: '你说得没错，但他听见的是「你被看穿了」。第一次见面就点破，关系容易僵。',
    next: 'i1',
  },

  // ---- 谁在照顾他 ----
  'i1': {
    type: 'say', who: '咨询师',
    text: '这段在家，谁照顾你？',
    next: 'i2',
  },
  'i2': { type: 'say', who: '许予安', text: '我妈。', next: 'c4' },
  'c4': {
    type: 'choice',
    prompt: '他答得很快',
    options: [
      { key: 'A', label: '再问一句：还有别人吗？', next: 'j1', flag: 'pushSecond' },
      { key: 'B', label: '从具体事问：早饭是谁做的？', next: 'j4', flag: 'concrete' },
      { key: 'C', label: '不追了，回到学校的话题。', next: 'j6', flag: 'letGo' },
    ],
  },
  'j1': { type: 'say', who: '许予安', text: '……', next: 'j2' },
  'j2': { type: 'say', who: '许予安', text: '还有个阿姨。', next: 'j3' },
  'j3': {
    type: 'say', note: { kind: 'supervision' },
    text: '他说「我妈」的时候没停顿，说「阿姨」之前停了一下。停顿的位置比话本身有用。',
    next: 'j7',
  },
  'j4': { type: 'say', who: '许予安', text: '（愣了一下）早饭……阿姨做。', next: 'j5' },
  'j5': {
    type: 'say', note: { kind: 'supervision' },
    text: '问具体的事，比问人管用。他答「阿姨」的时候，没有先想「该不该说」。',
    next: 'j7',
  },
  'j6': {
    type: 'say', note: { kind: 'supervision' },
    text: '他有一个回答卡在那儿，你没接。下次再问到，多半还卡在那儿。',
    next: 'j7',
  },
  'j7': {
    type: 'say', who: '咨询师',
    text: '这个阿姨，是家里的亲戚吗？',
    next: 'c5',
  },

  // ---- 李阿姨 ----
  'c5': {
    type: 'choice',
    prompt: '他不太想接这句',
    options: [
      { key: 'A', label: '等她是谁这件事，先放着。', next: 'k1', flag: 'holdAunt' },
      { key: 'B', label: '追问：她在这儿多久了？', next: 'k2', flag: 'pushAunt' },
    ],
  },
  'k1': {
    type: 'say', who: '许予安', text: '……不是亲戚。',
    next: 'k1b',
  },
  'k1b': {
    type: 'say', who: '许予安', text: '她在我家做保洁。',
    next: 'k3',
  },
  'k2': { type: 'say', who: '许予安', text: '好几年了吧。', next: 'k2b' },
  'k2b': { type: 'say', who: '许予安', text: '我不太清楚。', next: 'k3' },
  'k3': {
    type: 'say', note: { kind: 'supervision' },
    text: '「她在我家做保洁」——他把人和身份放在一起说的。这个顺序，后面还会出现。',
    next: 'm1',
  },

  // ---- 收尾 ----
  'm1': { type: 'say', who: '咨询师', text: '今天快到了。下礼拜这个时间，再来一次？', next: 'm2' },
  'm2': { type: 'say', who: '许予安', text: '行。', next: 'm3' },
  'm3': { type: 'say', who: '旁白', text: '他看了一眼墙上的钟，又收回去。', next: 'm4' },
  'm4': {
    type: 'say', note: { kind: 'supervision' },
    text: '他答应得太快了，还先看了一眼钟。快得像在敷衍——这是「配合」，不是「愿意」。',
    next: 'sc2',
  },
  'sc2': {
    type: 'card', kind: 'science',
    title: '「适应」不是只有一条路',
    lines: [
      '不是所有人都会走同一条路。追踪研究里最常见的是「良好适应」——多数人在一段时间后恢复功能与情绪。',
      '也有一部分人出现持续的抑郁，一部分人是延迟发作，还有一部分落在其他形式上。',
      '所以「什么时候能好」这个问题本身就有毛病：它假设只有一条轨道，而你必须走在上面。',
    ],
    footer: '依据：第 5 章',
    button: '知道了',
    next: 'hw1',
  },

  // ---- 留作业 ----
  'hw1': {
    type: 'say', who: '咨询师',
    text: '给你留个小东西，不用给谁看。',
    next: 'hw2',
  },
  'hw2': {
    type: 'say', who: '咨询师',
    text: '记一下每天什么时候最难受。一句话就行，写手机上。',
    next: 'hw3',
  },
  'hw3': { type: 'say', who: '许予安', text: '记这干啥？', next: 'hw4' },
  'hw4': {
    type: 'say', who: '咨询师',
    text: '下回带来。我想知道什么时候、因为啥事，你最不好受。',
    next: 'hw5',
  },
  'hw5': {
    type: 'say', who: '许予安', text: '……行吧。',
    effect: 'unlockDiary',
    next: 's1end',
  },
  's1end': {
    type: 'say', who: '旁白',
    text: '他撑着拐站起来，走到门口。走廊里有个穿蓝色工作服的女人在等，见他出来，先把拐接了过去。',
    next: '@s2/n1',
  },
};
// ---------------------------------------------------------------------------
// 第 2 节 · 一周后
// ---------------------------------------------------------------------------
const XU_S2 = {
  'n1': {
    type: 'say', who: '旁白', act: 2, warmth: 2,
    text: '一周后。他迟到了几分钟。门口那个穿蓝色工作服的女人正低头跟他说什么，他没应。',
    next: 'n2',
  },
  'n2': { type: 'say', who: '李阿姨', text: '……那你好好跟医生说。啊？', next: 'n3' },
  'n3': { type: 'say', who: '许予安', text: '知道了。', next: 'n4' },
  'n4': { type: 'say', who: '旁白', text: '他进来把拐靠在沙发上，比上次放得响。', next: 'c1' },
  'c1': {
    type: 'choice',
    prompt: '今天从哪儿开始',
    options: [
      { key: 'A', label: '今天路上不太顺？', next: 'a1', flag: 'warmOpen' },
      { key: 'B', label: '先说说这一周吧。', next: 'b1', flag: 'plainOpen' },
      { key: 'C', label: '门口那位，是李阿姨吧。', next: 'c1x', flag: 'nameAunt' },
    ],
  },
  'a1': { type: 'say', who: '许予安', text: '……没什么。', next: 'a2' },
  'a2': { type: 'say', who: '许予安', text: '她每天都要在门口说一遍。', next: 'a3' },
  'a3': {
    type: 'say', note: { kind: 'supervision' },
    text: '他从「没什么」自己走到了「她每天都要说」。接住情绪，话会自己往外走。',
    next: 'i1',
  },
  'b1': { type: 'say', who: '许予安', text: '还行吧。', next: 'b2' },
  'b2': { type: 'say', who: '许予安', text: '（顿了顿）在家也没啥事。', next: 'b3' },
  'b3': {
    type: 'say', note: { kind: 'supervision' },
    text: '「还行吧」后面那个「没啥事」，是他自己递出来的线头。',
    next: 'i1',
  },
  'c1x': { type: 'say', who: '许予安', text: '嗯。', next: 'c1y' },
  'c1y': { type: 'say', who: '许予安', text: '她今天非要跟上来。', next: 'c1z' },
  'c1z': {
    type: 'say', note: { kind: 'supervision' },
    text: '你一提阿姨，他先说的是「她非要跟上来」——他在替这件事找解释。',
    next: 'i1',
  },

  // ---- 主线事件：阿姨当着他的面说他「晚上不睡」----
  'i1': { type: 'say', who: '旁白', text: '门被轻轻敲了一下。李阿姨端着一杯水进来。', next: 'i2' },
  'i2': {
    type: 'say', who: '李阿姨',
    text: '老师，我说一句就走。他这阵子晚上不睡，屋里灯亮到一两点。您说说他。',
    next: 'i3',
  },
  'i3': { type: 'say', who: '许予安', text: '你能不能别说了。', next: 'i4' },
  'i4': { type: 'say', who: '许予安', text: '我说了别说了！', next: 'c2' },
  'c2': {
    type: 'choice',
    prompt: '这一下他炸了',
    options: [
      { key: 'A', label: '先护住他：阿姨，这些咱回头单独说。', next: 'e1', flag: 'shieldBoy' },
      { key: 'B', label: '先接住阿姨：您先坐，您也辛苦。', next: 'e4', flag: 'shieldAunt' },
      { key: 'C', label: '先不介入，让他们自己说。', next: 'e6', flag: 'stepBack' },
    ],
  },
  'e1': { type: 'say', who: '李阿姨', text: '……诶，好，好。', next: 'e2' },
  'e2': { type: 'say', who: '旁白', text: '门关上了。', next: 'e3' },
  'e3': {
    type: 'say', note: { kind: 'supervision' },
    text: '你把他护在身后。这一下他松了一口气，但也把「说真话的人」推了出去。回头得把这一层补回来。',
    next: 'f1',
  },
  'e4': { type: 'say', who: '李阿姨', text: '我不坐，我不坐。我就说这一句。', next: 'e5' },
  'e5': {
    type: 'say', note: { kind: 'supervision' },
    text: '你先接住了照顾者的辛苦。可当着孩子的面认下阿姨的功劳，等于在他那儿记一笔「你不对」。',
    next: 'f1',
  },
  'e6': { type: 'say', who: '旁白', text: '两个人又顶了几句。她退出去，把门带上。', next: 'e6b' },
  'e6b': {
    type: 'say', note: { kind: 'supervision' },
    text: '不介入，冲突会自己结束——但结束的方式是「她让步」。他学到的还是「我发火管用」。',
    next: 'f1',
  },
  'f1': { type: 'say', who: '旁白', text: '他坐回去，胸口起伏得厉害，手握在拐杖横杆上。', next: 'f2' },
  'f2': { type: 'say', who: '许予安', text: '她又不是我妈。', next: 'f3' },
  'f3': { type: 'say', who: '许予安', text: '凭什么管我这些。', next: 'c3' },
  'c3': {
    type: 'choice',
    prompt: '「她又不是我妈」',
    options: [
      { key: 'A', label: '她照顾你多久了？', next: 'g1', flag: 'askHistory' },
      { key: 'B', label: '她管你这些，让你什么感觉？', next: 'g3', flag: 'askFeeling' },
      { key: 'C', label: '（不接，等一会儿）', next: 'g5', flag: 'silence' },
    ],
  },
  'g1': { type: 'say', who: '许予安', text: '好几年了。', next: 'g2' },
  'g2': { type: 'say', who: '许予安', text: '我小时候她就在。', next: 'g4' },
  'g3': { type: 'say', who: '许予安', text: '……烦。', next: 'g3b' },
  'g3b': { type: 'say', who: '许予安', text: '不是那种烦。', next: 'g4' },
  'g5': { type: 'say', who: '许予安', text: '（很久）……她昨天给我擦身的时候，我让她出去。', next: 'g6' },
  'g6': {
    type: 'say', note: { kind: 'supervision' },
    text: '你什么都没说，他自己交出了最难开口的那一段。沉默不是空转，是留位子。',
    next: 'g4',
  },
  'g4': {
    type: 'say', who: '许予安',
    text: '……她对我挺好的。',
    next: 'g4b',
  },
  'g4b': { type: 'say', who: '许予安', text: '我刚才是不是挺过分的。', next: 'c4' },
  'c4': {
    type: 'choice',
    prompt: '他自己开始自责了',
    options: [
      { key: 'A', label: '你刚才是生气，不是嫌她。', next: 'h1', flag: 'separate' },
      { key: 'B', label: '你对别人都能客气，就对她不行。', next: 'h3', flag: 'confront' },
      { key: 'C', label: '她不是家人，你却天天得靠她。', next: 'h4', flag: 'nameBoth' },
    ],
  },
  'h1': { type: 'say', who: '许予安', text: '……有区别吗。', next: 'h2' },
  'h2': { type: 'say', who: '咨询师', text: '有。生气是「你别管我」，嫌是「你别存在」。你刚才想说的是前一句。', next: 'h5' },
  'h3': { type: 'say', who: '许予安', text: '……', next: 'h3b' },
  'h3b': { type: 'say', who: '许予安', text: '因为她天天在。', next: 'h3c' },
  'h3c': {
    type: 'say', note: { kind: 'supervision' },
    text: '这话说中了，但他听见的是「你不好」。说对了不等于说进去。',
    next: 'h5',
  },
  'h4': { type: 'say', who: '许予安', text: '（抬头看你）', next: 'h4b' },
  'h4b': { type: 'say', who: '许予安', text: '……你怎么知道。', next: 'h5' },
  'h5': {
    type: 'say', note: { kind: 'supervision' },
    text: '他把「我需要人」和「我很惨」绑成了一件事。这个结，是这条线要解的东西。',
    next: 'w6',
  },

  // ---- 阿姨也是个人 ----
  'w6': { type: 'say', who: '旁白', text: '门外传来一声塑料凳子挪动的响。她在外面坐着。', next: 'w7' },
  'w7': { type: 'say', who: '许予安', text: '……她孩子还在老家。', next: 'cw' },
  'cw': {
    type: 'choice',
    prompt: '他自己提了一句',
    options: [
      { key: 'A', label: '她跟你提过？', next: 'w1', flag: 'auntStory' },
      { key: 'B', label: '你想过她也不容易吗？', next: 'w3', flag: 'auntGuilt' },
      { key: 'C', label: '（不接，等他往下说）', next: 'w5', flag: 'auntWait' },
    ],
  },
  'w1': { type: 'say', who: '许予安', text: '提过一次。说一年见一回。', next: 'w2' },
  'w2': {
    type: 'say', note: { kind: 'supervision' },
    text: '「一年见一回」这句他记得。说明他听过，也说明这句话在他那儿放着没扔。',
    next: 'x1',
  },
  'w3': { type: 'say', who: '许予安', text: '（很快）我不用她可怜。', next: 'w4' },
  'w4': {
    type: 'say', note: { kind: 'supervision' },
    text: '「可怜」是他自己加的词，阿姨没这么说过。他在替她说话，也在替自己防守。',
    next: 'x1',
  },
  'w5': { type: 'say', who: '许予安', text: '（很久）她其实挺累的。', next: 'w5b' },
  'w5b': {
    type: 'say', note: { kind: 'supervision' },
    text: '他第一个说出来的不是「她可怜」，是「她累」。这一句里没有他自己——所以他敢说。',
    next: 'x1',
  },

  // ---- 核心洞察：被照顾＝被看见＝被确认很惨 ----
  'x1': { type: 'say', who: '咨询师', text: '你怕的好像不是她照顾你。', next: 'x2' },
  'x2': { type: 'say', who: '咨询师', text: '是她看见你需要照顾。', next: 'x3' },
  'x3': { type: 'say', who: '许予安', text: '……', next: 'x4' },
  'x4': { type: 'say', who: '许予安', text: '（很小声）那样我就……', next: 'x5' },
  'x5': {
    type: 'say', note: { kind: 'supervision' },
    text: '他没说完。这句半截话就是这条线的骨。别替他说完，也别忘了它。',
    next: 'diary',
  },

  // ---- 情绪日记 ----
  'diary': {
    type: 'diary',
    title: '情绪日记 · 许予安的手机备忘录',
    hint: '点开看看他都记了什么',
    entries: [
      {
        id: 'mon', day: '周一',
        lines: ['晚上最难熬。', '白天有人来，晚上没人。', '灯不敢关。'],
        note: '他把「难受」和「一个人」绑在一起了。',
      },
      {
        id: 'wed', day: '周三',
        lines: ['阿姨要给我擦身。', '我说我自己来。', '她站门口没走。'],
        note: '拒绝帮忙的那一刻，他记下来了。',
      },
      {
        id: 'fri', day: '周五',
        lines: ['班级群在说春游。', '没人问我。', '我也不想去。'],
        note: '「没人问我」和「我也不想去」之间有个空档。',
      },
      {
        id: 'sun', day: '周日',
        lines: ['今天挺好的。', '一天没出屋。'],
        note: '这条最要紧。「挺好的」后面紧跟着「一天没出屋」。',
      },
    ],
    next: 'c5',
  },
  'c5': {
    type: 'choice',
    prompt: '先谈哪一条',
    hint: '四条都能谈，谈出来的东西不一样',
    options: [
      { key: 'A', label: '周一 · 「灯不敢关」', next: 'dm1' },
      { key: 'B', label: '周三 · 「她站门口没走」', next: 'dw1' },
      { key: 'C', label: '周五 · 「没人问我」', next: 'df1' },
      { key: 'D', label: '周日 · 「一天没出屋」', next: 'ds1' },
    ],
  },
  'dm1': { type: 'say', who: '许予安', text: '关了灯就……想事儿。', next: 'dm2' },
  'dm2': { type: 'say', who: '许予安', text: '开着灯能睡着。', next: 'dm3' },
  'dm3': {
    type: 'say', note: { kind: 'supervision' },
    text: '灯是他自己找的办法。先别急着改成「关灯」，先问「关了灯会想什么」。',
    next: 'sc3',
  },
  'dw1': { type: 'say', who: '许予安', text: '我不用她擦。', next: 'dw2' },
  'dw2': { type: 'say', who: '许予安', text: '……我主要是，不想让她看见。', next: 'dw3' },
  'dw3': {
    type: 'say', note: { kind: 'supervision' },
    text: '「不想让她看见」——不是嫌她脏，是嫌自己被看见。这条后面要接第 9 章的「看得见 / 看不见」。',
    next: 'sc3',
  },
  'df1': { type: 'say', who: '许予安', text: '春游我不去。', next: 'df2' },
  'df2': { type: 'say', who: '许予安', text: '去了也是坐着看别人跑。', next: 'df3' },
  'df3': {
    type: 'say', note: { kind: 'supervision' },
    text: '他把「没人问我」和「我不想去」写成同一件事。这两件事，得分开摆。',
    next: 'sc3',
  },
  'ds1': { type: 'say', who: '许予安', text: '一天没出屋，挺好的。', next: 'ds2' },
  'ds2': { type: 'say', who: '咨询师', text: '「挺好的」是这一天里最好的部分吗？', next: 'ds3' },
  'ds3': { type: 'say', who: '许予安', text: '……不是。', next: 'ds4' },
  'ds4': {
    type: 'say', note: { kind: 'supervision' },
    text: '他说「挺好的」，是因为没有更难听的说法。这是回避，不是满意。',
    next: 'sc3',
  },

  'sc3': {
    type: 'card', kind: 'science',
    title: '看不见的伤，和看得见的伤',
    lines: [
      '支具和拐是看得见的。看得见的障碍，很容易被当成「全部的你」。',
      '有些伤看不见：被起外号、被排挤、被当成笑话。它不流血，但每天都在。',
      '两种伤都会带来同一个动作——把自己藏起来。',
    ],
    footer: '依据：第 9 章',
    button: '知道了',
    next: 'j1',
  },

  // ---- 家庭 ----
  'j1': { type: 'say', who: '咨询师', text: '你爸妈这段时间，跟你说话多吗？', next: 'j2' },
  'j2': { type: 'say', who: '许予安', text: '多。', next: 'j3' },
  'j3': { type: 'say', who: '许予安', text: '太多了。', next: 'c6' },
  'c6': {
    type: 'choice',
    prompt: '「太多了」',
    options: [
      { key: 'A', label: '他们都问些什么？', next: 'k1', flag: 'askParents' },
      { key: 'B', label: '「太多了」是烦，还是别的？', next: 'k4', flag: 'askFeelParents' },
      { key: 'C', label: '他们是不是觉得，是自己没照顾好你？', next: 'k6', flag: 'nameGuilt' },
    ],
  },
  'k1': { type: 'say', who: '许予安', text: '问疼不疼，问吃了没，问要不要买个啥。', next: 'k2' },
  'k2': { type: 'say', who: '许予安', text: '一天问八百遍。', next: 'k3' },
  'k3': {
    type: 'say', note: { kind: 'supervision' },
    text: '他数的是次数，不是内容。反复问，说明他们自己也不安。',
    next: 'l1',
  },
  'k4': { type: 'say', who: '许予安', text: '……我也不知道。', next: 'k4b' },
  'k4b': { type: 'say', who: '许予安', text: '他们一问，我就得说「没事」。', next: 'k5' },
  'k5': {
    type: 'say', note: { kind: 'supervision' },
    text: '「我就得说没事」——他们的关心，成了他每天要做的一份工作。',
    next: 'l1',
  },
  'k6': { type: 'say', who: '许予安', text: '（很久）我妈哭过。', next: 'k6b' },
  'k6b': { type: 'say', who: '许予安', text: '半夜，以为我睡了。', next: 'k7' },
  'k7': {
    type: 'say', note: { kind: 'supervision' },
    text: '先说事实（她哭了），再说情绪，比替他们解释「愧疚」更有用。别抢在他前面下结论。',
    next: 'l1',
  },

  // ---- 收束 ----
  'l1': { type: 'say', who: '咨询师', text: '刚才你说了好几次「挺好的」。今天有没有哪件事，不是挺好的？', next: 'l2' },
  'l2': { type: 'say', who: '许予安', text: '……', next: 'l3' },
  'l3': { type: 'say', who: '许予安', text: '晚上关灯以后。', next: 'l4' },
  'l4': {
    type: 'say', note: { kind: 'supervision' },
    text: '这是他第一次说出比「挺好的」更具体的一句。记住这一刻，它是这一节的全部成绩。',
    next: 'sc4',
  },
  'sc4': {
    type: 'card', kind: 'science',
    title: '为什么「被人知道」比「被欺负」更难受',
    lines: [
      '青春期的核心任务之一，是在同伴里有一个位置。',
      '「被欺负」伤的是这个位置；「被知道」拿走的是这个位置——所有人都在看你，而你看不清自己是谁了。',
      '这解释了一件事：他宁可一个人扛，也不愿意让任何人知道。',
    ],
    footer: '依据：第 11 章',
    button: '知道了',
    next: 's2end',
  },
  's2end': {
    type: 'say', who: '旁白',
    text: '他起身的时候，把拐杖在地上点了两下才站稳。门外，那把蓝色的塑料凳子还在。',
    next: '@s3/n1',
  },
};
// ---------------------------------------------------------------------------
// 第 3 节 · 准备回学校
// ---------------------------------------------------------------------------
const XU_S3 = {
  'n1': {
    type: 'say', who: '旁白', act: 3, warmth: 3,
    text: '又过了一周。学校那边定了复学的日子，就在下周一。',
    next: 'n2',
  },
  'n2': { type: 'say', who: '旁白', text: '他今天进门的时候，拐杖在地上拖了一下才提起来。', next: 'n3' },
  'n3': { type: 'say', who: '咨询师', text: '下周一就回去了。你想先说点什么？', next: 'n4' },
  'n4': { type: 'say', who: '许予安', text: '……我不想去了。', next: 'c1' },
  'c1': {
    type: 'choice',
    prompt: '「我不想去了」',
    options: [
      { key: 'A', label: '不是都定好了吗？', next: 'a1', flag: 'pushBack' },
      { key: 'B', label: '「不想去」，是怕什么？', next: 'b1', flag: 'askFear' },
      { key: 'C', label: '（等一等，看他自己往下说）', next: 'c1x', flag: 'wait' },
    ],
  },
  'a1': { type: 'say', who: '许予安', text: '定好了也能不去。', next: 'a2' },
  'a2': { type: 'say', who: '许予安', text: '我请假就是了。', next: 'a3' },
  'a3': {
    type: 'say', note: { kind: 'supervision' },
    text: '你讲的是道理，他讲的是退路。先让他把「不想去」说出来，比把他按回去有用。',
    next: 'd1',
  },
  'b1': { type: 'say', who: '许予安', text: '……', next: 'b2' },
  'b2': { type: 'say', who: '许予安', text: '就是不想去。', next: 'b3' },
  'b3': {
    type: 'say', note: { kind: 'supervision' },
    text: '「怕什么」这个词太重，他接不住。先问「去了会怎么样」，比问「怕什么」容易入口。',
    next: 'd1',
  },
  'c1x': { type: 'say', who: '许予安', text: '（很久）……他们都已经知道了。', next: 'c1y' },
  'c1y': {
    type: 'say', note: { kind: 'supervision' },
    text: '你自己什么都没说，他把最难的那句交出来了。这就是上一节攒下的东西在起作用。',
    next: 'd1',
  },
  'd1': { type: 'say', who: '许予安', text: '他们都已经知道了。', next: 'd2' },
  'd2': { type: 'say', who: '旁白', text: '他说这句的时候没看你，眼睛盯着茶几上的纸巾盒。', next: 'c2' },
  'c2': {
    type: 'choice',
    prompt: '「他们都已经知道了」',
    options: [
      { key: 'A', label: '知道什么了？', next: 'e1', flag: 'askWhat' },
      { key: 'B', label: '知道了，会怎么样？', next: 'e2', flag: 'askSoWhat' },
      { key: 'C', label: '谁告诉他们的？', next: 'e3', flag: 'askWho' },
    ],
  },
  'e1': { type: 'say', who: '许予安', text: '我以前在学校……被整过。', next: 'e1b' },
  'e1b': { type: 'say', who: '许予安', text: '一年多了。', next: 'e1c' },
  'e1c': {
    type: 'say', note: { kind: 'supervision' },
    text: '「被整过」是他自己的说法。别急着替他换成「霸凌」——那个词归他，不归你。',
    next: 'f1',
  },
  'e2': { type: 'say', who: '许予安', text: '他们会看我。', next: 'e2b' },
  'e2b': { type: 'say', who: '许予安', text: '看我这样。', next: 'e2c' },
  'e2c': {
    type: 'say', note: { kind: 'supervision' },
    text: '他怕的不是再被打，是被看见。这条线走到这里，第一句真话才算出来。',
    next: 'f1',
  },
  'e3': { type: 'say', who: '许予安', text: '我妈说的。', next: 'e3b' },
  'e3b': { type: 'say', who: '许予安', text: '她跟老师说，让他们注意点。', next: 'e3c' },
  'e3c': {
    type: 'say', note: { kind: 'supervision' },
    text: '妈妈想保护他，做法是让所有人都知道。保护和暴露，在他这里是同一件事。',
    next: 'f1',
  },
  'f1': { type: 'say', who: '许予安', text: '以前他们就是打我几下，推我几下。', next: 'f2' },
  'f2': { type: 'say', who: '许予安', text: '现在全校都知道我被……都知道我这样了。', next: 'f3' },
  'f3': {
    type: 'say', note: { kind: 'supervision' },
    text: '「被打几下」他能忍，「都知道」他忍不了。这两件事的分量，他心里的排序和大人想的不一样。',
    next: 'f4',
  },
  'f4': { type: 'say', who: '许予安', text: '他们肯定会看我走路。', next: 'f5' },
  'f5': { type: 'say', who: '许予安', text: '我们班有个男生，学人走路学得可像了。', next: 'f6' },
  'f6': {
    type: 'say', note: { kind: 'supervision' },
    text: '他把最怕的东西说成了一个画面：有人学他走路。画面比「我怕」好接，也好办。',
    next: 'g1',
  },
  'g1': { type: 'say', who: '咨询师', text: '这段时间，你心里有没有特别沉的时候？', next: 'g2' },
  'g2': { type: 'say', who: '许予安', text: '……有。', next: 'c3' },

  // ---- 危机筛查（写死分支）----
  'c3': {
    type: 'choice',
    prompt: '要不要往下问一句',
    hint: '这一句得问。问得不好可以练，不问就没有下一句。',
    options: [
      { key: 'A', label: '我问得直接一点：有没有想过，活着没什么意思？', next: 'cb1', flag: 'screened' },
      { key: 'B', label: '今天先不问这个。', next: 'sk1', flag: 'skipScreen' },
    ],
  },
  'cb1': {
    type: 'say', who: '许予安', text: '……',
    effect: 'crisis',
    next: 'cb2',
  },
  'cb2': { type: 'say', who: '许予安', text: '不是想死。', next: 'cb3' },
  'cb3': { type: 'say', who: '许予安', text: '就是有时候过马路，会想，要是撞上来会怎么样。', next: 'cb4' },
  'cb4': {
    type: 'say', note: { kind: 'supervision' },
    text: '被动意念：他没想死，他只是不太在乎会不会出事。这一句必须当真，也必须不慌。',
    next: 'cb5',
  },
  'cb5': { type: 'say', who: '咨询师', text: '谢谢你告诉我。这个我不会假装没听见。', next: 'cbCard' },
  'cbCard': {
    scene: 'hallway',
    type: 'card', kind: 'resource',
    title: '如果你或你身边的人正在经历这些',
    lines: [
      '全国心理援助热线：12356（国家卫健委统一号码）',
      '北京心理危机研究与干预中心：010-82951332',
      '如果存在立即的危险，请拨打 120，或直接前往最近的急诊。',
    ],
    footer: '这不是「小题大做」。打这个电话的人，每天都在打。',
    button: '知道了',
    next: 'cb6',
  },
  'cb6': { scene: 'hallway', type: 'say', who: '旁白', text: '走廊里没有人。饮水机在响。', next: 'cb7' },
  'cb7': { scene: 'hallway', type: 'say', who: '许予安', text: '你别告诉我爸妈。', next: 'c4' },

  // ---- 保密例外怎么处理 ----
  'c4': {
    type: 'choice',
    prompt: '「你别告诉我爸妈」',
    options: [
      { key: 'A', label: '我不能全答应你。有件事我要跟他们谈。', next: 'm1', flag: 'honest' },
      { key: 'B', label: '先答应他，回头再想。', next: 'm3', flag: 'promise' },
      { key: 'C', label: '让你爸妈下次一起来，咱们一块说。', next: 'm4', flag: 'family' },
    ],
  },
  'm1': { type: 'say', who: '许予安', text: '……你就不能不说吗。', next: 'm2' },
  'm2': { type: 'say', who: '咨询师', text: '不能。但我可以做到三件事：先告诉你，跟你一起说，只说该说的。', next: 'm2b' },
  'm2b': { type: 'say', who: '许予安', text: '……', next: 'm2c' },
  'm2c': {
    type: 'say', note: { kind: 'supervision' },
    text: '保密例外不是背着他做决定，是提前告诉他你会做什么。他被瞒过太多次了。',
    next: 'm6',
  },
  'm3': { type: 'say', who: '许予安', text: '……那你别说。', next: 'm3b' },
  'm3b': {
    type: 'say', note: { kind: 'supervision' },
    text: '你答应了做不到的事。下次他再开口之前，会先想起这一次。',
    next: 'm6',
  },
  'm4': { type: 'say', who: '许予安', text: '不要。', next: 'm5' },
  'm5': { type: 'say', who: '许予安', text: '他们一来，就变成他们的事了。', next: 'm5b' },
  'm5b': {
    type: 'say', note: { kind: 'supervision' },
    text: '「他们一来就变成他们的事了」——他要的是自己还留在场。让他选怎么开口，比替他开口管用。',
    next: 'm6',
  },

  // ---- 不问的那条路 ----
  'sk1': {
    type: 'say', who: '许予安', text: '……',
    effect: 'markScreenMissed',
    next: 'sk2',
  },
  'sk2': {
    type: 'say', note: { kind: 'supervision' },
    text: '你没问。这不扣分，也不代表你做错了什么。但他刚才那个「有」字，就留在这儿了。',
    next: 'm6',
  },

  // ---- 收束 ----
  'm6': { type: 'say', who: '咨询师', text: '下周一，不管你去不去，我都在这儿。', next: 'm7' },
  'm7': { type: 'say', who: '许予安', text: '……嗯。', next: 'm8' },
  'm8': { type: 'say', who: '咨询师', text: '那次放学，你愿意下次跟我说说吗？', next: 'm9' },
  'm9': { type: 'say', who: '许予安', text: '（很久）……下次吧。', next: 'm10' },
  'm10': {
    type: 'say', note: { kind: 'supervision' },
    text: '「下次吧」不是答应，但它不是「不」。这一节到这里就够了。',
    next: 'sc5',
  },

  'sc5': {
    type: 'card', kind: 'science',
    title: '照顾你的人，和被照顾的你',
    lines: [
      '照顾者和被照顾者之间，位置是不对等的。这跟爱不爱没有关系。',
      '被照顾的一方常常要付出另一种劳动：管住对方的情绪，证明自己没事。',
      '所以「接受照顾」不是一件软弱的事。它需要练习，也需要边界。',
    ],
    footer: '依据：第 12 章',
    button: '知道了',
    next: 'p1',
  },

  // ---- 复学怎么落地：把「回不回」换成「怎么回」----
  'p1': { type: 'say', who: '咨询师', text: '回去那天，你想怎么安排？', next: 'p2' },
  'p2': { type: 'say', who: '许予安', text: '……安排？', next: 'cp' },
  'cp': {
    type: 'choice',
    prompt: '他要的是一句具体的话，不是鼓励',
    options: [
      { key: 'A', label: '先上半天，撑不住就走。', next: 'p1a', flag: 'planHalf' },
      { key: 'B', label: '让家里送到校门口，别送进去。', next: 'p1b', flag: 'planDoor' },
      { key: 'C', label: '我陪你去一趟？', next: 'p1c', flag: 'planMe' },
    ],
  },
  'p1a': { type: 'say', who: '许予安', text: '……半天啊。', next: 'p1a2' },
  'p1a2': { type: 'say', who: '许予安', text: '半天好像行。', next: 'p3' },
  'p1b': { type: 'say', who: '许予安', text: '（很快）别送进去。', next: 'p1b2' },
  'p1b2': { type: 'say', who: '许予安', text: '就路口放下就行。', next: 'p3' },
  'p1c': { type: 'say', who: '许予安', text: '……你去干嘛。', next: 'p1c2' },
  'p1c2': {
    type: 'say', note: { kind: 'supervision' },
    text: '「我陪你去」听着暖，但那是你在替学校那件事站队。边界上，这一步不该由咨询师迈。',
    next: 'p3',
  },
  'p3': { type: 'say', who: '咨询师', text: '那就先这么定：上半天，撑不住就走，走之前给我发个消息。', next: 'p4' },
  'p4': { type: 'say', who: '许予安', text: '……行。', next: 'p5' },
  'p5': {
    type: 'say', note: { kind: 'supervision' },
    text: '「回不回」是个表态，「上半天」是件能做的事。把大问题换成一件小事，他才动得了。',
    next: 'sc6',
  },
  'sc6': {
    type: 'card', kind: 'science',
    title: '未成年人做咨询，什么情况下不能保密',
    lines: [
      '咨询里的保密不是绝对的。对未成年人，这条线出现得更早。',
      '出现自伤、伤人、被伤害（比如长期被霸凌）或严重风险时，要告知监护人。',
      '但「告知」不等于「把你说的全转述」。做法是：先告诉你，跟你一起说，只说该说的。',
    ],
    footer: '依据：第 7 章',
    button: '知道了',
    next: 's3end',
  },
  's3end': {
    type: 'say', who: '旁白',
    text: '他撑着拐站起来。这次没有把拐杖拖在地上。',
    next: '@end/1',
  },
};

// ---------------------------------------------------------------------------
// 终章
// ---------------------------------------------------------------------------
const XU_END = {
  '1': {
    type: 'result',
    title: '故事线 0 · 完',
    lead: '心理干预的目标不是让他不再有情绪，而是让一个人在自己的身体里，重新有得选。',
    button: '看这一程的轨迹',
    // 成绩单不给分数。它只说他这一程落在哪条适应轨迹上，并说明这是评估、不是评判。
    // rows 是函数：读这一局真的做过的选择（flags），不写死剧情。
    rows: function (flags) {
      return [
        ['他怎么开头', flags.openB ? '你先问他想聊什么，他从「都行」开始。'
          : flags.openA ? '你复述了转介单上那句判断，他先得替自己辩解。'
            : '你问了「最近怎么样」，拿回一个「挺好的」。'],
        ['那场车祸', flags.crashParts ? '你让他说还记得的部分，他给了声音和温度。'
          : flags.crashMemory ? '你问的是记忆本身，他自己说出了「那天走到马路中间」。'
            : '你把话题关上了。门没锁，但这次没进。'],
        ['谁在照顾他', flags.pushSecond ? '你多问了一句，他才说出「还有个阿姨」。'
          : flags.concrete ? '你从早饭问起，他没多想就说了阿姨。'
            : '你没接那句卡住的话，它还在原地。'],
        ['「她又不是我妈」', flags.separate ? '你把生气和嫌分开了，他听懂了。'
          : flags.confront ? '你说对了，但他听见的是「你不好」。'
            : '你把「她不是家人、你却要天天靠她」摆了出来，他抬头看了你。'],
        ['阿姨也是个人', flags.auntStory ? '他说出了「一年见一回」。'
          : flags.auntGuilt ? '你替阿姨说了话，他先防了一下。'
            : '你没接，他自己说出了「她其实挺累的」。'],
        ['危机筛查', flags.screened
          ? (flags.crisisTriggered ? '你问了。他给了那句被动意念。你按写死的流程接住他，并给了资源。'
            : '你问了，他答了。')
          : '你没问。这不扣分，但下次得问。'],
        ['复学', flags.planHalf ? '你们把「回不回」换成了「上半天」。'
          : flags.planDoor ? '他只要送到路口。那是他能接受的距离。'
            : '你说要陪他去。那句话暖，但越了界。'],
        ['适应轨迹', '这一程他落在「缓慢适应」这一类：不是没在走，是走得慢。'
          + '轨迹是评估，不是评判——它说的是他现在在哪儿，不是他值几分。'],
      ];
    },
    // 没做筛查时的提醒。原文案是脊髓损伤那条线的，不能拿来给这个孩子用。
    reminder: '提醒：这一次你没有做危机筛查。他那句「有」，就留在原地了。下一次，得问。',
    next: '2',
  },
  '2': {
    type: 'say', who: '旁白',
    text: '第二次咨询之后的那个周一。学校门口，他站在台阶下面，站了将近一分钟。',
    next: '3',
  },
  '3': {
    type: 'say', who: '旁白',
    text: '然后他转过去，对扶着他的那个人说：「你扶我一下吧。」',
    next: '4',
  },
  '4': {
    type: 'say', who: '咨询师',
    text: '下一回，他说说那天放学的事。',
    next: '5',
  },
  '5': {
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
// 房间里的物件（所有故事线共用同一条房间数据）
// ---------------------------------------------------------------------------
const ROOM_ITEMS = {
  referral: {
    label: '茶几上的转介单',
    callout: { name: '转介单', text: '别人对他的判断' },
    acts: {
      1: {
        kind: 'referral', title: '转介单',
        lines: [
          '许予安，14 岁，初二。车祸后全身多处骨折。',
          '现遗留下肢功能障碍，右腿戴矫形支具，需长期使用双拐。',
          '家属反映情绪低落，本人主动要求心理康复。',
          '——康复科门诊',
        ],
        footer: '这上面写的是别人对他的判断。这一次是他自己说要来的。',
      },
    },
  },
  tissue: {
    label: '茶几上的纸巾盒',
    callout: { name: '纸巾盒', text: '在这儿可以哭' },
    acts: {
      1: {
        kind: 'science', title: '为啥这儿放着一盒纸巾',
        lines: [
          '它就在你一伸手够得到的地方。没人会说「别哭」。',
          '摆在那儿，本身就是一句话：在这儿，你可以哭。',
          '十四岁的男孩尤其需要这句话。这个年纪，哭是最先被没收掉的东西。',
        ],
        footer: '依据：第 11 章',
      },
    },
  },
  clock: {
    label: '墙上的钟',
    callout: { name: '墙上的钟', text: '出院后最难' },
    acts: {
      1: {
        kind: 'science', title: '为啥「出院之后」最难',
        lines: [
          '很多人以为，出院说明最难的过去了。',
          '对多发伤的孩子来说，住院时一切都被安排好：几点训练、几点吃饭、去哪儿检查。',
          '回家以后这些突然全没了。而门口的台阶、学校的走廊、别人的眼神——才刚开始。',
          '最难的不是事故那天晚上，是回家以后的某个下午。',
        ],
        footer: '依据：第 22 章',
      },
    },
  },
  sofa: {
    label: '两把沙发',
    callout: { name: '沙发', text: '不对着坐' },
    acts: {
      1: {
        kind: 'science', title: '座位不是面对面的',
        lines: [
          '两把沙发不是正对着摆的，中间留着一个夹角。',
          '这样你不想对视的时候，可以把目光自然地移开，看地板、看窗外都行。',
          '正面对着坐，更像审问，不像谈话。',
          '中间那张茶几也是一种缓冲——它让两个人之间不至于空得发慌。',
        ],
        footer: '依据：第 7 章 · 咨询设置',
      },
    },
  },
};

XLZX.roomItems = ROOM_ITEMS;

const ROOM_CALLOUTS = {};
Object.keys(ROOM_ITEMS).forEach(function (id) {
  if (ROOM_ITEMS[id].callout) ROOM_CALLOUTS[id] = ROOM_ITEMS[id].callout;
});
XLZX.roomCallouts = ROOM_CALLOUTS;

// ---------------------------------------------------------------------------
// 组装。
// sections 必须在三个分节都声明完之后才求值——不能写在上头，
// 那时候 XU_S1 还在暂时性死区里。
//
// ⚠️ 导出名仍是 XLZX.storySci：engine.js 里按固定名字注册（X.storySci / storyAmp /
// storyPain），引擎冻结，所以这里沿用旧名字挂新内容。id 才是真正的身份。
// ---------------------------------------------------------------------------
const STORY_XU = {
  id: 'xu',
  title: '伤残适应',
  numeral: '一',
  lead: '一个认为「被照顾＝被知道自己很惨」的人，怎么接受有人愿意照顾他',
  client: {
    name: '许予安',
    line1: '14 岁 · 男',
    line2: '初二 · 车祸后多发伤',
    line3: '下肢功能障碍 · 伤后 5 个月',
  },
  sections: [
    { id: 's1', title: '第 1 节', subtitle: '第一次见面', nodes: XU_S1 },
    { id: 's2', title: '第 2 节', subtitle: '一周后', nodes: XU_S2 },
    { id: 's3', title: '第 3 节', subtitle: '准备回学校', nodes: XU_S3 },
  ],
  endingNodes: XU_END,
  // 来访者随身的东西。写死成轮椅的话，换线就会画出别人的轮椅。
  clientArt: {
    prop: 'CRUTCH_PAIR', propX: 70, propY: 34,
    body: 'XUYUAN_SEATED', bodyX: 58, bodyY: 30,
  },
  mobility: {
    title: '他的双拐',
    lines: [
      '双拐靠在沙发扶手上，不在他手里。',
      '一个人坐着的时候，拐放在哪儿，比他说什么更早说明他准备待多久。',
      '第 1 节，他早到十分钟，拐靠得很整齐。',
    ],
  },
  start: 's1/n1',
  ending: 'end/1',
  end: {
    heading: '故事线 0 · 完',
    closing: '他没有回学校，也没有变得更好。他做的是另一件事：'
      + '第一次主动开口，让人扶他一把。',
  },
};

XLZX.storySci = STORY_XU;

// v2 只留一条线。选线页只有一张卡，不再画剪影。
XLZX.storySlots = [
  {
    id: 'xu', numeral: '一', title: '伤残适应', ready: true,
    lead: '一个认为「被照顾＝被知道自己很惨」的人，怎么接受有人愿意照顾他',
    who: '许予安 · 14 岁 · 初二 · 下肢功能障碍 · 伤后 5 个月',
  },
];
