import { GenerateInput, Palette } from '../shared/types.js';
export declare class PaletteEngine {
    private random;
    constructor(seed?: number);
    generatePalettes(input: GenerateInput): Palette[];
    private generateSinglePalette;
    private selectHarmonyType;
    private generateHarmoniousColors;
    private generateColor;
    private adjustForTheme;
    private ensureAccessibility;
    private generatePaletteName;
    private generateImageryDescription;
    private generateLogoPrompts;
}
//# sourceMappingURL=paletteEngine.d.ts.map