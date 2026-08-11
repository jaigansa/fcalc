// Generates PNG app icons for the PWA manifest without any npm dependencies.
// Draws a calculator keypad grid on a slate background.
// Usage: node scripts/generate-icons.mjs
import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public', 'icons')
mkdirSync(outDir, { recursive: true })

const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()

function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  }
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const header = Buffer.alloc(8)
  header.writeUInt32BE(data.length, 0)
  header.write(type, 4, 'ascii')
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([header.subarray(4), data])))
  return Buffer.concat([header, data, crcBuf])
}

function encodePNG(width, height, rgba) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // color type: RGBA
  const raw = Buffer.alloc((width * 4 + 1) * height)
  for (let y = 0; y < height; y++) {
    const rowStart = y * (width * 4 + 1)
    raw[rowStart] = 0 // filter: none
    rgba.copy(raw, rowStart + 1, y * width * 4, (y + 1) * width * 4)
  }
  const idat = deflateSync(raw, { level: 9 })
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

const BG = [0x1e, 0x29, 0x3b, 0xff] // slate-700
const BTN = [0x0f, 0x17, 0x2a, 0xff] // slate-900
const ACCENT = [0x38, 0xbd, 0xf8, 0xff] // sky-400

function inRoundRect(x, y, b, rad) {
  const cx = Math.max(b.x + rad, Math.min(x, b.x + b.w - rad))
  const cy = Math.max(b.y + rad, Math.min(y, b.y + b.h - rad))
  const dx = x - cx
  const dy = y - cy
  return dx * dx + dy * dy <= rad * rad
}

function render(size, layoutInset) {
  const rgba = Buffer.alloc(size * size * 4)
  const margin = size * layoutInset
  const cols = 3
  const rows = 4
  const cell = (size - 2 * margin) / cols
  const gap = cell * 0.12
  const bw = cell - gap
  const bh = cell - gap
  const rad = bw * 0.18

  const buttons = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      buttons.push({
        x: margin + c * cell + gap / 2,
        y: margin + r * cell + gap / 2,
        w: bw,
        h: bh,
        accent: (r === 2 && c === 1) || (r === 3 && c === 2),
      })
    }
  }

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let color = BG
      for (const b of buttons) {
        if (inRoundRect(x + 0.5, y + 0.5, b, rad)) {
          color = b.accent ? ACCENT : BTN
          break
        }
      }
      const i = (y * size + x) * 4
      rgba[i] = color[0]
      rgba[i + 1] = color[1]
      rgba[i + 2] = color[2]
      rgba[i + 3] = color[3]
    }
  }
  return encodePNG(size, size, rgba)
}

writeFileSync(join(outDir, 'icon-192.png'), render(192, 0.1))
writeFileSync(join(outDir, 'icon-512.png'), render(512, 0.1))
writeFileSync(join(outDir, 'maskable-512.png'), render(512, 0.16))
writeFileSync(join(outDir, 'apple-touch-icon.png'), render(180, 0.1))

console.log('Icons written to', outDir)
