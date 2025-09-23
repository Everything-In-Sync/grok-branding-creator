# Email Configuration Setup

To enable email functionality for export requests, configure the following environment variables:

## Required Environment Variables

```bash
# SMTP Server Settings
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# From Email Address
FROM_EMAIL=noreply@brandinggenerator.com
```

## Gmail Setup Instructions

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Use this password as `SMTP_PASS`

3. **Create a `.env` file** in the project root with the variables above

## Testing Email Functionality

Once configured, export requests will send emails to `robert@sandhillsgeeks.com` with:
- Contact information (name, business, email)
- Selected color palette details
- Generated CSS/SCSS/Tailwind code
- Typography information

## Alternative Email Providers

You can use other SMTP providers:
- **SendGrid**: `smtp.sendgrid.net:587`
- **Mailgun**: `smtp.mailgun.org:587`
- **AWS SES**: Configure accordingly

The application will work without email configuration, but export requests won't send notifications.
