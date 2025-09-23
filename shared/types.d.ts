export type BrandTone = 'conservative' | 'modern' | 'playful' | 'premium' | 'eco' | 'trustworthy' | 'energetic' | 'minimal' | 'artisan' | 'techie' | 'healthcare' | 'finance' | 'hospitality' | 'education' | 'construction' | 'legal' | 'nonprofit' | 'restaurant' | 'retail' | 'beauty' | 'fitness' | 'automotive' | 'real_estate';
export type ThemePreference = 'light' | 'dark' | 'neutral';
export type TextColor = 'light' | 'dark';
export interface Color {
    role: string;
    hex: string;
    rgb: [number, number, number];
    hsl: [number, number, number];
    luminance: number;
    textOn: TextColor;
    contrastOnText: number;
}
export interface Typography {
    headline: string;
    headlineWeights: number[];
    body: string;
    bodyWeights: number[];
    links: string[];
}
export interface Palette {
    name: string;
    roles: {
        primary: Color;
        secondary: Color;
        accent: Color;
        neutral: Color;
        background: Color;
    };
    swatches: Color[];
    typography: Typography;
    iconStyle: string;
    imagery: string[];
    logoPrompts: string[];
    seedBack: number;
}
export interface ContextData {
    businessName?: string;
    tagline?: string;
    values?: string;
    audience?: string;
    competitors?: string;
    notes?: string;
}
export interface GenerateInput {
    industry: string;
    brandTone?: BrandTone;
    themePreference?: ThemePreference;
    seed?: number;
    useContext?: boolean;
    context?: ContextData;
}
export interface GenerateResponse {
    input: GenerateInput;
    palettes: Palette[];
}
export interface IndustryHueMap {
    [industry: string]: {
        baseHue: [number, number];
        accentHue?: number;
        neutralHue: number;
    };
}
export interface ToneModifier {
    saturation: number;
    lightness: number;
    contrast: number;
}
//# sourceMappingURL=types.d.ts.map