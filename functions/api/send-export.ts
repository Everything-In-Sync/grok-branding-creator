export const onRequestPost: PagesFunction = async ({ request, env }) => {
  try {
    const { contact, palette, content, exportType } = await request.json()

    if (!contact?.email || !contact?.name || !contact?.businessName || !content || !exportType) {
      return json({ error: 'Missing required fields' }, 400)
    }

    const MAILGUN_API_KEY = (env as any)?.MAILGUN_API_KEY as string | undefined
    const MAILGUN_DOMAIN = (env as any)?.MAILGUN_DOMAIN as string | undefined
    const MAILGUN_FROM = ((env as any)?.MAILGUN_FROM as string | undefined) ||
      (MAILGUN_DOMAIN ? `Brand Generator <noreply@${MAILGUN_DOMAIN}>` : undefined)
    const OWNER_EMAIL = (env as any)?.MAILGUN_TO as string | undefined

    if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN || !MAILGUN_FROM) {
      // Email not configured in this environment
      return json({ success: false, error: 'Email not configured' }, 501)
    }

    // Build email
    const subject = `Brand Export - ${contact.businessName} - ${exportType.toUpperCase()}`
    const html = generateEmailHTML(contact, palette, content, exportType)

    const form = new FormData()
    form.append('from', MAILGUN_FROM)
    form.append('to', contact.email)
    if (OWNER_EMAIL) {
      form.append('cc', OWNER_EMAIL)
      form.append('bcc', OWNER_EMAIL)
    }
    form.append('subject', subject)
    form.append('html', html)

    // Attach the export content as a file for convenience (non-zip types only)
    if (exportType !== 'zip') {
      const filename = `brand.${exportType === 'tailwind' ? 'js' : exportType}`
      const file = new File([content], filename, { type: 'text/plain;charset=utf-8' })
      form.append('attachment', file)
    }

    const auth = 'Basic ' + btoa(`api:${MAILGUN_API_KEY}`)
    const res = await fetch(`https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`, {
      method: 'POST',
      headers: { Authorization: auth },
      body: form
    })

    if (!res.ok) {
      const text = await res.text()
      return json({ success: false, error: 'Mailgun request failed', detail: text }, 502)
    }

    return json({ success: true })
  } catch (e: any) {
    return json({ error: 'Invalid request', detail: e?.message }, 400)
  }
}

function generateEmailHTML(contact: any, palette: any, content: string, exportType: string): string {
  const exportTypeLabel = exportType.toUpperCase()
  return `<!DOCTYPE html>
  <html><head><meta charset="utf-8"><title>Brand Export</title>
  <style>body{font-family:Arial,Helvetica,sans-serif;color:#333} .box{background:#f7f7f9;padding:16px;border-radius:8px}
  .sw{display:inline-block;width:28px;height:28px;border-radius:4px;border:1px solid #ddd;margin-right:6px}
  pre{white-space:pre-wrap;background:#0f172a;color:#e2e8f0;padding:12px;border-radius:6px;overflow:auto}
  </style></head><body>
  <h1>Brand Export</h1>
  <div class="box">
    <p><strong>Name:</strong> ${escapeHtml(contact.name)}</p>
    <p><strong>Business:</strong> ${escapeHtml(contact.businessName)}</p>
    <p><strong>Email:</strong> ${escapeHtml(contact.email)}</p>
  </div>
  <h2>Selected Palette: ${escapeHtml(palette?.name || '')}</h2>
  <div class="box">
    <div><span class="sw" style="background:${palette?.roles?.primary?.hex}"></span>Primary ${palette?.roles?.primary?.hex}</div>
    <div><span class="sw" style="background:${palette?.roles?.secondary?.hex}"></span>Secondary ${palette?.roles?.secondary?.hex}</div>
    <div><span class="sw" style="background:${palette?.roles?.accent?.hex}"></span>Accent ${palette?.roles?.accent?.hex}</div>
    <div><span class="sw" style="background:${palette?.roles?.neutral?.hex}"></span>Neutral ${palette?.roles?.neutral?.hex}</div>
    <div><span class="sw" style="background:${palette?.roles?.background?.hex}"></span>Background ${palette?.roles?.background?.hex}</div>
  </div>
  <h2>${exportTypeLabel} Code</h2>
  <pre>${escapeHtml(content)}</pre>
  </body></html>`
}

function escapeHtml(s: string): string {
  return String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' } as any)[c])
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  })
}

