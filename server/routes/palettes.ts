import express from 'express'
import { GenerateInput, GenerateResponse } from '../../shared/types.js'
import { PaletteEngine } from '../../engine/paletteEngine.js'

const router = express.Router()

// POST /api/generate - Generate brand palettes
router.post('/generate', async (req, res) => {
  try {
    const input: GenerateInput = req.body

    // Validate required fields
    if (!input.industry || typeof input.industry !== 'string') {
      return res.status(400).json({
        error: 'Industry is required and must be a string'
      })
    }

    // Validate optional fields
    if (input.seed !== undefined && (typeof input.seed !== 'number' || input.seed < 0)) {
      return res.status(400).json({
        error: 'Seed must be a non-negative number'
      })
    }

    if (input.brandTone && ![
      'conservative', 'modern', 'playful', 'premium', 'eco', 'trustworthy',
      'energetic', 'minimal', 'artisan', 'techie', 'healthcare', 'finance',
      'hospitality', 'education', 'construction', 'legal', 'nonprofit',
      'restaurant', 'retail', 'beauty', 'fitness', 'automotive', 'real_estate'
    ].includes(input.brandTone)) {
      return res.status(400).json({
        error: 'Invalid brand tone'
      })
    }

    if (input.themePreference && !['light', 'dark', 'neutral'].includes(input.themePreference)) {
      return res.status(400).json({
        error: 'Theme preference must be light, dark, or neutral'
      })
    }

    // Create palette engine with seed for deterministic results
    const seed = input.seed || Math.floor(Math.random() * 1000000)
    const engine = new PaletteEngine(seed)

    // Generate palettes
    const palettes = engine.generatePalettes(input)

    const response: GenerateResponse = {
      input,
      palettes
    }

    res.json(response)

  } catch (error) {
    console.error('Palette generation error:', error)
    res.status(500).json({
      error: 'Failed to generate palettes',
      message: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    })
  }
})

// GET /api/industries - Get available industries for autocomplete
router.get('/industries', (req, res) => {
  const industries = [
    'healthcare', 'construction', 'legal', 'finance', 'beauty', 'restaurant',
    'technology', 'education', 'real estate', 'nonprofit', 'hospitality',
    'retail', 'fitness', 'automotive'
  ]

  res.json({ industries })
})

// GET /api/tones - Get available brand tones
router.get('/tones', (req, res) => {
  const tones = [
    'conservative', 'modern', 'playful', 'premium', 'eco', 'trustworthy',
    'energetic', 'minimal', 'artisan', 'techie', 'healthcare', 'finance',
    'hospitality', 'education', 'construction', 'legal', 'nonprofit',
    'restaurant', 'retail', 'beauty', 'fitness', 'automotive', 'real_estate'
  ]

  res.json({ tones })
})

export { router as paletteRoutes }
