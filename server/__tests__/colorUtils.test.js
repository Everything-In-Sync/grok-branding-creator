import { getContrastRatio, meetsAAContrast, meetsAAAContrast, hexToRgb, rgbToHsl, getRelativeLuminance } from '../../engine/colorUtils.js'
import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'

describe('Color Utilities', () => {
  it('should calculate correct contrast ratio', () => {
    // Black on white should have high contrast
    const blackLum = getRelativeLuminance(0, 0, 0)
    const whiteLum = getRelativeLuminance(255, 255, 255)
    const contrast = getContrastRatio(blackLum, whiteLum)

    assert(contrast > 20, 'Black on white should have high contrast')
    assert(meetsAAContrast(contrast), 'Black on white should meet AA contrast')
  })

  it('should convert hex to RGB correctly', () => {
    const rgb = hexToRgb('#FF0000')
    assert.deepEqual(rgb, [255, 0, 0])

    const rgb2 = hexToRgb('#00FF00')
    assert.deepEqual(rgb2, [0, 255, 0])

    const rgb3 = hexToRgb('#0000FF')
    assert.deepEqual(rgb3, [0, 0, 255])
  })

  it('should convert RGB to HSL correctly', () => {
    const hsl = rgbToHsl(255, 0, 0)
    assert.equal(Math.round(hsl[0]), 0) // Hue for red
    assert.equal(Math.round(hsl[1]), 100) // Full saturation
    assert.equal(Math.round(hsl[2]), 50) // Medium lightness
  })

  it('should validate contrast requirements', () => {
    // Test AA contrast (4.5:1 for normal text)
    assert(meetsAAContrast(4.5), '4.5:1 should meet AA')
    assert(meetsAAContrast(5.0), '5.0:1 should meet AA')
    assert(!meetsAAContrast(4.0), '4.0:1 should not meet AA')

    // Test AAA contrast (7:1 for normal text)
    assert(meetsAAAContrast(7.0), '7.0:1 should meet AAA')
    assert(!meetsAAAContrast(6.5), '6.5:1 should not meet AAA')
  })

  it('should calculate relative luminance correctly', () => {
    // Pure black should have 0 luminance
    const blackLum = getRelativeLuminance(0, 0, 0)
    assert.equal(blackLum, 0)

    // Pure white should have 1 luminance
    const whiteLum = getRelativeLuminance(255, 255, 255)
    assert.equal(whiteLum, 1)

    // Gray should have medium luminance
    const grayLum = getRelativeLuminance(128, 128, 128)
    assert(grayLum > 0.2 && grayLum < 0.3, 'Gray should have medium luminance')
  })
})
