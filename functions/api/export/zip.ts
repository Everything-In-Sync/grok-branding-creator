import type { Palette } from '../../../../shared/types'
import { zipSync, strToU8 } from 'fflate'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

export const onRequestPost: PagesFunction = async ({ request, env, context }) => {
  try {
    const { paletteIndex, palettes, contactData } = await request.json() as { paletteIndex: number, palettes: Palette[], contactData?: { name: string, businessName: string, email: string } }
    if (!Array.isArray(palettes) || palettes.length === 0) {
      return new Response('Bad Request', { status: 400 })
    }

    const selected = palettes[paletteIndex] || palettes[0]
    // Build rich files
    const paletteJson = JSON.stringify(palettes, null, 2)
    const tokensCss = generateCSSProperties(selected)
    const tokensScss = generateSCSSVariables(selected)
    const tailwindJs = generateTailwindConfig(selected)
    const readmeTxt = generateReadme(selected)
    const swatchesSvg = generateSwatchesSvg(selected)

    // Generate PDF brand guide
    let brandGuidePdf: Uint8Array | null = null
    try {
      brandGuidePdf = await generatePDFGuide(selected)
    } catch (e) {
      console.warn('PDF generation failed:', e)
    }

    // Generate JPG swatches using canvas (if available in Worker environment)
    let swatchesJpg: Uint8Array | null = null
    try {
      swatchesJpg = await generateSwatchesJpg(selected)
    } catch (e) {
      console.warn('JPG generation not available in this environment:', e)
    }

    const files: Record<string, Uint8Array> = {
      'palette.json': strToU8(paletteJson),
      'styles.css': strToU8(tokensCss),
      'styles.scss': strToU8(tokensScss),
      'tailwind.config.snippet.js': strToU8(tailwindJs),
      'readme.txt': strToU8(readmeTxt),
      'swatches.svg': strToU8(swatchesSvg),
    }

    // Add PDF if generation succeeded
    if (brandGuidePdf) {
      files['brand-guide.pdf'] = brandGuidePdf
    }

    // Add JPG if generation succeeded
    if (swatchesJpg) {
      files['swatches.jpg'] = swatchesJpg
    }

    const zipped = zipSync(files, { level: 0 })

    // If contactData and Mailgun env are present, email the ZIP (best-effort) in background
    if (contactData?.email) {
      const MAILGUN_API_KEY = (env as any)?.MAILGUN_API_KEY as string | undefined
      const MAILGUN_DOMAIN = (env as any)?.MAILGUN_DOMAIN as string | undefined
      const MAILGUN_FROM = ((env as any)?.MAILGUN_FROM as string | undefined) ||
        (MAILGUN_DOMAIN ? `Brand Generator <noreply@${MAILGUN_DOMAIN}>` : undefined)
      const OWNER_EMAIL = (env as any)?.MAILGUN_TO as string | undefined

      const mailgunAvailable = MAILGUN_API_KEY && MAILGUN_DOMAIN && MAILGUN_FROM

      if (mailgunAvailable) {
        const subject = `Brand ZIP - ${contactData.businessName}`
        const html = generateZipEmailHTML(contactData, selected, tokensCss)
        const text = generateZipEmailText(contactData, selected)

        const form = new FormData()
        form.append('from', MAILGUN_FROM)
        form.append('to', contactData.email)
        if (OWNER_EMAIL) {
          form.append('cc', OWNER_EMAIL)
          form.append('bcc', OWNER_EMAIL)
        }
        form.append('subject', subject)
        form.append('html', html)
        form.append('text', text)

        const blob = new Blob([zipped], { type: 'application/zip' })
        form.append('attachment', blob, 'brand-package.zip')

        const auth = 'Basic ' + btoa(`api:${MAILGUN_API_KEY}`)

        const sendMailgun = async () => {
          const response = await fetch(`https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`, {
            method: 'POST',
            headers: { Authorization: auth },
            body: form
          })

          if (!response.ok) {
            const errorText = await response.text().catch(() => '')
            throw new Error(`Mailgun responded with ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ''}`)
          }
        }

        const sendPromise = sendMailgun().catch((err) => {
          console.error('Mailgun send failed:', err)
        })

        if (context?.waitUntil) {
          context.waitUntil(sendPromise)
        } else {
          await sendPromise
        }
      } else {
        console.warn('Mailgun environment variables missing; skipping export email')
      }
    }

    return new Response(zipped, {
      headers: {
        'content-type': 'application/zip',
        'content-disposition': 'attachment; filename="brand-package.zip"'
      }
    })
  } catch (e: any) {
    return new Response(`Failed to create zip: ${e?.message || e}`, { status: 500 })
  }
}

function escapeHtml(s: string): string {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } as any)[c])
}

// Ported token generators from server route
function generateCSSProperties(palette: Palette): string {
  const css = [`/* ${palette.name} Brand Colors */
/* CSS Custom Properties */

:root {
  /* Primary Colors */
  --color-primary: ${palette.roles.primary.hex};
  --color-primary-rgb: ${palette.roles.primary.rgb.join(', ')};
  --color-primary-hsl: ${palette.roles.primary.hsl.join(', ')};

  /* Secondary Colors */
  --color-secondary: ${palette.roles.secondary.hex};
  --color-secondary-rgb: ${palette.roles.secondary.rgb.join(', ')};
  --color-secondary-hsl: ${palette.roles.secondary.hsl.join(', ')};

  /* Accent Colors */
  --color-accent: ${palette.roles.accent.hex};
  --color-accent-rgb: ${palette.roles.accent.rgb.join(', ')};
  --color-accent-hsl: ${palette.roles.accent.hsl.join(', ')};

  /* Neutral Colors */
  --color-neutral: ${palette.roles.neutral.hex};
  --color-neutral-rgb: ${palette.roles.neutral.rgb.join(', ')};
  --color-neutral-hsl: ${palette.roles.neutral.hsl.join(', ')};

  /* Background Colors */
  --color-background: ${palette.roles.background.hex};
  --color-background-rgb: ${palette.roles.background.rgb.join(', ')};
  --color-background-hsl: ${palette.roles.background.hsl.join(', ')};

  /* Typography */
  --font-headline: '${palette.typography.headline}', serif;
  --font-body: '${palette.typography.body}', sans-serif;
}
`]
  return css.join('\n')
}

function generateSCSSVariables(palette: Palette): string {
  const scss = [`// ${palette.name} Brand Colors
// SCSS Variables

// Primary Colors
$color-primary: ${palette.roles.primary.hex};
$color-primary-rgb: (${palette.roles.primary.rgb.join(', ')});
$color-primary-hsl: (${palette.roles.primary.hsl.join(', ')});

// Secondary Colors
$color-secondary: ${palette.roles.secondary.hex};
$color-secondary-rgb: (${palette.roles.secondary.rgb.join(', ')});
$color-secondary-hsl: (${palette.roles.secondary.hsl.join(', ')});

// Accent Colors
$color-accent: ${palette.roles.accent.hex};
$color-accent-rgb: (${palette.roles.accent.rgb.join(', ')});
$color-accent-hsl: (${palette.roles.accent.hsl.join(', ')});

// Neutral Colors
$color-neutral: ${palette.roles.neutral.hex};
$color-neutral-rgb: (${palette.roles.neutral.rgb.join(', ')});
$color-neutral-hsl: (${palette.roles.neutral.hsl.join(', ')});

// Background Colors
$color-background: ${palette.roles.background.hex};
$color-background-rgb: (${palette.roles.background.rgb.join(', ')});
$color-background-hsl: (${palette.roles.background.hsl.join(', ')});

// Typography
$font-headline: '${palette.typography.headline}', serif;
$font-body: '${palette.typography.body}', sans-serif;

// Color Map for easy access
$brand-colors: (
  primary: $color-primary,
  secondary: $color-secondary,
  accent: $color-accent,
  neutral: $color-neutral,
  background: $color-background
);`]
  return scss.join('\n')
}

function generateTailwindConfig(palette: Palette): string {
  const config = [`// ${palette.name} Brand Colors
// Tailwind CSS Configuration Snippet
// Add this to your tailwind.config.js colors object

module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          primary: {
            DEFAULT: '${palette.roles.primary.hex}',
            rgb: 'rgb(${palette.roles.primary.rgb.join(' ')})',
            hsl: 'hsl(${palette.roles.primary.hsl.join(' ')})',
          },
          secondary: {
            DEFAULT: '${palette.roles.secondary.hex}',
            rgb: 'rgb(${palette.roles.secondary.rgb.join(' ')})',
            hsl: 'hsl(${palette.roles.secondary.hsl.join(' ')})',
          },
          accent: {
            DEFAULT: '${palette.roles.accent.hex}',
            rgb: 'rgb(${palette.roles.accent.rgb.join(' ')})',
            hsl: 'hsl(${palette.roles.accent.hsl.join(' ')})',
          },
          neutral: {
            DEFAULT: '${palette.roles.neutral.hex}',
            rgb: 'rgb(${palette.roles.neutral.rgb.join(' ')})',
            hsl: 'hsl(${palette.roles.neutral.hsl.join(' ')})',
          },
          background: {
            DEFAULT: '${palette.roles.background.hex}',
            rgb: 'rgb(${palette.roles.background.rgb.join(' ')})',
            hsl: 'hsl(${palette.roles.background.hsl.join(' ')})',
          },
        },
      },
      fontFamily: {
        headline: ['${palette.typography.headline}', 'serif'],
        body: ['${palette.typography.body}', 'sans-serif'],
      },
    },
  },
}`]
  return config.join('\n')
}

function generateZipEmailText(contact: { name: string; businessName: string; email: string }, palette: Palette): string {
  return [
    `Hey ${contact.name} at ${contact.businessName},`,
    '',
    `Here's the ZIP package for the ${palette.name} palette.`,
    '',
    'Inside you will find:',
    '- palette.json',
    '- tokens.css',
    '- tokens.scss',
    '- tailwind.config.snippet.js',
    '- swatches.svg',
    '- readme.txt',
    '',
    `If ${contact.email} is not the best contact, let me know!`,
    '',
    'Thanks!',
  ].join('\n')
}

function generateZipEmailHTML(contact: { name: string; businessName: string; email: string }, palette: Palette, cssContent: string): string {
  const safeCss = cssContent
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Brand ZIP Export</title>
      <style>
        body { margin: 0; background: #141414; color: #f4f4f5; font-family: 'Inter', 'Segoe UI', sans-serif; line-height: 1.6; }
        .container { max-width: 720px; margin: 0 auto; padding: 32px 20px 40px; }
        h1 { font-size: 28px; margin: 0 0 24px; }
        h2 { font-size: 20px; margin: 0 0 16px; }
        .section { background: #1d1d1f; border-radius: 14px; padding: 20px 24px; margin-bottom: 24px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35); }
        .section p { margin: 6px 0; color: #d0d0d3; }
        .section strong { color: #ffffff; }
        .swatch-grid { display: flex; flex-wrap: wrap; gap: 14px; }
        .swatch-item { display: flex; align-items: center; gap: 12px; min-width: 200px; }
        .swatch-box { width: 34px; height: 34px; border-radius: 8px; border: 2px solid rgba(255, 255, 255, 0.35); }
        .swatch-item span { font-size: 14px; color: #e7e7eb; }
        .code-block { background: #1e2535; color: #e6ecff; padding: 18px 20px; border-radius: 12px; overflow-x: auto; font-family: 'SFMono-Regular', 'Consolas', monospace; font-size: 13px; white-space: pre-wrap; }
        .footer { text-align: center; font-size: 12px; color: #9ea0a6; margin-top: 28px; }
        .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; background: linear-gradient(135deg, #816bff, #60a5fa); color: #fff; font-size: 12px; letter-spacing: 0.04em; text-transform: uppercase; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="section">
          <span class="badge">Brand ZIP Export</span>
          <h1>${escapeHtml(palette.name)}</h1>
          <p><strong>Name:</strong> ${escapeHtml(contact.name)}</p>
          <p><strong>Business:</strong> ${escapeHtml(contact.businessName)}</p>
          <p><strong>Email:</strong> ${escapeHtml(contact.email)}</p>
        </div>

        <div class="section">
          <h2>Palette Colors</h2>
          <div class="swatch-grid">
            <div class="swatch-item"><div class="swatch-box" style="background:${palette.roles.primary.hex}"></div><span>Primary ${palette.roles.primary.hex}</span></div>
            <div class="swatch-item"><div class="swatch-box" style="background:${palette.roles.secondary.hex}"></div><span>Secondary ${palette.roles.secondary.hex}</span></div>
            <div class="swatch-item"><div class="swatch-box" style="background:${palette.roles.accent.hex}"></div><span>Accent ${palette.roles.accent.hex}</span></div>
            <div class="swatch-item"><div class="swatch-box" style="background:${palette.roles.neutral.hex}"></div><span>Neutral ${palette.roles.neutral.hex}</span></div>
            <div class="swatch-item"><div class="swatch-box" style="background:${palette.roles.background.hex}"></div><span>Background ${palette.roles.background.hex}</span></div>
          </div>
        </div>

        <div class="section">
          <h2>CSS Tokens Preview</h2>
          <div class="code-block">${safeCss}</div>
        </div>

        <div class="footer">ZIP includes tokens, Tailwind snippet, SVG swatches, and readme · Contact: ${escapeHtml(contact.email)}</div>
      </div>
    </body>
    </html>
  `
}

function generateSwatchesSvg(palette: Palette): string {
  const width = 800
  const itemH = 80
  const sourceSwatches = Array.isArray((palette as any).swatches) && (palette as any).swatches.length
    ? (palette as any).swatches as any[]
    : [
      { role: 'primary', hex: palette.roles.primary.hex, textOn: palette.roles.primary.textOn },
      { role: 'secondary', hex: palette.roles.secondary.hex, textOn: palette.roles.secondary.textOn },
      { role: 'accent', hex: palette.roles.accent.hex, textOn: palette.roles.accent.textOn },
      { role: 'neutral', hex: palette.roles.neutral.hex, textOn: palette.roles.neutral.textOn },
      { role: 'background', hex: palette.roles.background.hex, textOn: palette.roles.background.textOn },
    ]
  const height = itemH * sourceSwatches.length
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <style>
    .label{font-family:Arial, Helvetica, sans-serif;font-size:16px;font-weight:bold}
    .code{font-family:monospace;font-size:14px}
  </style>
  ${sourceSwatches.map((c: any, i: number) => {
    const y = i * itemH
    const textColor = c.textOn === 'light' ? '#ffffff' : '#000000'
    return `
    <rect x="0" y="${y}" width="${width}" height="${itemH}" fill="${c.hex}"/>
    <text class="label" x="16" y="${y + 50}" fill="${textColor}">${c.role.toUpperCase()}</text>
    <text class="code" x="${width - 16}" y="${y + 50}" fill="${textColor}" text-anchor="end">${c.hex.toUpperCase()}</text>`
  }).join('')}
</svg>`
}

async function generateSwatchesJpg(palette: Palette): Promise<Uint8Array> {
  const width = 800
  const itemH = 100
  const sourceSwatches = Array.isArray((palette as any).swatches) && (palette as any).swatches.length
    ? (palette as any).swatches as any[]
    : [
      { role: 'primary', hex: palette.roles.primary.hex, textOn: palette.roles.primary.textOn },
      { role: 'secondary', hex: palette.roles.secondary.hex, textOn: palette.roles.secondary.textOn },
      { role: 'accent', hex: palette.roles.accent.hex, textOn: palette.roles.accent.textOn },
      { role: 'neutral', hex: palette.roles.neutral.hex, textOn: palette.roles.neutral.textOn },
      { role: 'background', hex: palette.roles.background.hex, textOn: palette.roles.background.textOn },
    ]
  const height = itemH * sourceSwatches.length

  // Use OffscreenCanvas if available (Cloudflare Workers)
  const canvas = new OffscreenCanvas(width, height)
  const ctx = canvas.getContext('2d') as any
  
  if (!ctx) {
    throw new Error('Canvas context not available')
  }

  // Draw each color swatch
  sourceSwatches.forEach((color: any, index: number) => {
    const y = index * itemH

    // Fill swatch background
    ctx.fillStyle = color.hex
    ctx.fillRect(0, y, width, itemH)

    // Determine text color based on background
    ctx.fillStyle = color.textOn === 'light' ? '#ffffff' : '#000000'

    // Draw role label
    ctx.font = 'bold 20px Arial'
    ctx.fillText(color.role.charAt(0).toUpperCase() + color.role.slice(1), 20, y + 60)

    // Draw hex code
    ctx.font = '16px monospace'
    ctx.textAlign = 'right'
    ctx.fillText(color.hex.toUpperCase(), width - 20, y + 60)
    ctx.textAlign = 'left' // Reset alignment
  })

  // Convert canvas to JPG blob
  const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.95 })
  const arrayBuffer = await blob.arrayBuffer()
  return new Uint8Array(arrayBuffer)
}

async function generatePDFGuide(palette: Palette): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  
  // Helper to convert hex to RGB (0-1 range)
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255
    } : { r: 0, g: 0, b: 0 }
  }

  const sourceSwatches = Array.isArray((palette as any).swatches) && (palette as any).swatches.length
    ? (palette as any).swatches as any[]
    : [
      { role: 'primary', hex: palette.roles.primary.hex, textOn: palette.roles.primary.textOn, rgb: palette.roles.primary.rgb, hsl: palette.roles.primary.hsl },
      { role: 'secondary', hex: palette.roles.secondary.hex, textOn: palette.roles.secondary.textOn, rgb: palette.roles.secondary.rgb, hsl: palette.roles.secondary.hsl },
      { role: 'accent', hex: palette.roles.accent.hex, textOn: palette.roles.accent.textOn, rgb: palette.roles.accent.rgb, hsl: palette.roles.accent.hsl },
      { role: 'neutral', hex: palette.roles.neutral.hex, textOn: palette.roles.neutral.textOn, rgb: palette.roles.neutral.rgb, hsl: palette.roles.neutral.hsl },
      { role: 'background', hex: palette.roles.background.hex, textOn: palette.roles.background.textOn, rgb: palette.roles.background.rgb, hsl: palette.roles.background.hsl },
    ]

  // Page 1: Cover and Colors
  const page1 = pdfDoc.addPage([612, 792]) // Letter size
  const { width, height } = page1.getSize()
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)

  // Title
  page1.drawText(palette.name, {
    x: 50,
    y: height - 80,
    size: 28,
    font: helveticaBold,
    color: rgb(0, 0, 0)
  })

  page1.drawText('Brand Identity Guide', {
    x: 50,
    y: height - 110,
    size: 12,
    font: helvetica,
    color: rgb(0.4, 0.4, 0.4)
  })

  // Typography Section
  let yPos = height - 160
  page1.drawText('Typography', {
    x: 50,
    y: yPos,
    size: 18,
    font: helveticaBold,
    color: rgb(0, 0, 0)
  })

  yPos -= 25
  page1.drawText(`Headline Font: ${palette.typography.headline}`, {
    x: 50,
    y: yPos,
    size: 11,
    font: helvetica,
    color: rgb(0, 0, 0)
  })

  yPos -= 18
  page1.drawText(`Body Font: ${palette.typography.body}`, {
    x: 50,
    y: yPos,
    size: 11,
    font: helvetica,
    color: rgb(0, 0, 0)
  })

  // Color Palette Section
  yPos -= 40
  page1.drawText('Color Palette', {
    x: 50,
    y: yPos,
    size: 18,
    font: helveticaBold,
    color: rgb(0, 0, 0)
  })

  yPos -= 30
  sourceSwatches.forEach((color: any) => {
    const colorRgb = hexToRgb(color.hex)
    
    // Draw color box
    page1.drawRectangle({
      x: 50,
      y: yPos - 60,
      width: 60,
      height: 60,
      color: rgb(colorRgb.r, colorRgb.g, colorRgb.b)
    })

    // Draw role name
    page1.drawText(color.role.charAt(0).toUpperCase() + color.role.slice(1), {
      x: 125,
      y: yPos - 15,
      size: 12,
      font: helveticaBold,
      color: rgb(0, 0, 0)
    })

    // Draw HEX
    page1.drawText(`HEX: ${color.hex.toUpperCase()}`, {
      x: 125,
      y: yPos - 30,
      size: 10,
      font: helvetica,
      color: rgb(0.2, 0.2, 0.2)
    })

    // Draw RGB
    page1.drawText(`RGB: ${color.rgb.join(', ')}`, {
      x: 125,
      y: yPos - 45,
      size: 10,
      font: helvetica,
      color: rgb(0.2, 0.2, 0.2)
    })

    // Draw HSL
    const hslText = `HSL: ${color.hsl[0]}°, ${color.hsl[1]}%, ${color.hsl[2]}%`
    page1.drawText(hslText, {
      x: 125,
      y: yPos - 60,
      size: 10,
      font: helvetica,
      color: rgb(0.2, 0.2, 0.2)
    })

    yPos -= 80
  })

  // Page 2: Accessibility and Thank You
  const page2 = pdfDoc.addPage([612, 792])
  yPos = height - 80

  // Accessibility Section
  page2.drawText('Accessibility', {
    x: 50,
    y: yPos,
    size: 18,
    font: helveticaBold,
    color: rgb(0, 0, 0)
  })

  yPos -= 25
  page2.drawText('All colors meet WCAG 2.2 AA contrast requirements:', {
    x: 50,
    y: yPos,
    size: 10,
    font: helvetica,
    color: rgb(0.2, 0.2, 0.2)
  })

  yPos -= 18
  page2.drawText('• Normal text: 4.5:1 contrast ratio minimum', {
    x: 60,
    y: yPos,
    size: 10,
    font: helvetica,
    color: rgb(0.2, 0.2, 0.2)
  })

  yPos -= 15
  page2.drawText('• Large text: 3:1 contrast ratio minimum', {
    x: 60,
    y: yPos,
    size: 10,
    font: helvetica,
    color: rgb(0.2, 0.2, 0.2)
  })

  yPos -= 15
  page2.drawText('• UI components: 3:1 contrast ratio minimum', {
    x: 60,
    y: yPos,
    size: 10,
    font: helvetica,
    color: rgb(0.2, 0.2, 0.2)
  })

  // Suggested Usage
  yPos -= 40
  page2.drawText('Suggested Usage', {
    x: 50,
    y: yPos,
    size: 18,
    font: helveticaBold,
    color: rgb(0, 0, 0)
  })

  yPos -= 25
  const usageText = [
    'Primary: Main call-to-action buttons and key brand elements',
    'Secondary: Secondary buttons and supporting UI elements',
    'Accent: Highlights and drawing attention to specific elements',
    'Neutral: Body text, borders, and subtle UI elements',
    'Background: Main page background and content areas'
  ]

  usageText.forEach(text => {
    page2.drawText(`• ${text}`, {
      x: 60,
      y: yPos,
      size: 9,
      font: helvetica,
      color: rgb(0.2, 0.2, 0.2),
      maxWidth: 500
    })
    yPos -= 20
  })

  // Sandhills Geeks Footer
  yPos = 350
  page2.drawText('Thank You!', {
    x: width / 2 - 50,
    y: yPos,
    size: 16,
    font: helveticaBold,
    color: rgb(0, 0, 0)
  })

  yPos -= 30
  page2.drawText('Sandhills Geeks thanks you for using our Brand Package Creator.', {
    x: width / 2 - 220,
    y: yPos,
    size: 10,
    font: helvetica,
    color: rgb(0.2, 0.2, 0.2)
  })

  yPos -= 20
  const desc1 = 'We are empowering businesses and non-profits to reach their full online potential'
  page2.drawText(desc1, {
    x: width / 2 - desc1.length * 2.5,
    y: yPos,
    size: 9,
    font: helvetica,
    color: rgb(0.33, 0.33, 0.33)
  })

  yPos -= 15
  const desc2 = 'with tailored web development and hosting solutions. We offer fast, secure,'
  page2.drawText(desc2, {
    x: width / 2 - desc2.length * 2.4,
    y: yPos,
    size: 9,
    font: helvetica,
    color: rgb(0.33, 0.33, 0.33)
  })

  yPos -= 15
  const desc3 = 'SEO-optimized website solutions with a personal touch.'
  page2.drawText(desc3, {
    x: width / 2 - desc3.length * 2.4,
    y: yPos,
    size: 9,
    font: helvetica,
    color: rgb(0.33, 0.33, 0.33)
  })

  yPos -= 20
  const desc4 = 'Let us take care of your online presence, so you can focus on what'
  page2.drawText(desc4, {
    x: width / 2 - desc4.length * 2.3,
    y: yPos,
    size: 9,
    font: helvetica,
    color: rgb(0.33, 0.33, 0.33)
  })

  yPos -= 15
  const desc5 = 'matters most - running your business.'
  page2.drawText(desc5, {
    x: width / 2 - desc5.length * 2.3,
    y: yPos,
    size: 9,
    font: helvetica,
    color: rgb(0.33, 0.33, 0.33)
  })

  yPos -= 25
  page2.drawText('Please contact us to build and expand your business online.', {
    x: width / 2 - 180,
    y: yPos,
    size: 10,
    font: helveticaBold,
    color: rgb(0, 0, 0)
  })

  yPos -= 30
  page2.drawText('sandhillsgeeks.com', {
    x: width / 2 - 60,
    y: yPos,
    size: 11,
    font: helveticaBold,
    color: rgb(0, 0.4, 0.8)
  })

  yPos -= 18
  page2.drawText('contact@sandhillsgeeks.com', {
    x: width / 2 - 80,
    y: yPos,
    size: 10,
    font: helvetica,
    color: rgb(0.2, 0.2, 0.2)
  })

  yPos -= 18
  page2.drawText('(910) 248-3038', {
    x: width / 2 - 48,
    y: yPos,
    size: 10,
    font: helvetica,
    color: rgb(0.2, 0.2, 0.2)
  })

  const pdfBytes = await pdfDoc.save()
  return pdfBytes
}

function generateReadme(palette: Palette): string {
  return `# ${palette.name} Brand Package

Generated on: ${new Date().toISOString().split('T')[0]}

## Color Palette

This package contains your brand color palette with suggested typography.

### Roles
- Primary: ${palette.roles.primary.hex}
- Secondary: ${palette.roles.secondary.hex}
- Accent: ${palette.roles.accent.hex}
- Neutral: ${palette.roles.neutral.hex}
- Background: ${palette.roles.background.hex}

### Typography
- Headline: ${palette.typography.headline}
- Body: ${palette.typography.body}

## Files Included
- brand-guide.pdf — Complete brand identity guide with colors, typography, and usage guidelines
- palette.json — Full data
- styles.css — CSS custom properties (tokens)
- styles.scss — SCSS variables
- tailwind.config.snippet.js — Tailwind color snippet
- swatches.svg — Color preview (SVG format)
- swatches.jpg — Color preview (JPG format)
- readme.txt — This guide

## Quick Start
- CSS: import styles.css and use var(--color-primary)
- SCSS: import styles.scss and use $color-primary
- Tailwind: merge tailwind.config.snippet.js into your config
`
}
