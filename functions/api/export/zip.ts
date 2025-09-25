import type { Palette } from '../../../../shared/types'
import { zipSync, strToU8 } from 'fflate'

export const onRequestPost: PagesFunction = async ({ request }) => {
  try {
    const { paletteIndex, palettes } = await request.json() as { paletteIndex: number, palettes: Palette[] }
    if (!Array.isArray(palettes) || palettes.length === 0) {
      return new Response('Bad Request', { status: 400 })
    }

    const selected = palettes[paletteIndex] || palettes[0]
    const files: Record<string, string> = {
      'README.txt': `Brand package: ${selected.name}\nGenerated on ${new Date().toISOString()}\n`,
      'colors.css': `:root{--color-primary:${selected.roles.primary.hex};--color-secondary:${selected.roles.secondary.hex};--color-accent:${selected.roles.accent.hex};--color-neutral:${selected.roles.neutral.hex};--color-background:${selected.roles.background.hex};}`,
    }

    const zipped = zipSync(
      Object.fromEntries(
        Object.entries(files).map(([name, text]) => [name, strToU8(text)])
      ),
      { level: 0 }
    )

    return new Response(zipped, {
      headers: {
        'content-type': 'application/zip',
        'content-disposition': 'attachment; filename="brand-package.zip"'
      }
    })
  } catch (e) {
    return new Response('Failed to create zip', { status: 500 })
  }
}


