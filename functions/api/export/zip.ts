import type { Palette } from '../../../../shared/types'
import { zipSync, strToU8 } from 'fflate'

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

    const files: Record<string, Uint8Array> = {
      'palette.json': strToU8(paletteJson),
      'styles.css': strToU8(tokensCss),
      'styles.scss': strToU8(tokensScss),
      'tailwind.config.snippet.js': strToU8(tailwindJs),
      'readme.txt': strToU8(readmeTxt),
      'swatches.svg': strToU8(swatchesSvg),
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
        const html = `
          <p>Hey ${escapeHtml(contactData.name)} at ${escapeHtml(contactData.businessName)},</p>
          <p>Here is the ZIP package you requested with your branding assets. The ZIP includes CSS tokens, SCSS variables, a Tailwind snippet, palette JSON, and swatch previews.</p>
          <p>Is <strong>${escapeHtml(contactData.email)}</strong> the best email to reach you?</p>
          <p>Thanks!</p>
        `
        const text = `Hey ${contactData.name} at ${contactData.businessName},\n\nHere is the ZIP package you requested with your branding assets.\n\nIs ${contactData.email} the best email to reach you?\n\nThanks!`

        const form = new FormData()
        form.append('from', MAILGUN_FROM)
        form.append('to', contactData.email)
        if (OWNER_EMAIL) form.append('bcc', OWNER_EMAIL)
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
  return String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' } as any)[c])
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
- palette.json — Full data
- styles.css — CSS custom properties (tokens)
- styles.scss — SCSS variables
- tailwind.config.snippet.js — Tailwind color snippet
- swatches.svg — Color preview
- readme.txt — This guide

## Quick Start
- CSS: import styles.css and use var(--color-primary)
- SCSS: import styles.scss and use $color-primary
- Tailwind: merge tailwind.config.snippet.js into your config
`
}
