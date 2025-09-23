import { IndustryHueMap, BrandTone } from '../shared/types.js';
export declare const INDUSTRY_HUE_MAP: IndustryHueMap;
export declare function getBeautyHues(tone?: BrandTone): {
    baseHue: [number, number];
    accentHue?: number;
    neutralHue: number;
};
export declare function getRestaurantHues(context?: any): {
    baseHue: [number, number];
    accentHue?: number;
    neutralHue: number;
};
export declare function getNonprofitHues(tone?: BrandTone): {
    baseHue: [number, number];
    accentHue?: number;
    neutralHue: number;
};
export declare function getIndustryHues(industry: string, tone?: BrandTone, context?: any): {
    baseHue: [number, number];
    accentHue?: number;
    neutralHue: number;
};
//# sourceMappingURL=industryMap.d.ts.map