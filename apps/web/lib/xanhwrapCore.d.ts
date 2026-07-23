export interface XanhWrapLeg {
    from: string;
    to: string;
    depart_time: string;
    mode: 'motorbike' | 'car' | 'ride_hailing' | 'bus' | 'metro' | 'bicycle' | 'walk';
    distance_km: number;
    duration_min: number;
    transit_line?: string;
}
export interface XanhWrapPreset {
    id: string;
    label: string;
    from: string;
    to: string;
    distance_km: number;
    duration_min: number;
    transit_line: string;
}
export interface XanhWrapLabelDef {
    code: string;
    name: string;
    group: 'green' | 'standard';
    description: string;
}
export declare const XANHWRAP_PRESETS: XanhWrapPreset[];
export declare const ALL_LABELS: XanhWrapLabelDef[];
export declare const MODE_COEF_CO2: Record<string, number>;
export declare function isRushHour(timeStr: string): boolean;
export declare function assignXanhWrapLabel(legs: XanhWrapLeg[]): XanhWrapLabelDef;
export declare function calculateXanhWrapStats(legs: XanhWrapLeg[]): {
    totalKm: number;
    totalMin: number;
    handsFreeMin: number;
    transitMin: number;
    co2SavedGrams: number;
    metricValue: number;
    daysPerYear: number;
    episodesPerYear: number;
};
