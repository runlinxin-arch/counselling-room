// 从 src/story-*.js 生成剧本正本 docs/story/故事线N-*.md。
//
// 为什么要生成而不是手抄：手抄必然与数据漂移。而剧本是"正本"、数据是"投影"，
// 两者不一致时谁对谁错会变成扯不清的事。所以让数据做唯一来源，正本由它生成。
//
// 用法：node tools/gen-story-md.mjs        （目前没有生成目标，见下面的 LINES）
import { readFileSync, writeFileSync } from 'node:fs';
import vm from 'node:vm';

// ⚠️ 故事线一**不在这里**：它的正本 docs/story/故事线1-脊髓损伤.md 是手写的，
// 比从数据投影出来的版本更细（含批注与舞台细节）。用生成器覆盖它会丢东西。
// 所以只生成后两条线；故事线一的正本由人维护。
//
// v2（2026-10-19）：故事线二、三已删除，只剩故事线一（正本手写），
// 所以 LINES 目前是空的——本脚本没有生成目标，跑起来只打印一句说明。
// 新剧本落地后若决定「正本由数据生成」，把那一项加回来即可。
const LINES = [];

const NUM = ['二', '三'];

function gen({ file, key, out, chapter }, idx) {
  const js = readFileSync(file, 'utf8');
  const ctx = { console };
  vm.createContext(ctx);
  const story = vm.runInContext(js + `;XLZX.${key}`, ctx);

  const L = [];
  L.push(`# 故事线${NUM[idx]} · ${story.title}`);
  L.push('');
  L.push('> 主角：' + story.client.name + '，' + story.client.line1 + '，'
    + story.client.line2 + '，' + story.client.line3);
  L.push('> 核心冲突：' + story.lead);
  L.push('>');
  L.push('> 本文件由 `' + file + '` 生成（`node tools/gen-story-md.mjs`）。');
  L.push('> 改台词请改数据，再重新生成本文件，避免两边漂移。');
  L.push('');
  L.push('## 专业依据');
  L.push('');
  L.push('全部来自《Handbook of Rehabilitation Psychology》第三版（APA, 2019）' + chapter + '。');
  L.push('逐条数据见各节末尾的「依据」标注。');
  L.push('');

  for (const sec of story.sections) {
    L.push('---');
    L.push('');
    L.push('## ' + sec.title + ' · ' + sec.subtitle);
    L.push('');
    for (const [k, n] of Object.entries(sec.nodes)) {
      const tag = '`' + sec.id + '/' + k + '`';
      if (n.type === 'say') {
        const who = n.note ? '（督导笔记）' : (n.who || '旁白');
        L.push('- ' + tag + ' **' + who + '**：' + String(n.text).replace(/\n/g, ' / '));
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
  for (const [k, n] of Object.entries(story.endingNodes)) {
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
  L.push('- 本线所有数字均有书中出处；书里没有的数字不写');

  writeFileSync(out, L.join('\n') + '\n');
  console.log('已生成 ' + out + '（' + L.length + ' 行）');
}

if (LINES.length === 0) {
  console.log('没有要生成的剧本：v2 只剩故事线一，它的正本是手写的（docs/story/故事线1-脊髓损伤.md）。');
} else {
  LINES.forEach(gen);
}
