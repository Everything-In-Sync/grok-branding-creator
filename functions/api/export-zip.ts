import type { Palette } from '../../shared/types'

export const onRequestPost: PagesFunction = async ({ request }) => {
  try {
    const { paletteIndex, palettes } = await request.json() as { paletteIndex: number, palettes: Palette[] }
    if (!Array.isArray(palettes) || palettes.length === 0) {
      return new Response('Bad Request', { status: 400 })
    }

    // Build a very small zip (plain text bundle) to avoid heavy deps on Pages
    // The content mirrors what the server ZIP contained.
    const selected = palettes[paletteIndex] || palettes[0]
    const files: Record<string, string> = {
      'README.txt': `Brand package: ${selected.name}\nGenerated on ${new Date().toISOString()}\n`,
      'colors.css': `:root{--color-primary:${selected.roles.primary.hex};--color-secondary:${selected.roles.secondary.hex};--color-accent:${selected.roles.accent.hex};--color-neutral:${selected.roles.neutral.hex};--color-background:${selected.roles.background.hex};}`,
    }

    const zipBlob = await createZip(files)
    return new Response(zipBlob, {
      headers: {
        'content-type': 'application/zip',
        'content-disposition': 'attachment; filename="brand-package.zip"'
      }
    })
  } catch (e) {
    return new Response('Failed to create zip', { status: 500 })
  }
}

// Minimal ZIP creator (no compression) suitable for small bundles
async function createZip(files: Record<string, string>): Promise<Blob> {
  interface Entry { name: string; data: Uint8Array; crc: number; }
  const enc = new TextEncoder()
  const entries: Entry[] = []

  for (const [name, text] of Object.entries(files)) {
    const data = enc.encode(text)
    const crc = crc32(data)
    entries.push({ name, data, crc })
  }

  const fileRecords: Uint8Array[] = []
  const centralRecords: Uint8Array[] = []
  let offset = 0

  for (const e of entries) {
    const nameBytes = enc.encode(e.name)
    const local = new DataView(new ArrayBuffer(30))
    // Local file header signature
    local.setUint32(0, 0x04034b50, true)
    local.setUint16(4, 20, true) // version
    local.setUint16(6, 0, true) // flags
    local.setUint16(8, 0, true) // no compression
    local.setUint16(10, 0, true)
    local.setUint16(12, 0, true)
    local.setUint32(14, e.crc >>> 0, true)
    local.setUint32(18, e.data.length, true)
    local.setUint32(22, e.data.length, true)
    local.setUint16(26, nameBytes.length, true)
    local.setUint16(28, 0, true)

    const record = concat(new Uint8Array(local.buffer), nameBytes, e.data)
    fileRecords.push(record)

    const central = new DataView(new ArrayBuffer(46))
    central.setUint32(0, 0x02014b50, true)
    central.setUint16(4, 20, true)
    central.setUint16(6, 20, true)
    central.setUint16(8, 0, true)
    central.setUint16(10, 0, true)
    central.setUint16(12, 0, true)
    central.setUint32(14, e.crc >>> 0, true)
    central.setUint32(18, e.data.length, true)
    central.setUint32(22, e.data.length, true)
    central.setUint16(26, nameBytes.length, true)
    central.setUint16(28, 0, true)
    central.setUint16(30, 0, true)
    central.setUint16(32, 0, true)
    central.setUint16(34, 0, true)
    central.setUint32(36, 0, true)
    central.setUint32(40, offset, true)

    const centralRecord = concat(new Uint8Array(central.buffer), nameBytes)
    centralRecords.push(centralRecord)

    offset += record.length
  }

  const centralSize = centralRecords.reduce((s, r) => s + r.length, 0)
  const end = new DataView(new ArrayBuffer(22))
  end.setUint32(0, 0x06054b50, true)
  end.setUint16(4, 0, true)
  end.setUint16(6, 0, true)
  end.setUint16(8, entries.length, true)
  end.setUint16(10, entries.length, true)
  end.setUint32(12, centralSize, true)
  end.setUint32(16, offset, true)
  end.setUint16(20, 0, true)

  const blob = new Blob([
    ...fileRecords,
    ...centralRecords,
    new Uint8Array(end.buffer)
  ], { type: 'application/zip' })
  return blob
}

function concat(...parts: Uint8Array[]): Uint8Array {
  const len = parts.reduce((s, p) => s + p.length, 0)
  const out = new Uint8Array(len)
  let o = 0
  for (const p of parts) { out.set(p, o); o += p.length }
  return out
}

// CRC32 polynomial method
function crc32(data: Uint8Array): number {
  let c = ~0
  for (let i = 0; i < data.length; i++) {
    c ^= data[i]
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1)
    }
  }
  return ~c
}


