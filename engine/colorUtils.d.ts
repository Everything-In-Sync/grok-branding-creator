import chroma from 'chroma-js';
import { Color, TextColor } from '../shared/types.js';
export declare function getRelativeLuminance(r: number, g: number, b: number): number;
export declare function getContrastRatio(lum1: number, lum2: number): number;
export declare function meetsAAContrast(ratio: number, isLargeText?: boolean): boolean;
export declare function meetsAAAContrast(ratio: number, isLargeText?: boolean): boolean;
export declare function hexToRgb(hex: string): [number, number, number];
export declare function rgbToHsl(r: number, g: number, b: number): [number, number, number];
export declare function getBestTextColor(backgroundLum: number): TextColor;
export declare function createColor(hex: string, role: string): Color;
export declare function adjustForContrast(baseColor: chroma.Color, targetLuminance: number, minContrast: number, isLighter?: boolean): chroma.Color;
export declare function simulateColorBlindness(hex: string, type: 'protanopia' | 'deuteranopia' | 'tritanopia'): string;
export declare function checkColorBlindnessDistinction(color1: string, color2: string): boolean;
//# sourceMappingURL=colorUtils.d.ts.map