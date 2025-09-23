import React, { useState } from 'react'
import { Palette } from '../../../shared/types.js'
import './ContactFormModal.css'

interface ContactFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ContactFormData) => void
  selectedPalette: Palette | null
  exportType: 'css' | 'scss' | 'tailwind' | 'zip'
  loading: boolean
}

export interface ContactFormData {
  name: string
  businessName: string
  email: string
}

export function ContactFormModal({ isOpen, onClose, onSubmit, selectedPalette, exportType, loading }: ContactFormModalProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    businessName: '',
    email: ''
  })

  const [errors, setErrors] = useState<Partial<ContactFormData>>({})

  const validateForm = (): boolean => {
    const newErrors: Partial<ContactFormData> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  if (!isOpen) return null

  const getExportTypeLabel = () => {
    switch (exportType) {
      case 'css': return 'CSS'
      case 'scss': return 'SCSS'
      case 'tailwind': return 'Tailwind'
      case 'zip': return 'ZIP package'
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Export {getExportTypeLabel()}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          <p className="modal-description">
            To export your branding package, please provide your contact information.
            We'll send you the complete {getExportTypeLabel().toLowerCase()} for the selected palette.
          </p>

          {selectedPalette && (
            <div className="selected-palette">
              <h3>Selected Palette: {selectedPalette.name}</h3>
              <div className="palette-preview-colors">
                <div className="color-item">
                  <div className="color-swatch" style={{ backgroundColor: selectedPalette.roles.primary.hex }}></div>
                  <span>Primary</span>
                </div>
                <div className="color-item">
                  <div className="color-swatch" style={{ backgroundColor: selectedPalette.roles.secondary.hex }}></div>
                  <span>Secondary</span>
                </div>
                <div className="color-item">
                  <div className="color-swatch" style={{ backgroundColor: selectedPalette.roles.accent.hex }}></div>
                  <span>Accent</span>
                </div>
                <div className="color-item">
                  <div className="color-swatch" style={{ backgroundColor: selectedPalette.roles.neutral.hex }}></div>
                  <span>Neutral</span>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={errors.name ? 'error' : ''}
                placeholder="Your full name"
                required
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="businessName">Business Name *</label>
              <input
                type="text"
                id="businessName"
                value={formData.businessName}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
                className={errors.businessName ? 'error' : ''}
                placeholder="Your business name"
                required
              />
              {errors.businessName && <span className="error-message">{errors.businessName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={errors.email ? 'error' : ''}
                placeholder="your.email@example.com"
                required
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="modal-actions">
              <button type="button" onClick={onClose} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Sending...' : `Export ${getExportTypeLabel()}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
