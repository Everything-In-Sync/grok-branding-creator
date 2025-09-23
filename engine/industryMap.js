export const INDUSTRY_HUE_MAP = {
    healthcare: {
        baseHue: [195, 210],
        accentHue: 165,
        neutralHue: 200 // cool gray
    },
    construction: {
        baseHue: [25, 40],
        accentHue: 200,
        neutralHue: 30 // warm gray
    },
    legal: {
        baseHue: [210, 230],
        accentHue: 350,
        neutralHue: 210 // slate
    },
    finance: {
        baseHue: [205, 225],
        accentHue: 135,
        neutralHue: 200 // cool gray
    },
    beauty: {
        baseHue: [320, 340], // default to jewel tones, can be overridden by tone
        accentHue: 260,
        neutralHue: 0 // soft gray
    },
    restaurant: {
        baseHue: [10, 20], // fallback, can be more specific
        accentHue: 120,
        neutralHue: 40 // natural gray
    },
    technology: {
        baseHue: [200, 220],
        accentHue: 260,
        neutralHue: 210 // slate
    },
    education: {
        baseHue: [200, 210],
        accentHue: 40,
        neutralHue: 0 // neutral gray
    },
    real_estate: {
        baseHue: [200, 210],
        accentHue: 25,
        neutralHue: 30 // stone
    },
    nonprofit: {
        baseHue: [280, 300], // default to purple/blue, can be overridden
        accentHue: 160,
        neutralHue: 0 // friendly gray
    },
    hospitality: {
        baseHue: [25, 45],
        accentHue: 45,
        neutralHue: 30
    },
    retail: {
        baseHue: [0, 30],
        accentHue: 200,
        neutralHue: 0
    },
    fitness: {
        baseHue: [120, 140],
        accentHue: 45,
        neutralHue: 0
    },
    automotive: {
        baseHue: [0, 15],
        accentHue: 200,
        neutralHue: 210
    }
};
// Special handling for beauty based on tone
export function getBeautyHues(tone) {
    if (tone === 'playful' || tone === 'minimal') {
        return {
            baseHue: [260, 280], // soft pastels
            accentHue: 320,
            neutralHue: 0
        };
    }
    return INDUSTRY_HUE_MAP.beauty;
}
// Special handling for restaurant based on context (if available)
export function getRestaurantHues(context) {
    // Could analyze context for cuisine type, but for now use fallback
    return INDUSTRY_HUE_MAP.restaurant;
}
// Special handling for nonprofit based on tone
export function getNonprofitHues(tone) {
    if (tone === 'eco' || tone === 'trustworthy') {
        return {
            baseHue: [160, 180], // green tones
            accentHue: 120,
            neutralHue: 0
        };
    }
    return INDUSTRY_HUE_MAP.nonprofit;
}
export function getIndustryHues(industry, tone, context) {
    const normalizedIndustry = industry.toLowerCase();
    switch (normalizedIndustry) {
        case 'beauty':
            return getBeautyHues(tone);
        case 'restaurant':
            return getRestaurantHues(context);
        case 'nonprofit':
            return getNonprofitHues(tone);
        default:
            return INDUSTRY_HUE_MAP[normalizedIndustry] || INDUSTRY_HUE_MAP.technology; // fallback
    }
}
//# sourceMappingURL=industryMap.js.map