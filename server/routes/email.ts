import express from 'express'
import nodemailer from 'nodemailer'
import { Palette } from '../../shared/types.js'
import { recordDownload, DownloadLogEntry } from '../utils/downloadLogger.js'

const router = express.Router()

interface EmailRequest {
  contact: {
    name: string
    businessName: string
    email: string
  }
  palette: Palette
  content: string
  exportType: 'css' | 'scss' | 'tailwind' | 'zip'
}

// POST /api/send-export - Send export email
router.post('/send-export', async (req, res) => {
  try {
    const { contact, palette, content, exportType }: EmailRequest = req.body

    // Validate required fields
    if (!contact.name || !contact.businessName || !contact.email || !content) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Record download event regardless of email status
    const exportTypeValue: DownloadLogEntry['exportType'] = exportType

    await recordDownload({
      timestamp: new Date().toISOString(),
      exportType: exportTypeValue,
      contact,
      palette: {
        name: palette.name,
        seedBack: palette.seedBack
      },
      meta: {
        source: 'send-export-route'
      }
    })

    // Create email transporter (you'll need to configure this with your email service)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    })

    // Generate HTML email content
    const htmlContent = generateEmailHTML(contact, palette, content, exportType)

    // Send email
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@brandinggenerator.com',
      to: 'robert@sandhillsgeeks.com', // Your specified email
      subject: `Brand Export Request - ${contact.businessName} - ${exportType.toUpperCase()}`,
      html: htmlContent,
      // Also send a copy to the user
      bcc: contact.email
    }

    await transporter.sendMail(mailOptions)

    res.json({ success: true, message: 'Export email sent successfully' })

  } catch (error) {
    console.error('Email sending error:', error)
    res.status(500).json({
      error: 'Failed to send email',
      message: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    })
  }
})

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
        h3 { font-size: 16px; margin: 0 0 12px; color: #e8e8ec; }
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

export { router as emailRoutes }
