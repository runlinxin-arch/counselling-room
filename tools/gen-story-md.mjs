// 从 src/story-amp.js 生成剧本正本 docs/story/故事线2-截肢.md。
// 为什么要生成而不是手抄一遍：手抄必然与数据漂移，而剧本是"正本"、
// 数据是"投影"——两者不一致时，谁对谁错会变成扯不清的事。
import { readFileSync, writeFileSync } from 'node:fs';
import vm from 'node:vm';

const js = readFileSync('src/story-amp.js', 'utf8');
const ctx = { console };
vm.createContext(ctx);
const { storyAmp } = vm.runInContext(js + ';({storyAmp: XLZX.storyAmp})', ctx);

const L = [];
L.push('# 故事线二 · 截肢');
L.push('');
L.push('> 主角：' + storyAmp.client.name + '，' + storyAmp.client.line1 + '，'
  + storyAmp.client.line2 + '，' + storyAmp.client.line3);
L.push('> 核心冲突：' + storyAmp.lead);
L.push('>');
L.push('> 本文件由 `src/story-amp.js` 生成（`node tools/gen-story-md.mjs`）。');
L.push('> 改台词请改数据，再重新生成本文件，避免两边漂移。');
L.push('');
L.push('## 专业依据');
L.push('');
L.push('全部来自《Handbook of Rehabilitation Psychology》第三版（APA, 2019）第 16 章 Limb Loss。');
L.push('逐条数据见每节末尾的「依据」标注。');
L.push('');

for (const sec of storyAmp.sections) {
  L.push('---');
  L.push('');
  L.push('## ' + sec.title + ' · ' + sec.subtitle);
  L.push('');
  const nodes = sec.nodes;
  // 按插入顺序遍历
  for (const [k, n] of Object.entries(nodes)) {
    const tag = '`' + sec.id + '/' + k + '`';
    if (n.type === 'say') {
      const who = n.note ? '（督导笔记）' : (n.who || '旁白');
      const text = String(n.text).replace(/\n/g, ' / ');
      L.push('- ' + tag + ' **' + who + '**：' + text);
      if (n.effect === 'crisis') L.push('  - 〔写死〕危机关怀：引擎在此置 crisisTriggered');
      if (n.effect === 'markScreenMissed') L.push('  - 〔写死〕标记未筛查');
    } else if (n.type === 'choice') {
      L.push('');
      L.push('**选择 · ' + (n.prompt || '') + '** ' + tag);
      L.push('');
      for (const o of n.options) {
        L.push('- `' + o.key + '` ' + o.label + ' → `' + o.next + '`'
          + (o.flag ? '  〔flag: ' + o.flag + '〕' : ''));
      }
      L.push('');
    } else if (n.type === 'diary') {
      L.push('');
      L.push('**情绪日记 · ' + n.title + '** ' + tag + '（' + (n.hint || '') + '）');
      L.push('');
      for (const e of n.entries) {
        L.push('- ' + e.day + '：' + e.lines.join(' / '));
        if (e.note) L.push('  - 教学点：' + e.note);
      }
      L.push('');
    } else if (n.type === 'card') {
      L.push('');
      L.push('**科普卡（' + n.kind + '）· ' + n.title + '** ' + tag);
      L.push('');
      for (const line of n.lines) L.push('- ' + line);
      if (n.footer) L.push('- 结语：' + n.footer);
      L.push('');
    } else if (n.type === 'result') {
      L.push('');
      L.push('**本节结算 · ' + n.title + '** ' + tag);
      L.push('');
      L.push('> ' + n.lead);
      L.push('');
    }
  }
}

L.push('---');
L.push('');
L.push('## 终章');
L.push('');
for (const [k, n] of Object.entries(storyAmp.endingNodes)) {
  L.push('- `end/' + k + '` **' + n.title + '**：' + (n.lead || n.lines.join(' / ')));
}
L.push('');
L.push('---');
L.push('');
L.push('## 红线自查');
L.push('');
L.push('- 咨询师不下诊断、不给药物建议、不评判来访者家人');
L.push('- 危机筛查「可以不问」，不惩罚、不扣分，但留痕');
L.push('- 危机关怀写死在数据里（节点标 `effect: crisis`），不经任何模型判断');
L.push('- 三条热线齐全：12356 / 010-82951332 / 120');
L.push('- person-first 用语；无身体贬称');
L.push('- 不出现「恢复正常」叙事；干预目标是功能、自我效能与目标调整');
L.push('- 本线全部数字均有书中出处（见各节「依据」）');

writeFileSync('docs/story/故事线2-截肢.md', L.join('\n') + '\n');
const lines = L.length;
console.log('已生成 docs/story/故事线2-截肢.md，' + lines + ' 行');
