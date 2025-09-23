import React, { useState } from 'react'
import { GenerateResponse, Palette } from '../../../shared/types.js'
import { ColorSwatch } from './ColorSwatch.tsx'
import { TypographyPreview } from './TypographyPreview.tsx'
import './PalettePreview.css'

interface PalettePreviewProps {
  response: GenerateResponse
  onExport: (type: 'css' | 'scss' | 'tailwind' | 'zip') => void
  selectedPaletteIndex: number
  onPaletteSelect: (index: number) => void
}

export function PalettePreview({ response, onExport, selectedPaletteIndex, onPaletteSelect }: PalettePreviewProps) {
  const [darkPreview, setDarkPreview] = useState(false)

  const palette = response.palettes[selectedPaletteIndex]

  const handleCopyCSS = () => {
    const css = generateCSSVariables(palette)
    navigator.clipboard.writeText(css)
  }

  const handleCopySCSS = () => {
    const scss = generateSCSSVariables(palette)
    navigator.clipboard.writeText(scss)
  }

  const handleCopyTailwind = () => {
    const tailwind = generateTailwindConfig(palette)
    navigator.clipboard.writeText(tailwind)
  }

  return (
    <div className="palette-preview">
      <div className="palette-tabs">
        {response.palettes.map((p, index) => (
          <button
            key={index}
            className={`tab-button ${selectedPaletteIndex === index ? 'active' : ''}`}
            onClick={() => onPaletteSelect(index)}
          >
            {p.name}
          </button>
        ))}
      </div>

      <div className="palette-content">
        {/* Color Palette */}
        <div className="palette-section">
          <h3>Color Palette</h3>
          <div className="color-grid">
            {Object.entries(palette.roles).map(([role, color]) => (
              <ColorSwatch
                key={role}
                color={color}
                role={role}
                darkPreview={darkPreview}
              />
            ))}
          </div>
        </div>

        {/* Typography */}
        <div className="palette-section">
          <h3>Typography</h3>
          <TypographyPreview
            typography={palette.typography}
            primaryColor={palette.roles.primary.hex}
          />
        </div>

        {/* Additional Brand Elements */}
        <div className="palette-section">
          <h3>Brand Elements</h3>
          <div className="brand-elements">
            <div className="element-item">
              <strong>Icon Style:</strong> {palette.iconStyle}
            </div>
            <div className="element-item">
              <strong>Imagery:</strong> {palette.imagery.join(', ')}
            </div>
            <div className="element-item">
              <strong>Logo Concepts:</strong>
              <ul>
                {palette.logoPrompts.map((prompt, index) => (
                  <li key={index}>{prompt}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="palette-controls">
          <div className="control-group">
            <label>
              <input
                type="checkbox"
                checked={darkPreview}
                onChange={(e) => setDarkPreview(e.target.checked)}
              />
              Dark Preview
            </label>
          </div>
        </div>

        {/* Sample Components */}
        <div className="palette-section">
          <h3>Preview Components</h3>
          <div
            className="component-preview"
            style={{
              backgroundColor: darkPreview ? '#1a1a1a' : palette.roles.background.hex,
              color: darkPreview ? '#ffffff' : palette.roles.neutral.hex
            }}
          >
            <h1 style={{
              fontFamily: palette.typography.headline,
              color: palette.roles.primary.hex
            }}>
              Sample Headline
            </h1>
            <p style={{
              fontFamily: palette.typography.body,
              color: darkPreview ? '#ffffff' : palette.roles.neutral.hex
            }}>
              This is sample body text showing how your brand colors and typography work together.
              <a
                href="#"
                style={{
                  color: palette.roles.accent.hex,
                  textDecoration: 'none'
                }}
              >
                This is a link
              </a> in the text.
            </p>
            <button style={{
              backgroundColor: palette.roles.primary.hex,
              color: palette.roles.primary.textOn === 'light' ? '#ffffff' : '#000000',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              fontFamily: palette.typography.body,
              cursor: 'pointer'
            }}>
              Primary Button
            </button>
            <button style={{
              backgroundColor: palette.roles.accent.hex,
              color: palette.roles.accent.textOn === 'light' ? '#ffffff' : '#000000',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              fontFamily: palette.typography.body,
              cursor: 'pointer',
              marginLeft: '0.5rem'
            }}>
              Accent Button
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function generateCSSVariables(palette: Palette): string {
  return `:root {
  --color-primary: ${palette.roles.primary.hex};
  --color-secondary: ${palette.roles.secondary.hex};
  --color-accent: ${palette.roles.accent.hex};
  --color-neutral: ${palette.roles.neutral.hex};
  --color-background: ${palette.roles.background.hex};
}`
}

function generateSCSSVariables(palette: Palette): string {
  return `$color-primary: ${palette.roles.primary.hex};
$color-secondary: ${palette.roles.secondary.hex};
$color-accent: ${palette.roles.accent.hex};
$color-neutral: ${palette.roles.neutral.hex};
$color-background: ${palette.roles.background.hex};`
}

function generateTailwindConfig(palette: Palette): string {
  return `// Add to tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '${palette.roles.primary.hex}',
          secondary: '${palette.roles.secondary.hex}',
          accent: '${palette.roles.accent.hex}',
          neutral: '${palette.roles.neutral.hex}',
          background: '${palette.roles.background.hex}',
        },
      },
    },
  },
}`
}
