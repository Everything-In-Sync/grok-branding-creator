import React, { useState } from 'react'
import { GenerateInput, GenerateResponse, Palette } from '../../shared/types.js'
import { InputForm } from './components/InputForm.tsx'
import { PalettePreview } from './components/PalettePreview.tsx'
import { ContactFormModal, ContactFormData } from './components/ContactFormModal.tsx'
import './App.css'

function App() {
  const [response, setResponse] = useState<GenerateResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedExportType, setSelectedExportType] = useState<'css' | 'scss' | 'tailwind' | 'zip'>('css')
  const [selectedPaletteIndex, setSelectedPaletteIndex] = useState(0)
  const [exportLoading, setExportLoading] = useState(false)

  const handleGenerate = async (input: GenerateInput) => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      })

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const data: GenerateResponse = await res.json()
      setResponse(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Generation error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleZipDownload = async (paletteIndex: number) => {
    if (!response) return

    try {
      const res = await fetch('/api/export/zip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paletteIndex,
          palettes: response.palettes,
        }),
      })

      if (!res.ok) {
        throw new Error(`Export failed: ${res.status}`)
      }

      // Create download link
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `brand-package-${response.palettes[paletteIndex].name.toLowerCase().replace(/\s+/g, '-')}.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed')
      console.error('Export error:', err)
    }
  }

  const handleZipDownloadContact = async (contactData: ContactFormData) => {
    if (!response) return

    const res = await fetch('/api/export/zip', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paletteIndex: selectedPaletteIndex,
        palettes: response.palettes,
        contactData
      }),
    })

    if (!res.ok) {
      throw new Error(`Export failed: ${res.status}`)
    }

    // Create download link
    const blob = await res.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `brand-package-${response.palettes[selectedPaletteIndex].name.toLowerCase().replace(/\s+/g, '-')}.zip`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const handleExport = (type: 'css' | 'scss' | 'tailwind' | 'zip') => {
    setSelectedExportType(type)
    setModalOpen(true)
  }

  const handleContactFormSubmit = async (contactData: ContactFormData) => {
    if (!response) return

    setExportLoading(true)

    try {
      const palette = response.palettes[selectedPaletteIndex]

      // Generate the CSS/SCSS/Tailwind content based on export type
      let content = ''
      switch (selectedExportType) {
        case 'css':
          content = generateCSSWithFonts(palette)
          break
        case 'scss':
          content = generateSCSSWithFonts(palette)
          break
        case 'tailwind':
          content = generateTailwindWithFonts(palette)
          break
        case 'zip':
          // For ZIP, we'll send the request to get the download
          await handleZipDownloadContact(contactData)
          setModalOpen(false)
          setExportLoading(false)
          return
      }

      // Send email with contact data and content
      await sendExportEmail(contactData, palette, content, selectedExportType)

      // Copy to clipboard for CSS/SCSS/Tailwind
      if (selectedExportType !== 'zip') {
        await navigator.clipboard.writeText(content)
        alert(`${selectedExportType.toUpperCase()} copied to clipboard! We've also sent it to your email.`)
      }

      setModalOpen(false)
    } catch (err) {
      console.error('Export error:', err)
      alert('Failed to export. Please try again.')
    } finally {
      setExportLoading(false)
    }
  }

  const generateCSSWithFonts = (palette: Palette): string => {
    const css = [`/* ${palette.name} Brand Colors & Fonts */
/* CSS Custom Properties */

@import url('${palette.typography.links[0]}');

:root {
  /* Colors */
  --color-primary: ${palette.roles.primary.hex};
  --color-secondary: ${palette.roles.secondary.hex};
  --color-accent: ${palette.roles.accent.hex};
  --color-neutral: ${palette.roles.neutral.hex};
  --color-background: ${palette.roles.background.hex};

  /* Fonts */
  --font-headline: '${palette.typography.headline}', serif;
  --font-body: '${palette.typography.body}', sans-serif;
}

/* Usage examples */
.brand-primary { color: var(--color-primary); }
.brand-background { background-color: var(--color-background); }
.headline-font { font-family: var(--font-headline); }
.body-font { font-family: var(--font-body); }`]

    return css.join('\n')
  }

  const generateSCSSWithFonts = (palette: Palette): string => {
    const scss = [`// ${palette.name} Brand Colors & Fonts
// SCSS Variables

@import url('${palette.typography.links[0]}');

// Colors
$color-primary: ${palette.roles.primary.hex};
$color-secondary: ${palette.roles.secondary.hex};
$color-accent: ${palette.roles.accent.hex};
$color-neutral: ${palette.roles.neutral.hex};
$color-background: ${palette.roles.background.hex};

// Fonts
$font-headline: '${palette.typography.headline}', serif;
$font-body: '${palette.typography.body}', sans-serif;

// Color Map
$brand-colors: (
  primary: $color-primary,
  secondary: $color-secondary,
  accent: $color-accent,
  neutral: $color-neutral,
  background: $color-background
);

// Usage examples
.brand-primary { color: $color-primary; }
.brand-background { background-color: $color-background; }
.headline-font { font-family: $font-headline; }
.body-font { font-family: $font-body; }`]

    return scss.join('\n')
  }

  const generateTailwindWithFonts = (palette: Palette): string => {
    const tailwind = [`// ${palette.name} Brand Colors & Fonts
// Tailwind CSS Configuration
// Add this to your tailwind.config.js

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
      fontFamily: {
        headline: ['${palette.typography.headline}', 'serif'],
        body: ['${palette.typography.body}', 'sans-serif'],
      },
    },
  },
}

// Usage examples:
// text-brand-primary, bg-brand-background
// font-headline, font-body`]

    return tailwind.join('\n')
  }


  const sendExportEmail = async (contactData: ContactFormData, palette: Palette, content: string, type: string) => {
    const emailData = {
      contact: contactData,
      palette: palette,
      content: content,
      exportType: type
    }

    const response = await fetch('/api/send-export', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    })

    if (!response.ok) {
      throw new Error('Failed to send email')
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Branding Package Generator</h1>
        <p>Generate professional brand starter packages from industry input</p>
      </header>

      <main className="app-main">
        <div className="input-section">
          <InputForm
            onGenerate={handleGenerate}
            onExport={handleExport}
            loading={loading}
            response={response}
          />

          {error && (
            <div className="error-message">
              <h3>Error</h3>
              <p>{error}</p>
            </div>
          )}
        </div>

        <div className="preview-section">
          {response && (
            <PalettePreview
              response={response}
              onExport={handleExport}
              selectedPaletteIndex={selectedPaletteIndex}
              onPaletteSelect={setSelectedPaletteIndex}
            />
          )}
        </div>
      </main>

      <ContactFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleContactFormSubmit}
        selectedPalette={response ? response.palettes[selectedPaletteIndex] : null}
        exportType={selectedExportType}
        loading={exportLoading}
      />
    </div>
  )
}

export default App
