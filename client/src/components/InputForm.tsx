import React, { useState, useEffect } from 'react'
import { GenerateInput, BrandTone } from '../../../shared/types.js'
import './InputForm.css'

interface InputFormProps {
  onGenerate: (input: GenerateInput) => void
  loading: boolean
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

export function InputForm({ onGenerate, loading }: InputFormProps) {
  const [input, setInput] = useState<GenerateInput>({
    industry: '',
    useContext: false
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

  const updateContext = (field: string, value: string) => {
    setInput(prev => ({
      ...prev,
      context: {
        ...prev.context,
        [field]: value
      }
    }))
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

        {/* Use Business Context Toggle */}
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={input.useContext || false}
              onChange={(e) => updateInput('useContext', e.target.checked)}
            />
            Use business context in generation
          </label>
          <small>Business details below are for internal reference only</small>
        </div>

        {/* Business Context Fields */}
        {input.useContext && (
          <div className="context-fields">
            <div className="form-group">
              <label htmlFor="businessName">Business Name</label>
              <input
                type="text"
                id="businessName"
                value={input.context?.businessName || ''}
                onChange={(e) => updateContext('businessName', e.target.value)}
                placeholder="Your business name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="tagline">Tagline</label>
              <input
                type="text"
                id="tagline"
                value={input.context?.tagline || ''}
                onChange={(e) => updateContext('tagline', e.target.value)}
                placeholder="Your tagline or slogan"
              />
            </div>

            <div className="form-group">
              <label htmlFor="values">Values</label>
              <textarea
                id="values"
                value={input.context?.values || ''}
                onChange={(e) => updateContext('values', e.target.value)}
                placeholder="Comma-separated values (e.g., innovation, sustainability, community)"
                rows={2}
              />
            </div>

            <div className="form-group">
              <label htmlFor="audience">Target Audience</label>
              <textarea
                id="audience"
                value={input.context?.audience || ''}
                onChange={(e) => updateContext('audience', e.target.value)}
                placeholder="Describe your target audience"
                rows={2}
              />
            </div>

            <div className="form-group">
              <label htmlFor="competitors">Competitors</label>
              <textarea
                id="competitors"
                value={input.context?.competitors || ''}
                onChange={(e) => updateContext('competitors', e.target.value)}
                placeholder="Competitor names or URLs"
                rows={2}
              />
            </div>

            <div className="form-group">
              <label htmlFor="notes">Additional Notes</label>
              <textarea
                id="notes"
                value={input.context?.notes || ''}
                onChange={(e) => updateContext('notes', e.target.value)}
                placeholder="Any additional context or requirements"
                rows={3}
              />
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
