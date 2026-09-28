// 把 Markdown 同步到 Notion 页面
// 用法：
//   $env:NOTION_TOKEN="..."; node tools/notion-sync.mjs verify <pageId>
//   $env:NOTION_TOKEN="..."; node tools/notion-sync.mjs sync   <pageId> <mdFile>
import { readFileSync } from 'node:fs';

const API = 'https://api.notion.com/v1';
const TOKEN = process.env.NOTION_TOKEN;
const VERSION = '2022-06-28';

if (!TOKEN) { console.error('缺少环境变量 NOTION_TOKEN'); process.exit(1); }

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  'Notion-Version': VERSION,
  'Content-Type': 'application/json',
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function call(path, options = {}, retries = 4) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(API + path, { headers, ...options });
    const text = await res.text();
    if (res.status === 429 || res.status >= 500) {
      const wait = Number(res.headers.get('retry-after') || 2) * 1000;
      if (attempt < retries) { await sleep(wait); continue; }
    }
    let body;
    try { body = JSON.parse(text); } catch { body = text; }
    if (!res.ok) {
      const msg = body?.message || JSON.stringify(body).slice(0, 400);
      throw new Error(`HTTP ${res.status} ${path}\n  ${msg}`);
    }
    return body;
  }
}

// ---------- 行内格式：**粗体**、`代码` ----------
function richText(text) {
  const out = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0, m;
  const push = (content, annotations) => {
    if (!content) return;
    // Notion 单段上限 2000 字符
    for (let i = 0; i < content.length; i += 1900) {
      out.push({
        type: 'text',
        text: { content: content.slice(i, i + 1900) },
        ...(annotations ? { annotations } : {}),
      });
    }
  };
  while ((m = re.exec(text)) !== null) {
    push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith('**')) push(tok.slice(2, -2), { bold: true });
    else push(tok.slice(1, -1), { code: true });
    last = m.index + tok.length;
  }
  push(text.slice(last));
  return out.length ? out : [{ type: 'text', text: { content: '' } }];
}

const rt = (t) => ({ rich_text: richText(t) });

// ---------- Markdown -> Notion blocks ----------
function mdToBlocks(md) {
  const lines = md.split(/\r?\n/);
  const blocks = [];
  let i = 0;

  const splitRow = (l) =>
    l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
  const isSep = (l) => /^\|?[\s:|-]+\|?$/.test(l) && l.includes('-');

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) { i++; continue; }

    // 代码块
    if (line.trim().startsWith('```')) {
      const lang = line.trim().slice(3).trim() || 'plain text';
      const buf = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) buf.push(lines[i++]);
      i++;
      blocks.push({
        object: 'block', type: 'code',
        code: { rich_text: richText(buf.join('\n')), language: lang === 'text' ? 'plain text' : lang },
      });
      continue;
    }

    // 表格
    if (line.trim().startsWith('|')) {
      const rows = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        if (!isSep(lines[i])) rows.push(splitRow(lines[i]));
        i++;
      }
      const width = Math.max(...rows.map((r) => r.length));
      const norm = rows.map((r) => { const c = [...r]; while (c.length < width) c.push(''); return c; });
      blocks.push({
        object: 'block', type: 'table',
        table: {
          table_width: width,
          has_column_header: true,
          has_row_header: false,
          children: norm.map((cells, idx) => ({
            object: 'block', type: 'table_row',
            table_row: { cells: cells.map((c) => (idx === 0 ? richText(c) : richText(c))) },
          })),
        },
      });
      continue;
    }

    // 分隔线
    if (/^-{3,}\s*$/.test(line.trim())) {
      blocks.push({ object: 'block', type: 'divider', divider: {} });
      i++; continue;
    }

    // 标题
    let m;
    if ((m = /^(#{1,3})\s+(.*)$/.exec(line))) {
      const level = m[1].length;
      blocks.push({ object: 'block', type: `heading_${level}`, [`heading_${level}`]: rt(m[2]) });
      i++; continue;
    }

    // 待办
    if ((m = /^-\s+\[([ xX])\]\s+(.*)$/.exec(line))) {
      blocks.push({
        object: 'block', type: 'to_do',
        to_do: { ...rt(m[2]), checked: m[1].toLowerCase() === 'x' },
      });
      i++; continue;
    }

    // 无序列表
    if ((m = /^[-*]\s+(.*)$/.exec(line))) {
      blocks.push({ object: 'block', type: 'bulleted_list_item', bulleted_list_item: rt(m[1]) });
      i++; continue;
    }

    // 有序列表
    if ((m = /^\d+\.\s+(.*)$/.exec(line))) {
      blocks.push({ object: 'block', type: 'numbered_list_item', numbered_list_item: rt(m[1]) });
      i++; continue;
    }

    // 引用
    if ((m = /^>\s?(.*)$/.exec(line))) {
      blocks.push({ object: 'block', type: 'quote', quote: rt(m[1]) });
      i++; continue;
    }

    // 普通段落
    blocks.push({ object: 'block', type: 'paragraph', paragraph: rt(line.trim()) });
    i++;
  }
  return blocks;
}

// ---------- 主流程 ----------
const [mode, pageId, mdFile] = process.argv.slice(2);
const normId = pageId.replace(/-/g, '').replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');

if (mode === 'verify') {
  const me = await call('/users/me');
  console.log('✓ Token 有效');
  console.log('  集成名称 :', me.name || '(未命名)');
  console.log('  类型     :', me.type);
  const page = await call(`/pages/${normId}`);
  console.log('✓ 能访问该页面');
  console.log('  页面 ID  :', page.id);
  const titleProp = Object.values(page.properties || {}).find((p) => p.type === 'title');
  console.log('  页面标题 :', (titleProp?.title || []).map((t) => t.plain_text).join('') || '(空)');
  const kids = await call(`/blocks/${normId}/children?page_size=5`);
  console.log('  现有子块 :', kids.results.length, '个（前 5 个）');
  for (const b of kids.results) console.log('    -', b.type);
  process.exit(0);
}

if (mode === 'sync') {
  const md = readFileSync(mdFile, 'utf8');
  const blocks = mdToBlocks(md);
  console.log(`解析出 ${blocks.length} 个区块，开始上传…`);

  // 先清空页面已有的子块
  let cursor;
  const existing = [];
  do {
    const r = await call(`/blocks/${normId}/children?page_size=100${cursor ? `&start_cursor=${cursor}` : ''}`);
    existing.push(...r.results.map((b) => b.id));
    cursor = r.has_more ? r.next_cursor : undefined;
  } while (cursor);
  for (const id of existing) {
    await call(`/blocks/${id}`, { method: 'DELETE' });
    await sleep(120);
  }
  if (existing.length) console.log(`清空了 ${existing.length} 个旧区块`);

  // 分批上传（Notion 上限 100/次）
  let done = 0;
  for (let i = 0; i < blocks.length; i += 90) {
    const chunk = blocks.slice(i, i + 90);
    await call(`/blocks/${normId}/children`, {
      method: 'PATCH',
      body: JSON.stringify({ children: chunk }),
    });
    done += chunk.length;
    console.log(`  已上传 ${done}/${blocks.length}`);
    await sleep(350);
  }

  // 顺手把页面标题设成项目名
  try {
    const page = await call(`/pages/${normId}`);
    const titleKey = Object.entries(page.properties || {}).find(([, p]) => p.type === 'title')?.[0];
    if (titleKey) {
      await call(`/pages/${normId}`, {
        method: 'PATCH',
        body: JSON.stringify({ properties: { [titleKey]: { title: [{ text: { content: '康复心理学页游 · 项目存档' } }] } } }),
      });
      console.log('✓ 页面标题已设置');
    }
  } catch (e) {
    console.log('（标题设置跳过：' + e.message.split('\n')[0] + '）');
  }

  console.log('✅ 同步完成');
  process.exit(0);
}

console.error('用法: node tools/notion-sync.mjs verify <pageId> | sync <pageId> <mdFile>');
process.exit(1);
