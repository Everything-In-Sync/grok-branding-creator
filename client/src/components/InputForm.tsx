import React, { useState, useEffect } from 'react'
import { GenerateInput, BrandTone, GenerateResponse } from '../../../shared/types.js'
import './InputForm.css'

interface InputFormProps {
  onGenerate: (input: GenerateInput) => void
  onExport: (type: 'css' | 'scss' | 'tailwind' | 'zip') => void
  loading: boolean
  response: GenerateResponse | null
}

const INDUSTRIES = [
  'healthcare', 'construction', 'legal', 'finance', 'beauty', 'restaurant',
  'technology', 'education', 'real estate', 'nonprofit', 'hospitality',
  'retail', 'fitness', 'automotive'
]

const BRAND_TONES: BrandTone[] = [
  'conservative', 'modern', 'playful', 'premium', 'eco', 'trustworthy',
  'energetic', 'minimal', 'artisan', 'techie', 'healthcare', 'finance',
  'hospitality', 'education', 'construction', 'legal', 'nonprofit',
  'restaurant', 'retail', 'beauty', 'fitness', 'automotive', 'real_estate'
]

const THEME_PREFERENCES = ['light', 'dark', 'neutral'] as const

export function InputForm({ onGenerate, onExport, loading, response }: InputFormProps) {
  const [input, setInput] = useState<GenerateInput>({
    industry: ''
  })

  const [industries, setIndustries] = useState<string[]>([])
  const [tones, setTones] = useState<BrandTone[]>([])

  useEffect(() => {
    // Load available industries and tones
    fetch('/api/industries')
      .then(res => res.json())
      .then(data => setIndustries(data.industries))
      .catch(console.error)

    fetch('/api/tones')
      .then(res => res.json())
      .then(data => setTones(data.tones))
      .catch(console.error)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.industry.trim()) {
      onGenerate(input)
    }
  }

  const updateInput = (field: keyof GenerateInput, value: any) => {
    setInput(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="input-form">
      <div className="form-header">
        <img src="/assets/images/logo.png" alt="Logo" className="form-logo" />
        <h2>Generate Brand Package</h2>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Industry */}
        <div className="form-group">
          <label htmlFor="industry">Industry *</label>
          <input
            type="text"
            id="industry"
            list="industries-list"
            value={input.industry}
            onChange={(e) => updateInput('industry', e.target.value)}
            placeholder="e.g., healthcare, technology, retail"
            required
          />
          <datalist id="industries-list">
            {industries.map(industry => (
              <option key={industry} value={industry} />
            ))}
          </datalist>
        </div>

        {/* Brand Tone */}
        <div className="form-group">
          <label htmlFor="brandTone">Brand Tone</label>
          <select
            id="brandTone"
            value={input.brandTone || ''}
            onChange={(e) => updateInput('brandTone', e.target.value || undefined)}
          >
            <option value="">Select tone (optional)</option>
            {tones.map(tone => (
              <option key={tone} value={tone}>
                {tone.charAt(0).toUpperCase() + tone.slice(1).replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Theme Preference */}
        <div className="form-group">
          <label htmlFor="themePreference">Theme Preference</label>
          <select
            id="themePreference"
            value={input.themePreference || ''}
            onChange={(e) => updateInput('themePreference', e.target.value || undefined)}
          >
            <option value="">Neutral (default)</option>
            {THEME_PREFERENCES.map(theme => (
              <option key={theme} value={theme}>
                {theme.charAt(0).toUpperCase() + theme.slice(1)} first
              </option>
            ))}
          </select>
        </div>

        {/* Random Seed */}
        <div className="form-group">
          <label htmlFor="seed">Random Seed</label>
          <input
            type="number"
            id="seed"
            value={input.seed || ''}
            onChange={(e) => updateInput('seed', e.target.value ? parseInt(e.target.value) : undefined)}
            placeholder="Leave empty for random"
            min="0"
          />
          <small>Same seed + same inputs = same results</small>
        </div>

        {/* Export Options */}
        {response && (
          <div className="export-section">
            <h3>Export Options</h3>
            <div className="export-buttons">
              <button type="button" onClick={() => onExport('css')} className="export-button">
                Copy CSS
              </button>
              <button type="button" onClick={() => onExport('scss')} className="export-button">
                Copy SCSS
              </button>
              <button type="button" onClick={() => onExport('tailwind')} className="export-button">
                Copy Tailwind
              </button>
              <button type="button" onClick={() => onExport('zip')} className="export-button export-button-primary">
                Download ZIP
              </button>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="generate-button"
          disabled={loading || !input.industry.trim()}
        >
          {loading ? 'Generating...' : 'Generate Brand Package'}
        </button>
      </form>
    </div>
  )
}
