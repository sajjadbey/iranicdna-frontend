// index.ts
export interface Sample {
    name: string;
    country: string | null;
    province: string | null;
    city: string | null;
    ethnicity: string | null;
    y_dna: {
        name: string;
        root_haplogroup: string;
    } | null;
    mt_dna: {
        name: string;
        root_haplogroup: string;
    } | null;
    historical_period: {
        name: string;
        start_year: number;
        end_year: number;
        display: string;
    };
    description: string;
    count: number;
}

export interface Country {
    name: string;
}

export interface Province {
    name: string;
    country: string;
}

export interface City {
    name: string;
    province: string;
}

export interface Ethnicity {
    name: string;
}

export interface Tribe {
    name: string;
    ethnicity: string | null;
    historical_note: string;
}

export interface Clan {
    name: string;
    tribe: string;
    common_ancestor: string;
}