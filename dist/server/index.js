import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { paletteRoutes } from './routes/palettes.js';
import { exportRoutes } from './routes/export.js';
import { emailRoutes } from './routes/email.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3001;
// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
// Health check (before other routes)
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// API Routes
app.use('/api', paletteRoutes);
app.use('/api', exportRoutes);
app.use('/api', emailRoutes);
// Serve static files from client build
const clientBuildPath = path.join(__dirname, '../client');
app.use(express.static(clientBuildPath));
// Serve index.html for client-side routing (fallback for SPA)
app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/health') || req.path.includes('.')) {
        return next();
    }
    res.sendFile(path.join(clientBuildPath, 'index.html'));
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});
// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
//# sourceMappingURL=index.js.map