import express from 'express'
import archiver from 'archiver'
import path from 'path'
import fs from 'fs/promises'
import { fileURLToPath } from 'url'
import nodemailer from 'nodemailer'
import { Color, Palette } from '../../shared/types.js'
import { recordDownload } from '../utils/downloadLogger.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

// POST /api/export/zip - Generate and download ZIP file with brand assets
router.post('/export/zip', async (req, res) => {
  try {
    const { paletteIndex, palettes, contactData }: {
      paletteIndex: number;
      palettes: Palette[];
      contactData?: { name: string; businessName: string; email: string }
    } = req.body

    if (typeof paletteIndex !== 'number' || paletteIndex < 0 || paletteIndex >= palettes.length) {
      return res.status(400).json({ error: 'Invalid palette index' })
    }

    const palette = palettes[paletteIndex]

    // If contact data is provided, send email with ZIP contents
    if (contactData) {
      try {
        // Generate the full CSS content for the email
        const cssContent = generateCSSWithFonts(palette)
        await sendExportEmail(contactData, palette, cssContent, 'zip')
      } catch (emailError) {
        console.error('Failed to send export email:', emailError)
        // Don't fail the ZIP download if email fails
      }
    }

    // Record download attempt
    await recordDownload({
      timestamp: new Date().toISOString(),
      exportType: 'zip',
      contact: contactData,
      palette: {
        name: palette.name,
        seedBack: palette.seedBack
      },
      meta: {
        paletteIndex,
        source: 'zip-export-route'
      }
    })

    // Set headers for ZIP download
    const filename = `brand-package-${palette.name.toLowerCase().replace(/\s+/g, '-')}.zip`
    res.setHeader('Content-Type', 'application/zip')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)

    // Create ZIP archive
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    })

    // Pipe archive to response
    archive.pipe(res)

    // Handle archive errors
    archive.on('error', (err) => {
      console.error('Archive error:', err)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to create ZIP file' })
      }
    })

    // Add palette JSON
    archive.append(JSON.stringify(palettes, null, 2), { name: 'palette.json' })

    // Add CSS custom properties
    const cssContent = generateCSSProperties(palette)
    archive.append(cssContent, { name: 'tokens.css' })

    // Add SCSS variables
    const scssContent = generateSCSSVariables(palette)
    archive.append(scssContent, { name: 'tokens.scss' })

    // Add Tailwind config snippet
    const tailwindContent = generateTailwindConfig(palette)
    archive.append(tailwindContent, { name: 'tailwind.config.snippet.js' })

    // Add SVG swatches
    const svgContent = generateSVGSwatches(palette)
    archive.append(svgContent, { name: 'swatches.svg' })

    // Add README with instructions
    const readmeContent = generateReadme(palette)
    archive.append(readmeContent, { name: 'readme.txt' })

    // Add GPL color palette file (simplified version)
    const gplContent = generateGPLPalette(palette)
    archive.append(gplContent, { name: 'palette.gpl' })

    // Finalize archive
    await archive.finalize()

  } catch (error) {
    console.error('Export error:', error)
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Failed to generate export',
        message: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      })
    }
  }
})

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

/* Dark theme variant */
@media (prefers-color-scheme: dark) {
  :root {
    --color-background: hsl(${palette.roles.neutral.hsl[0]}, ${Math.max(0, palette.roles.neutral.hsl[1] - 20)}%, ${Math.max(10, palette.roles.neutral.hsl[2] - 40)}%);
  }
}`]

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

function getSwatches(palette: Palette): Color[] {
  if (Array.isArray((palette as any).swatches) && palette.swatches.length) {
    return palette.swatches
  }

  return [
    palette.roles.primary,
    palette.roles.secondary,
    palette.roles.accent,
    palette.roles.neutral,
    palette.roles.background,
  ]
}

function generateSVGSwatches(palette: Palette): string {
  const swatches = getSwatches(palette)
  const swatchWidth = 200
  const swatchHeight = 60
  const totalHeight = swatchHeight * swatches.length

  const svgElements = swatches.map((color, index) => {
    const y = index * swatchHeight
    return `
  <rect x="0" y="${y}" width="${swatchWidth}" height="${swatchHeight}" fill="${color.hex}"/>
  <text x="10" y="${y + 35}" fill="${color.textOn === 'light' ? '#ffffff' : '#000000'}"
        font-family="Arial, sans-serif" font-size="14" font-weight="bold">
    ${color.role.charAt(0).toUpperCase() + color.role.slice(1)}
  </text>
  <text x="${swatchWidth - 10}" y="${y + 50}" fill="${color.textOn === 'light' ? '#ffffff' : '#000000'}"
        font-family="monospace" font-size="12" text-anchor="end">
    ${color.hex.toUpperCase()}
  </text>`
  }).join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${swatchWidth}" height="${totalHeight}" viewBox="0 0 ${swatchWidth} ${totalHeight}" xmlns="http://www.w3.org/2000/svg">
  <title>${palette.name} Color Swatches</title>
  <desc>Brand color palette swatches for ${palette.name}</desc>${svgElements}
</svg>`
}

function generateReadme(palette: Palette): string {
  return `# ${palette.name} Brand Package

Generated on: ${new Date().toISOString().split('T')[0]}

## Color Palette

This package contains your brand color palette with WCAG 2.2 compliant contrast ratios.

### Color Roles
- **Primary**: ${palette.roles.primary.hex} - Main brand color
- **Secondary**: ${palette.roles.secondary.hex} - Supporting color
- **Accent**: ${palette.roles.accent.hex} - Highlight color
- **Neutral**: ${palette.roles.neutral.hex} - Text and borders
- **Background**: ${palette.roles.background.hex} - Page background

### Typography
- **Headline**: ${palette.typography.headline}
- **Body**: ${palette.typography.body}

### Icon Style Suggestion
${palette.iconStyle}

### Imagery Direction
${palette.imagery.join(', ')}

### Logo Concept Prompts
${palette.logoPrompts.map(prompt => `- ${prompt}`).join('\n')}

## Files Included

- \`palette.json\` - Complete palette data in JSON format
- \`tokens.css\` - CSS custom properties
- \`tokens.scss\` - SCSS variables
- \`tailwind.config.snippet.js\` - Tailwind CSS configuration
- \`swatches.svg\` - Color swatches in SVG format
- \`palette.gpl\` - GIMP/Inkscape palette file
- \`readme.txt\` - This documentation

## Usage

### CSS
\`\`\`css
@import 'tokens.css';

.my-element {
  color: var(--color-primary);
  background-color: var(--color-background);
}
\`\`\`

### SCSS
\`\`\`scss
@import 'tokens.scss';

.my-element {
  color: $color-primary;
  background-color: $color-background;
}
\`\`\`

### Tailwind CSS
Add the contents of \`tailwind.config.snippet.js\` to your Tailwind configuration, then use:
\`\`\`html
<div class="text-brand-primary bg-brand-background">
  Hello World
</div>
\`\`\`

## Accessibility

All colors in this palette meet WCAG 2.2 AA contrast requirements for normal text (4.5:1) and large text (3:1).

## License

This palette was generated algorithmically and is provided as-is for your branding needs.
Typography suggestions use open-source fonts available via Google Fonts.
`
}

function generateGPLPalette(palette: Palette): string {
  const swatches = getSwatches(palette)
  const gpl = [`GIMP Palette
Name: ${palette.name}
Columns: 5
#
${swatches.map(color =>
  `${color.rgb[0]} ${color.rgb[1]} ${color.rgb[2]}\t${color.role}`
).join('\n')}`]

  return gpl.join('\n')
}

function generateCSSWithFonts(palette: Palette): string {
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

async function sendExportEmail(contactData: { name: string; businessName: string; email: string }, palette: Palette, content: string, exportType: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  })

  const htmlContent = generateEmailHTML(contactData, palette, content, exportType)

  const mailOptions = {
    from: process.env.FROM_EMAIL || 'noreply@brandinggenerator.com',
    to: 'robert@sandhillsgeeks.com',
    subject: `Brand Export Request - ${contactData.businessName} - ${exportType.toUpperCase()}`,
    html: htmlContent,
    bcc: contactData.email
  }

  await transporter.sendMail(mailOptions)
}

function generateEmailHTML(contact: any, palette: Palette, content: string, exportType: string): string {
  const exportTypeLabel = exportType.toUpperCase()
  const safeContent = content.replace(/</g, '&lt;').replace(/>/g, '&gt;')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Brand Export Request</title>
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
          <span class="badge">Brand Export</span>
          <h1>Brand Export Details</h1>
          <p><strong>Name:</strong> ${contact.name}</p>
          <p><strong>Business:</strong> ${contact.businessName}</p>
          <p><strong>Email:</strong> ${contact.email}</p>
        </div>

        <div class="section">
          <h2>Selected Palette: ${palette.name}</h2>
          <div class="swatch-grid">
            <div class="swatch-item">
              <div class="swatch-box" style="background:${palette.roles.primary.hex}"></div>
              <span>Primary ${palette.roles.primary.hex}</span>
            </div>
            <div class="swatch-item">
              <div class="swatch-box" style="background:${palette.roles.secondary.hex}"></div>
              <span>Secondary ${palette.roles.secondary.hex}</span>
            </div>
            <div class="swatch-item">
              <div class="swatch-box" style="background:${palette.roles.accent.hex}"></div>
              <span>Accent ${palette.roles.accent.hex}</span>
            </div>
            <div class="swatch-item">
              <div class="swatch-box" style="background:${palette.roles.neutral.hex}"></div>
              <span>Neutral ${palette.roles.neutral.hex}</span>
            </div>
            <div class="swatch-item">
              <div class="swatch-box" style="background:${palette.roles.background.hex}"></div>
              <span>Background ${palette.roles.background.hex}</span>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>${exportTypeLabel} Code</h2>
          <div class="code-block">${safeContent}</div>
        </div>

        <div class="footer">
          This email was generated by the Branding Package Generator · Contact: ${contact.email}
        </div>
      </div>
    </body>
    </html>
  `
}

export { router as exportRoutes }
