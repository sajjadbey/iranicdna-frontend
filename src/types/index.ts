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
    ethnicities: string[];
    historical_note: string;
    sample_count?: number;
}

export interface Clan {
    name: string;
    tribe: string;
    common_ancestor: string;
    sample_count?: number;
}

export interface HaplogroupNode {
    name: string;
    root_haplogroup: string | null;
    children: HaplogroupNode[];
}

export interface HaplogroupCount {
    haplogroup: string;
    total_count: number;
    direct_count: number;
    subclade_count: number;
    subclades: string[];
}

export interface HeatmapPoint {
    province: string;
    country: string;
    latitude: number;
    longitude: number;
    sample_count: number;
    haplogroup?: string;
}

export interface BlogPost {
    id: number;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    author: string;
    featured_image: string | null;
    meta_description: string;
    tags: string;
    tags_list: string[];
    created_at: string;
    updated_at: string;
    published_at: string;
    view_count: number;
}

// Email Verification Types
export interface VerifyEmailData {
    email: string;
    code: string;
}

export interface RequestVerificationData {
    email: string;
}

export interface PasswordResetRequestData {
    email: string;
}

export interface PasswordResetConfirmData {
    email: string;
    code: string;
    new_password: string;
    new_password_confirm: string;
}