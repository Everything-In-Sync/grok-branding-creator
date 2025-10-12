import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOG_DIR = path.join(__dirname, '../data');
const LOG_FILE = path.join(LOG_DIR, 'download-log.jsonl');
export async function recordDownload(entry) {
    try {
        await fs.mkdir(LOG_DIR, { recursive: true });
        const line = JSON.stringify(entry);
        await fs.appendFile(LOG_FILE, line + '\n', 'utf8');
    }
    catch (error) {
        console.error('Failed to record download event:', error);
    }
}
//# sourceMappingURL=downloadLogger.js.map