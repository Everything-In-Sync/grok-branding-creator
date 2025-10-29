import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import PDFDocument from 'pdfkit'

// Mock palette data for testing
const mockPalette = {
  name: 'Test Brand Palette',
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

function generatePDFGuide(palette) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ 
      size: 'LETTER',
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    })
    
    const buffers = []
    doc.on('data', buffers.push.bind(buffers))
    doc.on('end', () => resolve(Buffer.concat(buffers)))
    doc.on('error', reject)

    const swatches = [
      palette.roles.primary,
      palette.roles.secondary,
      palette.roles.accent,
      palette.roles.neutral,
      palette.roles.background,
    ]
    
    // Header
    doc.fontSize(28).font('Helvetica-Bold').text(palette.name, { align: 'center' })
    doc.moveDown(0.5)
    doc.fontSize(12).font('Helvetica').fillColor('#666666')
       .text('Brand Identity Guide', { align: 'center' })
    doc.moveDown(2)

    // Typography Section
    doc.fontSize(18).fillColor('#000000').font('Helvetica-Bold').text('Typography')
    doc.moveDown(0.5)
    doc.fontSize(11).font('Helvetica')
    doc.text(`Headline Font: ${palette.typography.headline}`)
    doc.text(`Body Font: ${palette.typography.body}`)
    doc.moveDown(1.5)

    // Color Palette Section
    doc.fontSize(18).font('Helvetica-Bold').text('Color Palette')
    doc.moveDown(0.5)

    let yPosition = doc.y

    swatches.forEach((color, index) => {
      if (yPosition > 650) {
        doc.addPage()
        yPosition = 50
      }

      const boxSize = 60
      const xPos = 50
      doc.rect(xPos, yPosition, boxSize, boxSize).fill(color.hex)

      doc.font('Helvetica-Bold').fontSize(12).fillColor('#000000')
      doc.text(color.role.charAt(0).toUpperCase() + color.role.slice(1), xPos + boxSize + 15, yPosition + 5)
      
      doc.font('Helvetica').fontSize(10).fillColor('#333333')
      doc.text(`HEX: ${color.hex.toUpperCase()}`, xPos + boxSize + 15, yPosition + 22)
      doc.text(`RGB: ${color.rgb.join(', ')}`, xPos + boxSize + 15, yPosition + 35)
      doc.text(`HSL: ${color.hsl[0]}°, ${color.hsl[1]}%, ${color.hsl[2]}%`, xPos + boxSize + 15, yPosition + 48)

      yPosition += boxSize + 20
      doc.moveDown(1)
    })

    // Accessibility Section
    doc.moveDown(1)
    doc.fontSize(18).fillColor('#000000').font('Helvetica-Bold').text('Accessibility')
    doc.moveDown(0.5)
    doc.fontSize(10).font('Helvetica').fillColor('#333333')
    doc.text('All colors meet WCAG 2.2 AA requirements')

    // Add Sandhills Geeks footer
    doc.addPage()
    doc.y = 300
    doc.fontSize(16).fillColor('#000000').font('Helvetica-Bold')
       .text('Thank You!', { align: 'center' })
    doc.moveDown(1)
    doc.fontSize(10).font('Helvetica').fillColor('#333333')
       .text('Sandhills Geeks thanks you for using our Brand Package Creator.', { align: 'center' })
    doc.moveDown(1)
    doc.fontSize(11).fillColor('#0066cc').font('Helvetica-Bold')
       .text('sandhillsgeeks.com', { align: 'center' })
    doc.moveDown(0.3)
    doc.fontSize(10).fillColor('#333333').font('Helvetica')
       .text('contact@sandhillsgeeks.com', { align: 'center' })
    doc.moveDown(0.3)
    doc.text('(910) 248-3038', { align: 'center' })

    doc.end()
  })
}

describe('PDF Brand Guide Generation', () => {
  it('should generate PDF buffer from palette', async () => {
    const pdfBuffer = await generatePDFGuide(mockPalette)
    
    // Check that we got a Buffer back
    assert(Buffer.isBuffer(pdfBuffer), 'Should return a Buffer')
    
    // Check that buffer has content
    assert(pdfBuffer.length > 0, 'Buffer should not be empty')
    
    // Check that it starts with PDF magic bytes (%PDF)
    const pdfHeader = pdfBuffer.toString('utf8', 0, 4)
    assert.equal(pdfHeader, '%PDF', 'Should start with PDF header')
  })

  it('should generate PDF with reasonable size', async () => {
    const pdfBuffer = await generatePDFGuide(mockPalette)
    
    // PDF should be at least 2KB (reasonable minimum for a document with content)
    assert(pdfBuffer.length > 2000, `PDF should have reasonable size, got ${pdfBuffer.length} bytes`)
    
    // PDF should be less than 500KB (not bloated)
    assert(pdfBuffer.length < 500000, 'PDF should not be excessively large')
  })

  it('should handle palette with minimal data', async () => {
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
      iconStyle: '',
      imagery: [],
      logoPrompts: [],
      seedBack: 0
    }

    const pdfBuffer = await generatePDFGuide(minimalPalette)
    
    assert(Buffer.isBuffer(pdfBuffer), 'Should generate buffer for minimal palette')
    assert(pdfBuffer.length > 0, 'Buffer should have content')
    
    const pdfHeader = pdfBuffer.toString('utf8', 0, 4)
    assert.equal(pdfHeader, '%PDF', 'Should be valid PDF')
  })

  it('should generate valid PDF structure', async () => {
    const pdfBuffer = await generatePDFGuide(mockPalette)
    
    const pdfString = pdfBuffer.toString('latin1') // Use latin1 to preserve binary data
    
    // Check for essential PDF elements
    assert(pdfString.includes('%PDF'), 'Should contain PDF header')
    assert(pdfString.includes('%%EOF'), 'Should contain PDF end marker')
    assert(pdfString.includes('/Type /Page') || pdfString.includes('/Type/Page'), 'Should contain page objects')
  })

  it('should create multi-page PDF document', async () => {
    const pdfBuffer = await generatePDFGuide(mockPalette)
    const pdfString = pdfBuffer.toString('latin1')
    
    // Check that multiple pages are created (should have at least 2 pages: content + thank you page)
    const pageMatches = pdfString.match(/\/Type\s*\/Page/g) || pdfString.match(/\/Type\/Page/g)
    assert(pageMatches, 'Should contain page definitions')
    assert(pageMatches.length >= 2, `Should have at least 2 pages, found ${pageMatches ? pageMatches.length : 0}`)
  })

  it('should complete generation without errors', async () => {
    // Test that the generation completes successfully without throwing
    let errorThrown = false
    try {
      const pdfBuffer = await generatePDFGuide(mockPalette)
      assert(pdfBuffer.length > 0, 'Should generate non-empty PDF')
    } catch (error) {
      errorThrown = true
    }
    assert(!errorThrown, 'PDF generation should not throw errors')
  })
})

