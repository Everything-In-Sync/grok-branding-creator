import express from 'express';
import nodemailer from 'nodemailer';
const router = express.Router();
// POST /api/send-export - Send export email
router.post('/send-export', async (req, res) => {
    try {
        const { contact, palette, content, exportType } = req.body;
        // Validate required fields
        if (!contact.name || !contact.businessName || !contact.email || !content) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        // Create email transporter (you'll need to configure this with your email service)
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
        // Generate HTML email content
        const htmlContent = generateEmailHTML(contact, palette, content, exportType);
        // Send email
        const mailOptions = {
            from: process.env.FROM_EMAIL || 'noreply@brandinggenerator.com',
            to: 'robert@sandhillsgeeks.com', // Your specified email
            subject: `Brand Export Request - ${contact.businessName} - ${exportType.toUpperCase()}`,
            html: htmlContent,
            // Also send a copy to the user
            bcc: contact.email
        };
        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: 'Export email sent successfully' });
    }
    catch (error) {
        console.error('Email sending error:', error);
        res.status(500).json({
            error: 'Failed to send email',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});
function generateEmailHTML(contact, palette, content, exportType) {
    const exportTypeLabel = exportType.toUpperCase();
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Brand Export Request</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .contact-info { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
        .palette-info { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
        .color-swatches { display: flex; gap: 10px; flex-wrap: wrap; }
        .color-swatch { width: 40px; height: 40px; border-radius: 4px; border: 2px solid #ddd; }
        .code-block { background: #2d3748; color: #e2e8f0; padding: 15px; border-radius: 6px; font-family: 'Courier New', monospace; font-size: 14px; overflow-x: auto; margin: 15px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎨 Brand Export Request</h1>
          <p>New ${exportTypeLabel} export request received</p>
        </div>

        <div class="content">
          <h2>Contact Information</h2>
          <div class="contact-info">
            <p><strong>Name:</strong> ${contact.name}</p>
            <p><strong>Business:</strong> ${contact.businessName}</p>
            <p><strong>Email:</strong> ${contact.email}</p>
          </div>

          <h2>Selected Palette: ${palette.name}</h2>
          <div class="palette-info">
            <h3>Colors</h3>
            <div class="color-swatches">
              <div>
                <div class="color-swatch" style="background-color: ${palette.roles.primary.hex}"></div>
                <small>Primary<br>${palette.roles.primary.hex}</small>
              </div>
              <div>
                <div class="color-swatch" style="background-color: ${palette.roles.secondary.hex}"></div>
                <small>Secondary<br>${palette.roles.secondary.hex}</small>
              </div>
              <div>
                <div class="color-swatch" style="background-color: ${palette.roles.accent.hex}"></div>
                <small>Accent<br>${palette.roles.accent.hex}</small>
              </div>
              <div>
                <div class="color-swatch" style="background-color: ${palette.roles.neutral.hex}"></div>
                <small>Neutral<br>${palette.roles.neutral.hex}</small>
              </div>
              <div>
                <div class="color-swatch" style="background-color: ${palette.roles.background.hex}"></div>
                <small>Background<br>${palette.roles.background.hex}</small>
              </div>
            </div>

            <h3>Typography</h3>
            <p><strong>Headline:</strong> ${palette.typography.headline}</p>
            <p><strong>Body:</strong> ${palette.typography.body}</p>

            <h3>Brand Elements</h3>
            <p><strong>Icon Style:</strong> ${palette.iconStyle}</p>
            <p><strong>Imagery:</strong> ${palette.imagery.join(', ')}</p>
          </div>

          <h2>${exportTypeLabel} Code</h2>
          <div class="code-block">
            <pre>${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
          </div>

          <div class="footer">
            <p>This email was generated by the Branding Package Generator</p>
            <p>Contact the user at: ${contact.email}</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}
export { router as emailRoutes };
//# sourceMappingURL=email.js.map