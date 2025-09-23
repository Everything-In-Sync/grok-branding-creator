import { PaletteEngine } from '../../engine/paletteEngine'
import type { GenerateInput, GenerateResponse } from '../../shared/types'

export const onRequestPost: PagesFunction = async ({ request }) => {
  try {
    const input = (await request.json()) as GenerateInput

    if (!input || !input.industry || typeof input.industry !== 'string') {
      return json({ error: 'Industry is required and must be a string' }, 400)
    }

    if (
      input.brandTone &&
      ![
        'conservative', 'modern', 'playful', 'premium', 'eco', 'trustworthy',
        'energetic', 'minimal', 'artisan', 'techie', 'healthcare', 'finance',
        'hospitality', 'education', 'construction', 'legal', 'nonprofit',
        'restaurant', 'retail', 'beauty', 'fitness', 'automotive', 'real_estate'
      ].includes(input.brandTone)
    ) {
      return json({ error: 'Invalid brand tone' }, 400)
    }

    if (input.themePreference && !['light', 'dark', 'neutral'].includes(input.themePreference)) {
      return json({ error: 'Theme preference must be light, dark, or neutral' }, 400)
    }

    const seed = input.seed || Math.floor(Math.random() * 1_000_000)
    const engine = new PaletteEngine(seed)
    const palettes = engine.generatePalettes(input)

    const body: GenerateResponse = { input, palettes }
    return json(body, 200)
  } catch (err) {
    return json({ error: 'Failed to generate palettes' }, 500)
  }
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  })
}


