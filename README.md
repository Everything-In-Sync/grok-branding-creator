# 🎨 Branding Package Generator

A professional web application that generates WCAG 2.2 compliant brand color palettes, typography suggestions, and exportable design assets based on industry input.

![Branding Generator](https://img.shields.io/badge/React-19.1.1-blue) ![Node.js](https://img.shields.io/badge/Node.js-22.19.0-green) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue)

## ✨ Features

### 🎨 **Color Palette Generation**
- **Industry-based palettes**: Healthcare, Technology, Finance, Beauty, Restaurant, etc.
- **WCAG 2.2 AA/AAA compliance**: All colors meet accessibility standards
- **Harmony rules**: Analogous, complementary, triadic color schemes
- **Theme variants**: Light, dark, and neutral background options
- **Deterministic seeding**: Same inputs produce identical results

### 🔤 **Typography Suggestions**
- **Google Fonts integration**: Professional font pairings
- **Brand tone matching**: Conservative, modern, playful, premium fonts
- **Fallback stacks**: System font fallbacks for reliability

### 📦 **Export Options**
- **CSS Custom Properties**: Ready-to-use CSS variables
- **SCSS Variables**: Sass-ready color variables
- **Tailwind Config**: Tailwind CSS theme extension
- **ZIP Package**: Complete brand kit with swatches, fonts, and documentation
- **Multiple formats**: SVG swatches, GPL palette files, README

### 📧 **Lead Capture System**
- **Contact form**: Name, business name, email collection
- **Email notifications**: Automatic emails to `robert@sandhillsgeeks.com`
- **Lead qualification**: Business information and export preferences

## 🚀 **Quick Start**

### Prerequisites
- Node.js 20+ and npm
- SMTP email account (optional, for lead notifications)

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd grokBrandCreator

# Install dependencies
npm install

# Configure email (optional)
cp EMAIL_SETUP.md .env
# Edit .env with your SMTP credentials
```

### Development
```bash
# Start development server
npm run dev
# Server: http://localhost:3001
# Client: http://localhost:5173
```

### Production
```bash
# Build and start
npm run build
npm start
# App: http://localhost:3001
```

## 🏗️ **Architecture**

### **Frontend (React + TypeScript)**
- **InputForm**: Industry selection, brand preferences, export buttons
- **PalettePreview**: Color swatches, typography display, theme switching
- **ContactFormModal**: Lead capture with validation
- **Responsive design**: Mobile-first approach

### **Backend (Node.js + Express)**
- **Palette Engine**: Color generation algorithms
- **Export System**: ZIP creation, multiple format support
- **Email Service**: SMTP integration for lead notifications
- **REST API**: JSON endpoints for all functionality

### **Color Generation Pipeline**
1. **Industry Analysis**: Map industry to base hues and saturation ranges
2. **Tone Application**: Adjust saturation/lightness based on brand personality
3. **Harmony Rules**: Apply color theory for balanced palettes
4. **Accessibility Pass**: Ensure WCAG compliance through contrast adjustments
5. **Typography Matching**: Select fonts that complement the color scheme

## 🎯 **Usage**

1. **Select Industry**: Choose from healthcare, technology, finance, etc.
2. **Choose Brand Tone**: Conservative, modern, playful, premium, etc.
3. **Set Theme**: Light, dark, or neutral background preference
4. **Generate Palette**: Click "Generate Brand Package"
5. **Export Assets**:
   - Fill out contact form
   - Choose export type (CSS/SCSS/Tailwind/ZIP)
   - Receive email confirmation with complete assets

## 📧 **Email Configuration**

See `EMAIL_SETUP.md` for SMTP configuration instructions. The app sends professional HTML emails with:

- Contact information
- Color palette details with visual swatches
- Typography specifications
- Complete code exports
- Brand element suggestions

## 🧪 **Testing**

```bash
# Run backend tests
npm run test:server

# Run frontend tests (when implemented)
npm run test:client
```

### **Test Coverage**
- ✅ Color utility functions (contrast, luminance, hex conversion)
- ✅ Palette generation determinism
- ✅ Industry hue mapping
- ✅ Accessibility compliance
- ✅ API endpoints

## 📁 **Project Structure**

```
grokBrandCreator/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── assets/         # Images, favicon
│   │   └── *.css           # Stylesheets
├── server/                 # Express backend
│   ├── routes/            # API endpoints
│   └── index.ts           # Server setup
├── engine/                # Color generation logic
├── shared/                # TypeScript types
├── dist/                  # Built application
├── EMAIL_SETUP.md         # Email configuration
└── package.json
```

## 🔧 **API Endpoints**

### **Core Functionality**
- `POST /api/generate` - Generate color palettes
- `GET /api/industries` - Get available industries
- `GET /api/tones` - Get available brand tones

### **Export System**
- `POST /api/export/zip` - Download ZIP package
- `POST /api/send-export` - Send export email

### **Utilities**
- `GET /health` - Health check endpoint

## 🎨 **Color Generation Details**

### **Industry Hue Mapping**
```typescript
healthcare: { baseHue: [195, 210], accentHue: 165 }  // Blues & greens
technology: { baseHue: [200, 220], accentHue: 260 }  // Blues & purples
finance: { baseHue: [205, 225], accentHue: 135 }     // Blues & greens
```

### **Brand Tone Modifiers**
```typescript
modern: { saturation: 0.9, lightness: 0.5, contrast: 1.1 }
premium: { saturation: 0.8, lightness: 0.35, contrast: 1.4 }
playful: { saturation: 1.1, lightness: 0.6, contrast: 1.0 }
```

## 📈 **Performance**

- **Generation**: <50ms per palette
- **ZIP Export**: <300ms for complete packages
- **Memory**: Minimal footprint for server deployment
- **Scalability**: Stateless design, horizontally scalable

## 🚀 **Deployment**

### **VPS Deployment**
```bash
# Build application
npm run build

# Configure environment variables
cp EMAIL_SETUP.md .env
# Edit .env with production values

# Start production server
npm start
```

### **Environment Variables**
```bash
PORT=3001
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@yourdomain.com
```

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure TypeScript compilation passes
5. Submit a pull request

## 📄 **License**

This project is licensed under the ISC License - see the LICENSE.txt file for details.

---

**Built with ❤️ for Sandhills Geeks branding projects**
