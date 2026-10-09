// 立绘对比：旧版 vs 新版（改前改后留档），按游戏实际放大倍率（6×）渲染在墙色上。
// 判断"眼睛和头发分不分得出来"必须按这个倍率看。
import { readFileSync, writeFileSync } from 'node:fs';
import vm from 'node:vm';
import { encodePNG, hexToRgb } from '../tests/lib/png.mjs';

const SCALE = 6, PAD = 6, GAP = 10;
const js = readFileSync('src/sprites.js', 'utf8').replace(/^\s*\/\/.*$/gm, '');
const { LINYUE, COUNSELOR, PAL_EXT } = vm.runInNewContext(js + ';({LINYUE, COUNSELOR, PAL_EXT})');
// 旧版立绘用到的字符（E/e/K/L/k）在这次换风格时已从 PAL_EXT 移除，
// 对比图要单独补回来，否则渲染旧版会因缺色报错。
const OLD_EXTRA = { L: '#c0c6cc', E: '#4f6478', e: '#3d4f60', K: '#5f707f', k: '#4a5a68' };
const PAL = { ...JSON.parse(readFileSync('src/sprites.json', 'utf8')).pal, ...OLD_EXTRA, ...PAL_EXT };

// 旧版（11 行高、无五官）硬编码进来，供对比
const OLD = {
  lin: ['    HHHH      ','   HHHHHH     ','   HZZZZH     ','   ZZZZZZ     ','    ZZZZ      ','    EEEE      ','   EEEEEE     ',' Z EEEEEE Z   ',' Z EEEEEE Z   ',' z eeeeee z   ','   EEEEEE     ','   EEEEEE     ','   DDDDDD     ','   DDDDDDDDD  ','   DDDD  DDDD ','   DDD    DDD ','  DDDD    DDD '],
  cou: ['   HHHHH      ','  HHHHHHH     ','  HHZZZZH     ','   ZZZZZ      ','   ZZZZ       ','   KKKK       ','  KKKKKK      ',' ZKKKKKK Z    ',' ZKLLLLKK Z   ',' zKKKKKK z    ','  KKKKKK      ','  KKKKKK      ','  DDDDDD      ','  DDDDDDDD    ','  DDDD DDDD   ',' DDDD   DDD   '],
};

const cols = [
  { title: 'old-lin', s: OLD.lin }, { title: 'old-cou', s: OLD.cou },
  { title: 'new-lin', s: LINYUE },  { title: 'new-cou', s: COUNSELOR },
];

const cw = Math.max(...cols.map((c) => c.s[0].length)) * SCALE;
const ch = Math.max(...cols.map((c) => c.s.length)) * SCALE;
const W = cols.length * cw + (cols.length + 1) * GAP;
const H = ch + PAD * 2;
const bg = hexToRgb('#e8d8b6'), rgb = Buffer.alloc(W * H * 3);
for (let i = 0; i < W * H; i++) { rgb[i*3]=bg[0]; rgb[i*3+1]=bg[1]; rgb[i*3+2]=bg[2]; }

cols.forEach((c, ci) => {
  const ox = GAP + ci * (cw + GAP);
  c.s.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const ch2 = row[x]; if (ch2 === ' ') continue;
      if (!(ch2 in PAL)) throw new Error('调色板缺字符 ' + JSON.stringify(ch2) + '（会画成品红，说明配色没接上）');
      const col = hexToRgb(PAL[ch2]);
      for (let dy = 0; dy < SCALE; dy++) for (let dx = 0; dx < SCALE; dx++) {
        const px = ox + x*SCALE + dx, py = PAD + y*SCALE + dy;
        if (px >= W || py >= H) continue;
        const i = (py*W + px)*3;
        rgb[i]=col[0]; rgb[i+1]=col[1]; rgb[i+2]=col[2];
      }
    }
  });
});
writeFileSync('docs/mockups/shots/characters-before-after.png', encodePNG(W, H, rgb));
console.log('对比图（旧林越/旧咨询师/新林越/新咨询师）'+W+'x'+H);
