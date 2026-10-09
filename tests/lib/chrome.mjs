/**
 * chrome.mjs — 调 Chrome 的公共入口
 *
 * ⚠️ **为什么不能直接用 execFileSync**
 *
 * macOS 上 headless Chrome 把 `--dump-dom` 的输出吐完之后，**进程不会自己退出**
 * （updater / crashpad 挂着不放）。用 execFileSync 就会一直等到 timeout：
 *   - walkthrough 每步 420s × 14 步 ≈ 1.5 小时
 *   - check-acceptance 每次 300s
 *   - smoke-browser 每次 60s
 * 表现是"测试像卡死了"，但 DOM 其实早就完整了。
 *
 * 所以这里改成：边读 stdout 边判断 `</html>` 是否出现，出现就收工并杀掉 Chrome。
 * 单次通常几秒。
 *
 * ⚠️ **但"DOM 好了"不等于"活儿干完了"**
 *
 * 踩过一次：只等 `</html>` 就 kill，结果 `--screenshot` 的 PNG 还没编码完，
 * 11 张截图里有 3 张变成 0 字节——而测试全绿，因为它只断言 title。
 * 所以只要这次带了 `--screenshot=`，就必须**同时等那个文件写完**（见轮询）。
 */

import { spawn, execFileSync } from 'node:child_process';
import { existsSync, rmSync, statSync, readFileSync } from 'node:fs';

/** 各平台可能的浏览器路径（Windows / macOS / Linux） */
export const CHROME_CANDIDATES = [
  // Windows
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  // macOS
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  // Linux
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
];

/** 找到可用的浏览器；找不到返回 null（调用方决定跳过还是报错） */
export function findChrome() {
  const hit = CHROME_CANDIDATES.find((p) => existsSync(p));
  if (hit) return hit;
  if (process.platform !== 'win32') {
    for (const name of ['google-chrome', 'chromium', 'chromium-browser', 'microsoft-edge']) {
      try {
        const p = execFileSync('which', [name], { encoding: 'utf8' }).trim();
        if (p) return p;
      } catch (e) { /* 没装 */ }
    }
  }
  return null;
}

/** 从参数里取 --screenshot=<path> */
function shotPathOf(args) {
  const a = args.find((x) => x.startsWith('--screenshot='));
  return a ? a.slice('--screenshot='.length) : null;
}

/** PNG 是否已完整写出（有签名 + 能搜到 IEND 收尾标记） */
function pngComplete(file) {
  try {
    const st = statSync(file);
    if (st.size < 100) return false;
    const buf = readFileSync(file);
    if (buf.slice(0, 8).toString('latin1') !== '\x89PNG\r\n\x1a\n') return false;
    return buf.includes(Buffer.from('IEND'));
  } catch (e) {
    return false;
  }
}

/**
 * 跑一次 Chrome，返回 { dom, stderr }。
 *
 * @param {string} bin   Chrome 可执行文件路径
 * @param {string[]} args 参数（应包含 --dump-dom；可选 --screenshot=）
 * @param {object} [opts]
 *   - timeoutMs 兜底超时（默认 120000）
 */
export function runChrome(bin, args, opts = {}) {
  const timeoutMs = opts.timeoutMs || 120000;
  const shot = shotPathOf(args);

  return new Promise((resolve) => {
    const child = spawn(bin, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let dom = '';
    let stderr = '';
    let domDone = false;
    let shotDone = !shot;          // 没要截图就不用等截图
    let lastSize = -1;
    let stableSince = 0;
    let killed = false;
    let tick = 0;

    const finish = () => {
      if (killed) return;
      killed = true;
      clearTimeout(timer);
      clearInterval(poller);
      try { child.kill('SIGKILL'); } catch (e) { /* 已经没了 */ }
      resolve({ dom, stderr });
    };

    const maybeFinish = () => {
      if (killed) return;
      if (domDone && shotDone) finish();
    };

    child.stdout.on('data', (b) => {
      dom += b;
      if (!domDone && /<\/html>/i.test(dom.slice(-20000))) { domDone = true; maybeFinish(); }
    });
    child.stderr.on('data', (b) => { stderr += b; });
    child.on('close', () => { domDone = true; shotDone = true; maybeFinish(); });
    child.on('error', () => { domDone = true; shotDone = true; maybeFinish(); });

    // 轮询截图文件：写完且**持续 400ms 不再变大**，才算真的落盘。
    // 早先只等 120ms，Chrome 在两次轮询之间写同样的字节数就会误判成写完，
    // 结果偶发出现 0 字节截图（测试还全绿，因为它只断言 title）。
    const poller = setInterval(() => {
      if (killed) return;
      tick++;

      if (shot && !shotDone) {
        if (pngComplete(shot)) {
          let size = -1;
          try { size = statSync(shot).size; } catch (e) { /* 忽略 */ }
          if (size === lastSize) {
            if (!stableSince) stableSince = Date.now();
            else if (Date.now() - stableSince > 400) shotDone = true;
          } else {
            lastSize = size;
            stableSince = 0;
          }
        }
        // 兜底：DOM 早就好了但截图迟迟不落地，别无限等（约 24s）
        if (tick > 400) shotDone = true;
      }
      maybeFinish();
    }, 60);

    const timer = setTimeout(() => { domDone = true; shotDone = true; finish(); }, timeoutMs);
  });
}

/** 从 dump 出来的 DOM 里取 <title> */
export function titleOf(dom) {
  return (dom.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '';
}

/**
 * 删掉临时 profile 目录。
 *
 * 必须重试：我们在 Chrome 吐完 DOM 后就直接 kill 了它，它的 profile 目录
 * 这时可能还有文件正在落盘，rmSync 会抛 ENOTEMPTY。
 * 这不是错误，只是"还没写干净"，退一步再删即可。
 */
export function cleanupProfile(dir) {
  for (let i = 0; i < 5; i++) {
    try {
      rmSync(dir, { recursive: true, force: true });
      return true;
    } catch (e) {
      if (e.code !== 'ENOTEMPTY' && e.code !== 'EBUSY') return false;
      try { execFileSync('sleep', ['0.15']); } catch (e2) { /* 忽略 */ }
    }
  }
  try { rmSync(dir, { recursive: true, force: true }); return true; } catch (e) { return false; }
}
