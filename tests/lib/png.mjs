// 无依赖的 PNG 编解码。tests/ 下几个脚本都要用，所以抽出来。
//
// 解码：只支持 8 位非隔行的 RGB / RGBA（Chrome 截图就是这个格式）
// 编码：只写 8 位 RGB（给像素画预览用）
import { deflateSync, inflateSync } from 'node:zlib';
import { readFileSync } from 'node:fs';

const SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

// ---------------------------------------------------------------------------
// CRC32（PNG 每个块都要）
// ---------------------------------------------------------------------------
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = -1;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

// ---------------------------------------------------------------------------
// 解码
// ---------------------------------------------------------------------------
export function decodePNG(file) {
  const buf = readFileSync(file);
  if (!buf.subarray(0, 8).equals(SIG)) throw new Error('不是 PNG：' + file);

  let pos = 8;
  let W = 0, H = 0, depth = 0, colorType = 0, interlace = 0;
  const idat = [];

  while (pos + 8 <= buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') {
      W = data.readUInt32BE(0);
      H = data.readUInt32BE(4);
      depth = data[8];
      colorType = data[9];
      interlace = data[12];
    } else if (type === 'IDAT') {
      idat.push(data);
    } else if (type === 'IEND') break;
    pos += 12 + len;
  }

  if (depth !== 8) throw new Error(`只支持 8 位色深，实际 ${depth}`);
  if (interlace !== 0) throw new Error('不支持隔行扫描');
  if (colorType !== 2 && colorType !== 6) {
    throw new Error(`只支持 RGB / RGBA，实际 colorType=${colorType}`);
  }

  const ch = colorType === 6 ? 4 : 3;
  const stride = W * ch;
  const raw = inflateSync(Buffer.concat(idat));
  const px = Buffer.alloc(H * stride);

  // 逐行反滤波（PNG 的 5 种滤波器）
  let p = 0;
  for (let y = 0; y < H; y++) {
    const f = raw[p++];
    const line = raw.subarray(p, p + stride);
    p += stride;
    const out = px.subarray(y * stride, (y + 1) * stride);
    const prev = y > 0 ? px.subarray((y - 1) * stride, y * stride) : null;
    for (let i = 0; i < stride; i++) {
      const a = i >= ch ? out[i - ch] : 0;
      const b = prev ? prev[i] : 0;
      const c = i >= ch && prev ? prev[i - ch] : 0;
      let v = line[i];
      if (f === 1) v += a;
      else if (f === 2) v += b;
      else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) {
        const pp = a + b - c;
        const pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      out[i] = v & 0xff;
    }
  }

  return {
    width: W,
    height: H,
    channels: ch,
    data: px,
    /** 取某点的 [r,g,b] */
    at(x, y) {
      const i = y * stride + x * ch;
      return [px[i], px[i + 1], px[i + 2]];
    },
    hex(x, y) {
      return '#' + this.at(x, y).map((v) => v.toString(16).padStart(2, '0')).join('');
    },
  };
}

// ---------------------------------------------------------------------------
// 编码（8 位 RGB，无滤波）
// ---------------------------------------------------------------------------
export function encodePNG(width, height, rgb) {
  const stride = width * 3;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    rgb.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }

  const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(td));
    return Buffer.concat([len, td, crc]);
  };

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  return Buffer.concat([
    SIG,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ---------------------------------------------------------------------------
// 画布：像素画预览用
// ---------------------------------------------------------------------------
export function makeCanvas(w, h, bg) {
  const px = Buffer.alloc(w * h * 3);
  if (bg) {
    const [r, g, b] = hexToRgb(bg);
    for (let i = 0; i < px.length; i += 3) { px[i] = r; px[i + 1] = g; px[i + 2] = b; }
  }
  return {
    width: w,
    height: h,
    data: px,
    set(x, y, hex) {
      if (x < 0 || y < 0 || x >= w || y >= h) return;
      const [r, g, b] = hexToRgb(hex);
      const i = (y * w + x) * 3;
      px[i] = r; px[i + 1] = g; px[i + 2] = b;
    },
    rect(x, y, rw, rh, hex) {
      for (let j = y; j < y + rh; j++) for (let i = x; i < x + rw; i++) this.set(i, j, hex);
    },
    /** 叠一层半透明色（只用来压暗 / 加暖光） */
    blend(x, y, hex, alpha) {
      if (x < 0 || y < 0 || x >= w || y >= h) return;
      const [r, g, b] = hexToRgb(hex);
      const i = (y * w + x) * 3;
      px[i] = Math.round(px[i] * (1 - alpha) + r * alpha);
      px[i + 1] = Math.round(px[i + 1] * (1 - alpha) + g * alpha);
      px[i + 2] = Math.round(px[i + 2] * (1 - alpha) + b * alpha);
    },
    /** 写出 PNG（调用方负责建目录） */
    toPNG() {
      return encodePNG(w, h, px);
    },
  };
}

export function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

/** 放大 N 倍（最近邻），像素画预览用 */
export function upscale(cv, scale) {
  const out = makeCanvas(cv.width * scale, cv.height * scale);
  for (let y = 0; y < cv.height; y++) {
    for (let x = 0; x < cv.width; x++) {
      const i = (y * cv.width + x) * 3;
      const hex = '#' + [0, 1, 2].map((k) => cv.data[i + k].toString(16).padStart(2, '0')).join('');
      out.rect(x * scale, y * scale, scale, scale, hex);
    }
  }
  return out;
}

/** 横向拼图 */
export function sheet(canvases, opts = {}) {
  const scale = opts.scale || 1;
  const gap = opts.gap === undefined ? 12 : opts.gap;
  const W = canvases.reduce((s, c) => s + c.width * scale, 0) + gap * (canvases.length - 1);
  const H = Math.max(...canvases.map((c) => c.height * scale));
  const out = makeCanvas(W, H, opts.bg || '#0b0d12');
  let ox = 0;
  for (const c of canvases) {
    for (let y = 0; y < c.height; y++) {
      for (let x = 0; x < c.width; x++) {
        const i = (y * c.width + x) * 3;
        const hex = '#' + [0, 1, 2].map((k) => c.data[i + k].toString(16).padStart(2, '0')).join('');
        out.rect(ox + x * scale, y * scale, scale, scale, hex);
      }
    }
    ox += c.width * scale + gap;
  }
  return out;
}
