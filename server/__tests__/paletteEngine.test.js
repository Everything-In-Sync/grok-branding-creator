import { PaletteEngine } from '../../engine/paletteEngine.js'
import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'

describe('PaletteEngine', () => {
  it('should generate deterministic palettes with seed', () => {
    const engine1 = new PaletteEngine(42)
    const engine2 = new PaletteEngine(42)

    const input = {
      industry: 'healthcare',
      brandTone: 'conservative',
      themePreference: 'light',
      seed: 42
    }

    const palettes1 = engine1.generatePalettes(input)
    const palettes2 = engine2.generatePalettes(input)

    assert.equal(palettes1.length, 3)
    assert.equal(palettes2.length, 3)

    // Check that palettes are identical
    assert.equal(palettes1[0].name, palettes2[0].name)
    assert.equal(palettes1[0].roles.primary.hex, palettes2[0].roles.primary.hex)
    assert.equal(palettes1[0].roles.secondary.hex, palettes2[0].roles.secondary.hex)
    assert.equal(palettes1[0].roles.accent.hex, palettes2[0].roles.accent.hex)
  })

  it('should generate healthcare palettes with appropriate colors', () => {
    const engine = new PaletteEngine(123)
    const input = {
      industry: 'healthcare',
      brandTone: 'trustworthy'
    }

    const palettes = engine.generatePalettes(input)

    assert.equal(palettes.length, 3)

    palettes.forEach(palette => {
      // Check that all required roles exist
      assert(palette.roles.primary)
      assert(palette.roles.secondary)
      assert(palette.roles.accent)
      assert(palette.roles.neutral)
      assert(palette.roles.background)

      // Check that colors have valid hex values
      assert(/^#[0-9A-Fa-f]{6}$/.test(palette.roles.primary.hex))
      assert(/^#[0-9A-Fa-f]{6}$/.test(palette.roles.secondary.hex))
      assert(/^#[0-9A-Fa-f]{6}$/.test(palette.roles.accent.hex))
      assert(/^#[0-9A-Fa-f]{6}$/.test(palette.roles.neutral.hex))
      assert(/^#[0-9A-Fa-f]{6}$/.test(palette.roles.background.hex))
    })
  })

  it('should ignore business context when useContext is false', () => {
    const engine1 = new PaletteEngine(999)
    const engine2 = new PaletteEngine(999)

    const input1 = {
      industry: 'technology',
      useContext: false,
      context: {
        businessName: 'Test Company',
        tagline: 'Making things better',
        values: 'innovation, quality'
      }
    }

    const input2 = {
      industry: 'technology',
      useContext: false
      // No context provided
    }

    const palettes1 = engine1.generatePalettes(input1)
    const palettes2 = engine2.generatePalettes(input2)

    // Should be identical since context is ignored
    assert.equal(palettes1[0].roles.primary.hex, palettes2[0].roles.primary.hex)
    assert.equal(palettes1[0].roles.secondary.hex, palettes2[0].roles.secondary.hex)
  })

  it('should generate different palettes for different seeds', () => {
    const engine = new PaletteEngine(0)

    const input1 = {
      industry: 'healthcare',
      brandTone: 'modern',
      seed: 111
    }

    const input2 = {
      industry: 'technology',
      brandTone: 'playful',
      seed: 222
    }

    const palettes1 = engine.generatePalettes(input1)
    const palettes2 = engine.generatePalettes(input2)

    // At least one color should be different
    const colors1 = Object.values(palettes1[0].roles).map(c => c.hex)
    const colors2 = Object.values(palettes2[0].roles).map(c => c.hex)

    const hasDifference = colors1.some((color, index) => color !== colors2[index])
    assert(hasDifference, `Palettes should be different with different inputs. Colors1: ${colors1.join(', ')}, Colors2: ${colors2.join(', ')}`)
  })
})
