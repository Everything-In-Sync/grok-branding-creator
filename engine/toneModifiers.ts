import { BrandTone, ToneModifier, Typography } from '../shared/types.js'

export const TONE_MODIFIERS: Record<BrandTone, ToneModifier> = {
  conservative: {
    saturation: 0.7,
    lightness: 0.4,
    contrast: 1.2
  },
  modern: {
    saturation: 0.9,
    lightness: 0.5,
    contrast: 1.1
  },
  playful: {
    saturation: 1.1,
    lightness: 0.6,
    contrast: 1.0
  },
  premium: {
    saturation: 0.8,
    lightness: 0.35,
    contrast: 1.4
  },
  eco: {
    saturation: 0.9,
    lightness: 0.5,
    contrast: 1.1
  },
  trustworthy: {
    saturation: 0.75,
    lightness: 0.45,
    contrast: 1.15
  },
  energetic: {
    saturation: 1.0,
    lightness: 0.55,
    contrast: 1.05
  },
  minimal: {
    saturation: 0.85,
    lightness: 0.5,
    contrast: 1.3
  },
  artisan: {
    saturation: 0.95,
    lightness: 0.45,
    contrast: 1.2
  },
  techie: {
    saturation: 0.9,
    lightness: 0.5,
    contrast: 1.1
  },
  healthcare: {
    saturation: 0.8,
    lightness: 0.5,
    contrast: 1.1
  },
  finance: {
    saturation: 0.7,
    lightness: 0.4,
    contrast: 1.2
  },
  hospitality: {
    saturation: 0.9,
    lightness: 0.5,
    contrast: 1.1
  },
  education: {
    saturation: 0.85,
    lightness: 0.5,
    contrast: 1.1
  },
  construction: {
    saturation: 0.9,
    lightness: 0.45,
    contrast: 1.15
  },
  legal: {
    saturation: 0.75,
    lightness: 0.4,
    contrast: 1.25
  },
  nonprofit: {
    saturation: 0.85,
    lightness: 0.5,
    contrast: 1.1
  },
  restaurant: {
    saturation: 0.9,
    lightness: 0.5,
    contrast: 1.1
  },
  retail: {
    saturation: 0.95,
    lightness: 0.5,
    contrast: 1.05
  },
  beauty: {
    saturation: 1.0,
    lightness: 0.55,
    contrast: 1.0
  },
  fitness: {
    saturation: 0.95,
    lightness: 0.5,
    contrast: 1.1
  },
  automotive: {
    saturation: 0.9,
    lightness: 0.45,
    contrast: 1.15
  },
  real_estate: {
    saturation: 0.85,
    lightness: 0.5,
    contrast: 1.1
  }
}

export const TYPOGRAPHY_SUGGESTIONS: Record<BrandTone, Typography> = {
  conservative: {
    headline: 'Libre Baskerville',
    headlineWeights: [400, 700],
    body: 'Source Sans 3',
    bodyWeights: [400, 600],
    links: [
      'https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=Source+Sans+3:wght@400;600&display=swap'
    ]
  },
  modern: {
    headline: 'Inter',
    headlineWeights: [400, 600],
    body: 'Roboto Slab',
    bodyWeights: [400, 500],
    links: [
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Roboto+Slab:wght@400;500&display=swap'
    ]
  },
  playful: {
    headline: 'Baloo 2',
    headlineWeights: [400, 700],
    body: 'Nunito',
    bodyWeights: [400, 600],
    links: [
      'https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;700&family=Nunito:wght@400;600&display=swap'
    ]
  },
  premium: {
    headline: 'Playfair Display',
    headlineWeights: [400, 700],
    body: 'Inter',
    bodyWeights: [400, 500],
    links: [
      'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@400;500&display=swap'
    ]
  },
  eco: {
    headline: 'Source Serif 4',
    headlineWeights: [400, 600],
    body: 'Inter',
    bodyWeights: [400, 500],
    links: [
      'https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;600&family=Inter:wght@400;500&display=swap'
    ]
  },
  trustworthy: {
    headline: 'Source Sans 3',
    headlineWeights: [400, 600],
    body: 'Source Sans 3',
    bodyWeights: [400, 500],
    links: [
      'https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;500;600&display=swap'
    ]
  },
  energetic: {
    headline: 'Righteous',
    headlineWeights: [400],
    body: 'Mulish',
    bodyWeights: [400, 600],
    links: [
      'https://fonts.googleapis.com/css2?family=Righteous&family=Mulish:wght@400;600&display=swap'
    ]
  },
  minimal: {
    headline: 'Inter',
    headlineWeights: [400, 500],
    body: 'Inter',
    bodyWeights: [400, 500],
    links: [
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap'
    ]
  },
  artisan: {
    headline: 'Crimson Text',
    headlineWeights: [400, 600],
    body: 'Source Sans 3',
    bodyWeights: [400, 500],
    links: [
      'https://fonts.googleapis.com/css2?family=Crimson+Text:wght@400;600&family=Source+Sans+3:wght@400;500&display=swap'
    ]
  },
  techie: {
    headline: 'Space Grotesk',
    headlineWeights: [400, 700],
    body: 'Inter',
    bodyWeights: [400, 500],
    links: [
      'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&family=Inter:wght@400;500&display=swap'
    ]
  },
  healthcare: {
    headline: 'Poppins',
    headlineWeights: [400, 600],
    body: 'Source Sans 3',
    bodyWeights: [400, 500],
    links: [
      'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&family=Source+Sans+3:wght@400;500&display=swap'
    ]
  },
  finance: {
    headline: 'Source Sans 3',
    headlineWeights: [400, 600],
    body: 'Source Sans 3',
    bodyWeights: [400, 500],
    links: [
      'https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;500;600&display=swap'
    ]
  },
  hospitality: {
    headline: 'Playfair Display',
    headlineWeights: [400, 600],
    body: 'Inter',
    bodyWeights: [400, 500],
    links: [
      'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=Inter:wght@400;500&display=swap'
    ]
  },
  education: {
    headline: 'Inter',
    headlineWeights: [400, 600],
    body: 'Source Sans 3',
    bodyWeights: [400, 500],
    links: [
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Source+Sans+3:wght@400;500&display=swap'
    ]
  },
  construction: {
    headline: 'Oswald',
    headlineWeights: [400, 600],
    body: 'Source Sans 3',
    bodyWeights: [400, 500],
    links: [
      'https://fonts.googleapis.com/css2?family=Oswald:wght@400;600&family=Source+Sans+3:wght@400;500&display=swap'
    ]
  },
  legal: {
    headline: 'Libre Baskerville',
    headlineWeights: [400, 700],
    body: 'Work Sans',
    bodyWeights: [400, 500],
    links: [
      'https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=Work+Sans:wght@400;500&display=swap'
    ]
  },
  nonprofit: {
    headline: 'Source Sans 3',
    headlineWeights: [400, 600],
    body: 'Inter',
    bodyWeights: [400, 500],
    links: [
      'https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;600&family=Inter:wght@400;500&display=swap'
    ]
  },
  restaurant: {
    headline: 'Playfair Display',
    headlineWeights: [400, 700],
    body: 'Inter',
    bodyWeights: [400, 500],
    links: [
      'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@400;500&display=swap'
    ]
  },
  retail: {
    headline: 'Inter',
    headlineWeights: [400, 600],
    body: 'Inter',
    bodyWeights: [400, 500],
    links: [
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap'
    ]
  },
  beauty: {
    headline: 'Playfair Display',
    headlineWeights: [400, 600],
    body: 'Inter',
    bodyWeights: [400, 500],
    links: [
      'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=Inter:wght@400;500&display=swap'
    ]
  },
  fitness: {
    headline: 'Oswald',
    headlineWeights: [400, 600],
    body: 'Inter',
    bodyWeights: [400, 500],
    links: [
      'https://fonts.googleapis.com/css2?family=Oswald:wght@400;600&family=Inter:wght@400;500&display=swap'
    ]
  },
  automotive: {
    headline: 'Inter',
    headlineWeights: [400, 600],
    body: 'Source Sans 3',
    bodyWeights: [400, 500],
    links: [
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Source+Sans+3:wght@400;500&display=swap'
    ]
  },
  real_estate: {
    headline: 'Source Sans 3',
    headlineWeights: [400, 600],
    body: 'Inter',
    bodyWeights: [400, 500],
    links: [
      'https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;600&family=Inter:wght@400;500&display=swap'
    ]
  }
}
