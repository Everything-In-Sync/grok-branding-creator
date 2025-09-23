import chroma from 'chroma-js';
// Calculate relative luminance using sRGB gamma correction
export function getRelativeLuminance(r, g, b) {
    const toLinear = (c) => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}
// Calculate contrast ratio between two colors
export function getContrastRatio(lum1, lum2) {
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    return (lighter + 0.05) / (darker + 0.05);
}
// Check if contrast meets WCAG AA requirements
export function meetsAAContrast(ratio, isLargeText = false) {
    return isLargeText ? ratio >= 3.0 : ratio >= 4.5;
}
// Check if contrast meets WCAG AAA requirements
export function meetsAAAContrast(ratio, isLargeText = false) {
    return isLargeText ? ratio >= 4.5 : ratio >= 7.0;
}
// Convert hex to RGB array
export function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result)
        throw new Error(`Invalid hex color: ${hex}`);
    return [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ];
}
// Convert RGB to HSL array
export function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}
// Determine best text color (light or dark) for background
export function getBestTextColor(backgroundLum) {
    return backgroundLum > 0.5 ? 'dark' : 'light';
}
// Create a Color object from hex
export function createColor(hex, role) {
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(...rgb);
    const luminance = getRelativeLuminance(...rgb);
    const textOn = getBestTextColor(luminance);
    const contrastOnText = textOn === 'light' ? getContrastRatio(luminance, 1.0) : getContrastRatio(luminance, 0.0);
    return {
        role,
        hex,
        rgb,
        hsl,
        luminance,
        textOn,
        contrastOnText
    };
}
// Adjust color lightness to meet contrast requirements
export function adjustForContrast(baseColor, targetLuminance, minContrast, isLighter = true) {
    let adjusted = baseColor;
    let iterations = 0;
    const maxIterations = 20;
    while (iterations < maxIterations) {
        const currentLum = adjusted.luminance();
        const contrast = getContrastRatio(currentLum, targetLuminance);
        if (contrast >= minContrast) {
            break;
        }
        // Adjust lightness
        const currentLightness = adjusted.get('hsl.l');
        const adjustment = isLighter ? 5 : -5;
        adjusted = adjusted.set('hsl.l', Math.max(0, Math.min(100, currentLightness + adjustment)));
        iterations++;
    }
    return adjusted;
}
// Simulate color blindness transformations
export function simulateColorBlindness(hex, type) {
    const rgb = hexToRgb(hex);
    let r = rgb[0] / 255;
    let g = rgb[1] / 255;
    let b = rgb[2] / 255;
    switch (type) {
        case 'protanopia':
            r = 0.567 * r + 0.433 * g + 0 * b;
            g = 0.558 * r + 0.442 * g + 0 * b;
            b = 0 * r + 0.242 * g + 0.758 * b;
            break;
        case 'deuteranopia':
            r = 0.625 * r + 0.375 * g + 0 * b;
            g = 0.7 * r + 0.3 * g + 0 * b;
            b = 0 * r + 0.3 * g + 0.7 * b;
            break;
        case 'tritanopia':
            r = 0.95 * r + 0.05 * g + 0 * b;
            g = 0 * r + 0.433 * g + 0.567 * b;
            b = 0 * r + 0.475 * g + 0.525 * b;
            break;
    }
    return chroma.rgb(r * 255, g * 255, b * 255).hex();
}
// Check if colors remain distinguishable under color blindness
export function checkColorBlindnessDistinction(color1, color2) {
    const types = ['protanopia', 'deuteranopia', 'tritanopia'];
    for (const type of types) {
        const sim1 = simulateColorBlindness(color1, type);
        const sim2 = simulateColorBlindness(color2, type);
        const deltaE = chroma.deltaE(sim1, sim2);
        if (deltaE < 15) { // Minimum perceptible difference
            return false;
        }
    }
    return true;
}
//# sourceMappingURL=colorUtils.js.map