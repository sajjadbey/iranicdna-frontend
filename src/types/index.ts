// index.ts
export interface Sample {
    id: number;
    name: string;
    country: string | null;
    province: string | null;
    city: string | null;
    ethnicity: string | null;
    tribe: string | null;
    clan: string | null;
    y_dna: {
        name: string;
        root_haplogroup: string;
        full_path: string[];
    } | null;
    mt_dna: {
        name: string;
        root_haplogroup: string;
        full_path: string[];
    } | null;
    historical_period: {
        name: string;
        start_year: number;
        end_year: number;
        display: string;
    } | null;
    description: string;
    count: number;
    coordinates: {
        latitude: number;
        longitude: number;
    } | null;
}

export interface Country {
    name: string;
}

export interface Province {
    name: string;
    country: string;
    latitude: number;
    longitude: number;
    capital: string | null;
    geometry?: {
        type: string;
        coordinates: number[][][][];
    };
}

export interface City {
    name: string;
    province: string;
    is_capital: boolean;
    latitude: number | null;
    longitude: number | null;
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
    comment_count: number;
}

export interface BlogComment {
    id: number;
    blog_post: number;
    content: string;
    user_name: string;
    user_username: string;
    is_owner: boolean;
    created_at: string;
    updated_at: string;
    is_approved: boolean;
}

// API Response Types
export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
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
    turnstile_token?: string;
}

export interface PasswordResetConfirmData {
    email: string;
    code: string;
    new_password: string;
    new_password_confirm: string;
    turnstile_token?: string;
}