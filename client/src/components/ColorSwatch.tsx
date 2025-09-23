import React from 'react'
import { Color } from '../../../shared/types.js'
import './ColorSwatch.css'

interface ColorSwatchProps {
  color: Color
  role: string
  darkPreview?: boolean
}

export function ColorSwatch({ color, role, darkPreview = false }: ColorSwatchProps) {
  // Use white text on dark backgrounds; fall back to black for light ones
  const shouldUseWhiteText = role === 'background' || darkPreview || color.textOn === 'light'
  const textColor = shouldUseWhiteText ? '#ffffff' : '#000000'
  const bgColor = darkPreview && role === 'background' ? '#1a1a1a' : color.hex

  return (
    <div className="color-swatch" style={{ backgroundColor: bgColor }}>
      <div className="color-info">
        <div className="color-name" style={{ color: textColor }}>
          {role.charAt(0).toUpperCase() + role.slice(1)}
        </div>
        <div className="color-hex" style={{ color: textColor }}>
          {color.hex.toUpperCase()}
        </div>
        <div className="color-rgb" style={{ color: textColor }}>
          RGB({color.rgb.join(', ')})
        </div>
        <div className="color-hsl" style={{ color: textColor }}>
          HSL({color.hsl.map(v => typeof v === 'number' ? Math.round(v) : v).join(', ')})
        </div>
        <div className="color-contrast" style={{ color: textColor }}>
          Contrast: {color.contrastOnText.toFixed(2)}:1
        </div>
        <div className="color-luminance" style={{ color: textColor }}>
          Luminance: {color.luminance.toFixed(3)}
        </div>
      </div>
    </div>
  )
}
