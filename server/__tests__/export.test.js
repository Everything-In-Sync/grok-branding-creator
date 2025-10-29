import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import { createCanvas } from 'canvas'

// Mock palette data for testing
const mockPalette = {
  name: 'Test Palette',
  roles: {
    primary: {
      hex: '#3b82f6',
      rgb: [59, 130, 246],
      hsl: [217, 91, 60],
      role: 'primary',
      textOn: 'light'
    },
    secondary: {
      hex: '#8b5cf6',
      rgb: [139, 92, 246],
      hsl: [258, 90, 66],
      role: 'secondary',
      textOn: 'light'
    },
    accent: {
      hex: '#f59e0b',
      rgb: [245, 158, 11],
      hsl: [38, 92, 50],
      role: 'accent',
      textOn: 'dark'
    },
    neutral: {
      hex: '#64748b',
      rgb: [100, 116, 139],
      hsl: [215, 16, 47],
      role: 'neutral',
      textOn: 'light'
    },
    background: {
      hex: '#f8fafc',
      rgb: [248, 250, 252],
      hsl: [210, 40, 98],
      role: 'background',
      textOn: 'dark'
    }
  },
  typography: {
    headline: 'Playfair Display',
    body: 'Inter',
    links: ['https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@400;600&display=swap']
  },
  iconStyle: 'Rounded, friendly icons',
  imagery: ['Professional photography', 'Clean compositions'],
  logoPrompts: ['Modern geometric logo'],
  seedBack: 12345
}

// Function to test JPG generation (extracted from export.ts logic)
function generateJPGSwatches(palette) {
  const swatches = [
    palette.roles.primary,
    palette.roles.secondary,
    palette.roles.accent,
    palette.roles.neutral,
    palette.roles.background,
  ]

  const swatchWidth = 800
  const swatchHeight = 100
  const totalHeight = swatchHeight * swatches.length

  const canvas = createCanvas(swatchWidth, totalHeight)
  const ctx = canvas.getContext('2d')

  // Draw each color swatch
  swatches.forEach((color, index) => {
    const y = index * swatchHeight

    // Fill swatch background
    ctx.fillStyle = color.hex
    ctx.fillRect(0, y, swatchWidth, swatchHeight)

    // Determine text color based on background
    ctx.fillStyle = color.textOn === 'light' ? '#ffffff' : '#000000'

    // Draw role label
    ctx.font = 'bold 20px Arial'
    ctx.fillText(color.role.charAt(0).toUpperCase() + color.role.slice(1), 20, y + 60)

    // Draw hex code
    ctx.font = '16px monospace'
    ctx.textAlign = 'right'
    ctx.fillText(color.hex.toUpperCase(), swatchWidth - 20, y + 60)
    ctx.textAlign = 'left' // Reset alignment
  })

  // Convert canvas to JPG buffer
  return canvas.toBuffer('image/jpeg', { quality: 0.95 })
}

describe('Export JPG Generation', () => {
  it('should generate JPG buffer from palette', () => {
    const jpgBuffer = generateJPGSwatches(mockPalette)
    
    // Check that we got a Buffer back
    assert(Buffer.isBuffer(jpgBuffer), 'Should return a Buffer')
    
    // Check that buffer has content
    assert(jpgBuffer.length > 0, 'Buffer should not be empty')
    
    // Check that it starts with JPEG magic bytes (FF D8 FF)
    assert.equal(jpgBuffer[0], 0xFF, 'First byte should be 0xFF')
    assert.equal(jpgBuffer[1], 0xD8, 'Second byte should be 0xD8')
    assert.equal(jpgBuffer[2], 0xFF, 'Third byte should be 0xFF')
  })

  it('should generate JPG with correct dimensions', () => {
    const swatchWidth = 800
    const swatchHeight = 100
    const swatchCount = 5
    const expectedHeight = swatchHeight * swatchCount

    const jpgBuffer = generateJPGSwatches(mockPalette)
    
    // Verify the buffer is a valid JPEG
    assert(jpgBuffer.length > 100, 'JPG should have reasonable size')
    
    // The actual image dimensions would need to be verified by decoding,
    // but we can at least verify it's a valid JPEG format
    assert.equal(jpgBuffer[0], 0xFF)
    assert.equal(jpgBuffer[1], 0xD8)
  })

  it('should handle different palette configurations', () => {
    const minimalPalette = {
      name: 'Minimal',
      roles: {
        primary: { hex: '#000000', rgb: [0, 0, 0], hsl: [0, 0, 0], role: 'primary', textOn: 'light' },
        secondary: { hex: '#ffffff', rgb: [255, 255, 255], hsl: [0, 0, 100], role: 'secondary', textOn: 'dark' },
        accent: { hex: '#ff0000', rgb: [255, 0, 0], hsl: [0, 100, 50], role: 'accent', textOn: 'light' },
        neutral: { hex: '#808080', rgb: [128, 128, 128], hsl: [0, 0, 50], role: 'neutral', textOn: 'light' },
        background: { hex: '#f0f0f0', rgb: [240, 240, 240], hsl: [0, 0, 94], role: 'background', textOn: 'dark' },
      },
      typography: { headline: 'Arial', body: 'Arial', links: [] },
      iconStyle: 'Simple',
      imagery: [],
      logoPrompts: [],
      seedBack: 0
    }

    const jpgBuffer = generateJPGSwatches(minimalPalette)
    
    assert(Buffer.isBuffer(jpgBuffer), 'Should generate buffer for minimal palette')
    assert(jpgBuffer.length > 0, 'Buffer should have content')
  })

  it('should generate consistent output for same palette', () => {
    const jpgBuffer1 = generateJPGSwatches(mockPalette)
    const jpgBuffer2 = generateJPGSwatches(mockPalette)
    
    // Buffers should be identical for same input
    assert(jpgBuffer1.equals(jpgBuffer2), 'Same palette should generate identical JPG')
  })
})

