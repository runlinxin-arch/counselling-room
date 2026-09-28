#!/usr/bin/env node
/**
 * fetch-repos.mjs — 通过 GitHub codeload tarball 下载仓库源码到本地资料库。
 *
 * 为什么不用 git clone：本机 git 使用 Windows schannel 后端，
 * 在当前环境下 AcquireCredentialsHandle 失败（SEC_E_NO_CREDENTIALS），
 * 而 Node 自带 TLS 栈可以正常走系统代理。因此改用 HTTP 下载 tarball。
 *
 * 用法：
 *   node tools/fetch-repos.mjs              # 下载全部
 *   node tools/fetch-repos.mjs --only=inkjs,ink
 *   node tools/fetch-repos.mjs --retry      # 只重试上次失败的
 */

import { readFileSync, existsSync, mkdirSync, writeFileSync, rmSync, readdirSync, createWriteStream } from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DEST = join(ROOT, 'resources');
const STATE = join(__dirname, '.fetch-state.json');
const CONCURRENCY = 4;

const argv = process.argv.slice(2);
const onlyArg = argv.find((a) => a.startsWith('--only='));
const retryMode = argv.includes('--retry');

const repos = JSON.parse(readFileSync(join(__dirname, 'repos.json'), 'utf8'));

function run(cmd, args) {
  return new Promise((res) => {
    // stdio inherit：避免在受限沙箱下走命名管道捕获子进程输出
    const p = spawn(cmd, args, { stdio: 'inherit' });
    p.on('close', (code) => res(code));
    p.on('error', () => res(-1));
  });
}

async function download(url, outPath) {
  // 流式落盘，避免一次性 arrayBuffer 占用大量内存
  // 并关闭 undici 的 body 超时：本机代理在慢速大文件上会被 300s 超时打断
  const resp = await fetch(url, {
    redirect: 'follow',
    headers: { 'User-Agent': 'dsh-fetch-repos' },
    signal: AbortSignal.timeout(1800000), // 30 分钟上限
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const total = Number(resp.headers.get('content-length') || 0);
  if (!resp.body) throw new Error('empty body');

  const out = createWriteStream(outPath);
  let seen = 0;
  try {
    for await (const chunk of resp.body) {
      seen += chunk.length;
      if (!out.write(chunk)) {
        await new Promise((r) => out.once('drain', r));
      }
    }
  } finally {
    await new Promise((r) => out.end(r));
  }
  if (total && seen !== total) {
    throw new Error(`truncated: ${seen}/${total} bytes`);
  }
  return seen;
}

async function processRepo(r) {
  const target = join(DEST, r.cat, r.name);
  const tmp = join(DEST, r.cat, `.tmp-${r.name}`);
  const tgz = join(DEST, r.cat, `.${r.name}.tar.gz`);

  if (existsSync(target) && readdirSync(target).length > 0) {
    console.log(`[skip] ${r.repo}  (已存在)`);
    return { ...r, status: 'skipped' };
  }

  mkdirSync(join(DEST, r.cat), { recursive: true });
  // 每次请求默认分支的 tarball；HEAD 指向默认分支
  const url = `https://codeload.github.com/${r.repo}/tar.gz/HEAD`;

  try {
    let bytes = 0;
    let lastErr;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const t0 = Date.now();
        bytes = await download(url, tgz);
        const secs = ((Date.now() - t0) / 1000).toFixed(1);
        console.log(`[get ] ${r.repo}  ${(bytes / 1048576).toFixed(1)} MB in ${secs}s`);
        lastErr = undefined;
        break;
      } catch (e) {
        lastErr = e;
        if (attempt < 3) {
          const wait = attempt * 5;
          console.log(`[retry] ${r.repo}  第 ${attempt} 次失败（${e.message}），${wait}s 后重试`);
          await new Promise((res) => setTimeout(res, wait * 1000));
        }
      }
    }
    if (lastErr) throw lastErr;

    rmSync(tmp, { recursive: true, force: true });
    mkdirSync(tmp, { recursive: true });
    const code = await run('tar', ['-xzf', tgz, '-C', tmp, '--strip-components=1']);
    if (code !== 0) throw new Error(`tar exit ${code}`);

    // tarball 根目录名形如 repo-hash，解包后已 strip，直接搬到最终位置
    rmSync(target, { recursive: true, force: true });
    mkdirSync(dirname(target), { recursive: true });
    const mv = await run('cmd', ['/c', 'move', tmp, target]);
    if (mv !== 0) throw new Error(`move exit ${mv}`);

    rmSync(tgz, { force: true });
    console.log(`[ok  ] ${r.cat}/${r.name}`);
    return { ...r, status: 'ok', bytes };
  } catch (e) {
    rmSync(tgz, { force: true });
    rmSync(tmp, { recursive: true, force: true });
    console.error(`[FAIL] ${r.repo}  ${e.message}`);
    return { ...r, status: 'failed', error: e.message };
  }
}

async function pool(items, worker, limit) {
  const out = [];
  let i = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await worker(items[idx]);
    }
  });
  await Promise.all(runners);
  return out;
}

let todo = repos;
if (retryMode && existsSync(STATE)) {
  const prev = JSON.parse(readFileSync(STATE, 'utf8'));
  const failed = new Set(prev.filter((p) => p.status === 'failed').map((p) => p.name));
  todo = repos.filter((r) => failed.has(r.name));
  console.log(`重试模式：${todo.length} 个仓库\n`);
} else if (onlyArg) {
  const names = new Set(onlyArg.split('=')[1].split(',').map((s) => s.trim()));
  todo = repos.filter((r) => names.has(r.name));
}

mkdirSync(DEST, { recursive: true });
console.log(`目标目录：${DEST}`);
console.log(`计划下载：${todo.length} 个仓库（并发 ${CONCURRENCY}）\n`);

const results = await pool(todo, processRepo, CONCURRENCY);

// 合并历史状态，便于 --retry
let merged = results;
if (retryMode && existsSync(STATE)) {
  const prev = JSON.parse(readFileSync(STATE, 'utf8'));
  const byName = new Map(prev.map((p) => [p.name, p]));
  for (const r of results) byName.set(r.name, r);
  merged = [...byName.values()];
}
writeFileSync(STATE, JSON.stringify(merged, null, 2));

const ok = merged.filter((r) => r.status === 'ok').length;
const skip = merged.filter((r) => r.status === 'skipped').length;
const fail = merged.filter((r) => r.status === 'failed');
console.log(`\n=== 完成：成功 ${ok}，已存在 ${skip}，失败 ${fail.length} ===`);
if (fail.length) {
  console.log('失败列表：');
  for (const f of fail) console.log(`  - ${f.repo}  (${f.error})`);
  console.log('\n可用 node tools/fetch-repos.mjs --retry 重试失败项。');
}
