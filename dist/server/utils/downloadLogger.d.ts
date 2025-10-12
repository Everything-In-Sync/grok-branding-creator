export interface DownloadLogEntry {
    timestamp: string;
    exportType: 'css' | 'scss' | 'tailwind' | 'zip';
    contact?: {
        name: string;
        businessName: string;
        email: string;
    };
    palette?: {
        name: string;
        seedBack?: number;
    };
    meta?: Record<string, unknown>;
}
export declare function recordDownload(entry: DownloadLogEntry): Promise<void>;
//# sourceMappingURL=downloadLogger.d.ts.map