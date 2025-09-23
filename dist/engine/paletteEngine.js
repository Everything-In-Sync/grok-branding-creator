import chroma from 'chroma-js';
import { SeededRandom } from './random.js';
import { getIndustryHues } from './industryMap.js';
import { TONE_MODIFIERS, TYPOGRAPHY_SUGGESTIONS } from './toneModifiers.js';
import { createColor, getContrastRatio, meetsAAContrast, checkColorBlindnessDistinction } from './colorUtils.js';
const ICON_STYLES = [
    'outline',
    'rounded',
    'sharp',
    'geometric',
    'handcrafted'
];
const IMAGERY_ADJECTIVES = [
    'warm', 'cool', 'vibrant', 'muted', 'natural', 'minimal',
    'organic', 'geometric', 'textured', 'clean', 'bold', 'soft'
];
const IMAGERY_SUBJECTS = [
    'wood grain micro texture', 'soft fabric folds', 'geometric patterns',
    'natural light shadows', 'handcrafted details', 'minimalist forms'
];
export class PaletteEngine {
    constructor(seed = 0) {
        this.random = new SeededRandom(seed);
    }
    generatePalettes(input) {
        const palettes = [];
        // Reset random state for deterministic results
        this.random = new SeededRandom(input.seed || 0);
        for (let i = 0; i < 3; i++) {
            const palette = this.generateSinglePalette(input, i);
            palettes.push(palette);
        }
        return palettes;
    }
    generateSinglePalette(input, index, context) {
        const industryHues = getIndustryHues(input.industry, input.brandTone, input.useContext ? input.context : undefined);
        const toneModifier = TONE_MODIFIERS[input.brandTone || 'trustworthy'];
        // Generate base colors
        const baseHue = this.random.nextInt(industryHues.baseHue[0], industryHues.baseHue[1]);
        const accentHue = industryHues.accentHue || (baseHue + 180) % 360;
        const neutralHue = industryHues.neutralHue;
        // Apply harmony rules
        const harmonyType = this.selectHarmonyType(input.brandTone);
        const colors = this.generateHarmoniousColors(baseHue, accentHue, neutralHue, toneModifier, harmonyType);
        // Apply theme preference
        this.adjustForTheme(colors, input.themePreference || 'neutral');
        // Ensure accessibility
        this.ensureAccessibility(colors);
        // Create palette object
        const paletteName = this.generatePaletteName(input.industry, input.brandTone, index);
        const typography = TYPOGRAPHY_SUGGESTIONS[input.brandTone || 'trustworthy'];
        const iconStyle = this.random.pick(ICON_STYLES);
        const imagery = this.generateImageryDescription();
        const logoPrompts = this.generateLogoPrompts(input.industry, input.brandTone);
        return {
            name: paletteName,
            roles: {
                primary: colors.primary,
                secondary: colors.secondary,
                accent: colors.accent,
                neutral: colors.neutral,
                background: colors.background
            },
            swatches: [colors.primary, colors.secondary, colors.accent, colors.neutral, colors.background],
            typography,
            iconStyle,
            imagery,
            logoPrompts,
            seedBack: input.seed || 0
        };
    }
    selectHarmonyType(tone) {
        const harmonyOptions = ['analogous', 'complementary', 'triadic', 'split-complementary'];
        // Bias harmony selection based on tone
        switch (tone) {
            case 'playful':
            case 'energetic':
                return this.random.pick(['triadic', 'split-complementary']);
            case 'conservative':
            case 'premium':
                return this.random.pick(['analogous', 'complementary']);
            case 'minimal':
            case 'techie':
                return 'analogous';
            default:
                return this.random.pick(harmonyOptions);
        }
    }
    generateHarmoniousColors(baseHue, accentHue, neutralHue, modifier, harmonyType) {
        let primaryHue = baseHue;
        let secondaryHue = baseHue;
        let accentHueFinal = accentHue;
        switch (harmonyType) {
            case 'analogous':
                secondaryHue = (baseHue + this.random.nextInt(-30, 30)) % 360;
                accentHueFinal = (baseHue + this.random.nextInt(30, 60)) % 360;
                break;
            case 'complementary':
                secondaryHue = (baseHue + 180) % 360;
                break;
            case 'triadic':
                secondaryHue = (baseHue + 120) % 360;
                accentHueFinal = (baseHue + 240) % 360;
                break;
            case 'split-complementary':
                secondaryHue = (baseHue + 150 + this.random.nextInt(-30, 30)) % 360;
                accentHueFinal = (baseHue + 210 + this.random.nextInt(-30, 30)) % 360;
                break;
        }
        // Generate colors with appropriate saturation and lightness
        const primary = this.generateColor(primaryHue, modifier.saturation, modifier.lightness, 'primary');
        const secondary = this.generateColor(secondaryHue, modifier.saturation * 0.9, modifier.lightness * 1.1, 'secondary');
        const accent = this.generateColor(accentHueFinal, modifier.saturation * 1.2, modifier.lightness * 0.9, 'accent');
        const neutral = this.generateColor(neutralHue, 0.3, 0.6, 'neutral');
        const background = this.generateColor(neutralHue, 0.2, 0.9, 'background');
        return { primary, secondary, accent, neutral, background };
    }
    generateColor(hue, saturation, lightness, role) {
        // Clamp values to valid ranges
        saturation = Math.max(0, Math.min(1, saturation));
        lightness = Math.max(0, Math.min(1, lightness));
        const chromaColor = chroma.hsl(hue, saturation, lightness);
        const hex = chromaColor.hex();
        return createColor(hex, role);
    }
    adjustForTheme(colors, theme) {
        if (theme === 'neutral') {
            // For neutral theme, keep the background as generated but ensure minimum contrast
            const bgLuminance = colors.background.luminance;
            for (const role of ['primary', 'secondary', 'accent', 'neutral']) {
                const color = colors[role];
                const contrast = getContrastRatio(color.luminance, bgLuminance);
                if (!meetsAAContrast(contrast)) {
                    // Make small adjustments rather than extreme ones
                    const currentLightness = color.hsl[2] / 100;
                    const adjustment = bgLuminance > 0.5 ? -0.1 : 0.1;
                    const newLightness = Math.max(0.2, Math.min(0.8, currentLightness + adjustment));
                    colors[role] = this.generateColor(color.hsl[0], color.hsl[1] / 100, newLightness, role);
                }
            }
        }
        else {
            // For light/dark themes, adjust background and ensure contrast
            const backgroundLightness = theme === 'light' ? 0.95 : 0.1;
            // Adjust background
            const bgHue = colors.background.hsl[0];
            const bgSat = colors.background.hsl[1] / 100;
            colors.background = this.generateColor(bgHue, bgSat * 0.2, backgroundLightness, 'background');
            // For light/dark themes, we expect the ensureAccessibility function to handle contrast
            // Don't do aggressive adjustments here
        }
    }
    ensureAccessibility(colors) {
        const bgLuminance = colors.background.luminance;
        // Ensure all role colors have adequate contrast with background
        for (const role of ['primary', 'secondary', 'accent', 'neutral']) {
            const color = colors[role];
            const contrast = getContrastRatio(color.luminance, bgLuminance);
            if (!meetsAAContrast(contrast)) {
                // Make a single small adjustment rather than iterative changes
                const currentLightness = color.hsl[2] / 100;
                const adjustment = bgLuminance > 0.5 ? -0.15 : 0.15;
                const newLightness = Math.max(0.15, Math.min(0.85, currentLightness + adjustment));
                colors[role] = this.generateColor(color.hsl[0], color.hsl[1] / 100, newLightness, role);
            }
        }
        // Check color blindness distinction
        if (!checkColorBlindnessDistinction(colors.primary.hex, colors.accent.hex)) {
            // Adjust accent to be more distinguishable
            const newAccentHue = (colors.accent.hsl[0] + 60) % 360;
            colors.accent = this.generateColor(newAccentHue, colors.accent.hsl[1] / 100, colors.accent.hsl[2] / 100, 'accent');
        }
    }
    generatePaletteName(industry, tone, index) {
        const industryWords = industry.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1));
        const toneWords = tone ? [tone.charAt(0).toUpperCase() + tone.slice(1)] : [];
        const adjectives = ['Modern', 'Classic', 'Bold', 'Clean', 'Warm', 'Cool', 'Vibrant', 'Subtle'];
        const selectedAdj = this.random.pick(adjectives);
        return `${selectedAdj} ${industryWords.join(' ')}`;
    }
    generateImageryDescription() {
        const adj1 = this.random.pick(IMAGERY_ADJECTIVES);
        const adj2 = this.random.pick(IMAGERY_ADJECTIVES.filter(a => a !== adj1));
        const subject = this.random.pick(IMAGERY_SUBJECTS);
        return [`${adj1} ${adj2} ${subject}`];
    }
    generateLogoPrompts(industry, tone) {
        const prompts = [
            `Monogram combining ${industry} initials with geometric elements`,
            `Abstract symbol representing ${industry} values and ${tone || 'modern'} aesthetic`,
            `Lettermark with custom typography and subtle icon integration`,
            `Symbolic mark using ${industry}-related metaphors`,
            `Minimalist icon with ${tone || 'clean'} lines and forms`
        ];
        return this.random.shuffle(prompts).slice(0, 3);
    }
}
//# sourceMappingURL=paletteEngine.js.map