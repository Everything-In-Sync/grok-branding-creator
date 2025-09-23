import React, { useState } from 'react'
import { GenerateInput, GenerateResponse } from '../../shared/types.js'
import { InputForm } from './components/InputForm.tsx'
import { PalettePreview } from './components/PalettePreview.tsx'
import './App.css'

function App() {
  const [response, setResponse] = useState<GenerateResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  const handleExport = async (paletteIndex: number) => {
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

  return (
    <div className="app">
      <header className="app-header">
        <h1>Branding Package Generator</h1>
        <p>Generate professional brand starter packages from industry input</p>
      </header>

      <main className="app-main">
        <div className="input-section">
          <InputForm onGenerate={handleGenerate} loading={loading} />

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
            />
          )}
        </div>
      </main>
    </div>
  )
}

export default App
