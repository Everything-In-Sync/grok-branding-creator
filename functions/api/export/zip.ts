import type { Palette } from '../../../../shared/types'
import { zipSync, strToU8 } from 'fflate'

export const onRequestPost: PagesFunction = async ({ request, env }) => {
  try {
    const { paletteIndex, palettes, contactData } = await request.json() as { paletteIndex: number, palettes: Palette[], contactData?: { name: string, businessName: string, email: string } }
    if (!Array.isArray(palettes) || palettes.length === 0) {
      return new Response('Bad Request', { status: 400 })
    }

    const selected = palettes[paletteIndex] || palettes[0]
    const files: Record<string, string> = {
      'README.txt': `Brand package: ${selected.name}\nGenerated on ${new Date().toISOString()}\n`,
      'colors.css': `:root{--color-primary:${selected.roles.primary.hex};--color-secondary:${selected.roles.secondary.hex};--color-accent:${selected.roles.accent.hex};--color-neutral:${selected.roles.neutral.hex};--color-background:${selected.roles.background.hex};}`,
    }

    const zipped = zipSync(
      Object.fromEntries(
        Object.entries(files).map(([name, text]) => [name, strToU8(text)])
      ),
      { level: 0 }
    )

    // If contactData and Mailgun env are present, email the ZIP (best-effort)
    try {
      if (contactData?.email) {
        const MAILGUN_API_KEY = (env as any)?.MAILGUN_API_KEY as string | undefined
        const MAILGUN_DOMAIN = (env as any)?.MAILGUN_DOMAIN as string | undefined
        const MAILGUN_FROM = ((env as any)?.MAILGUN_FROM as string | undefined) ||
          (MAILGUN_DOMAIN ? `Brand Generator <noreply@${MAILGUN_DOMAIN}>` : undefined)
        const OWNER_EMAIL = (env as any)?.MAILGUN_TO as string | undefined

        if (MAILGUN_API_KEY && MAILGUN_DOMAIN && MAILGUN_FROM) {
          const subject = `Brand ZIP - ${contactData.businessName}`
          const html = `<p>Hi ${escapeHtml(contactData.name)},</p><p>Attached is your brand ZIP package.</p>`

          const form = new FormData()
          form.append('from', MAILGUN_FROM)
          form.append('to', contactData.email)
          if (OWNER_EMAIL) form.append('bcc', OWNER_EMAIL)
          form.append('subject', subject)
          form.append('html', html)

          const file = new File([zipped], 'brand-package.zip', { type: 'application/zip' })
          form.append('attachment', file)

          const auth = 'Basic ' + btoa(`api:${MAILGUN_API_KEY}`)
          await fetch(`https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`, {
            method: 'POST',
            headers: { Authorization: auth },
            body: form
          })
        }
      }
    } catch (e) {
      // Non-blocking: email failures should not prevent download
      console.warn('ZIP email send failed:', e)
    }

    return new Response(zipped, {
      headers: {
        'content-type': 'application/zip',
        'content-disposition': 'attachment; filename="brand-package.zip"'
      }
    })
  } catch (e) {
    return new Response('Failed to create zip', { status: 500 })
  }
}

function escapeHtml(s: string): string {
  return String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' } as any)[c])
}


