/**
 * Utility functions for building API filter URLs based on the new filtering guide
 */

export interface SampleFilters {
  // Geographic filters
  country?: string;
  country_contains?: string;
  province?: string;
  province_contains?: string;
  city?: string;
  city_contains?: string;
  
  // Cultural filters
  ethnicity?: string;
  ethnicity_contains?: string;
  tribe?: string;
  tribe_contains?: string;
  clan?: string;
  clan_contains?: string;
  
  // Genetic marker filters
  y_dna?: string;
  y_dna_contains?: string;
  y_dna_startswith?: string;
  y_dna_root?: string;
  mt_dna?: string;
  mt_dna_contains?: string;
  mt_dna_startswith?: string;
  mt_dna_root?: string;
  
  // Historical period filters
  historical_period?: string;
  historical_period_contains?: string;
  start_year_gte?: number;
  start_year_lte?: number;
  end_year_gte?: number;
  end_year_lte?: number;
  
  // Sample count filters
  count?: number;
  count_gte?: number;
  count_lte?: number;
  
  // Boolean filters
  has_y_dna?: boolean;
  has_mt_dna?: boolean;
  has_historical_period?: boolean;
  has_ethnicity?: boolean;
  has_tribe?: boolean;
  has_clan?: boolean;
  
  // Search and ordering
  search?: string;
  ordering?: string;
  
  // Pagination
  page?: number;
  page_size?: number | 'all';
}

/**
 * Build URL search parameters from filter object
 */
export function buildFilterParams(filters: SampleFilters): URLSearchParams {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });
  
  return params;
}

/**
 * Build complete API URL with filters
 */
export function buildSamplesUrl(baseUrl: string, filters: SampleFilters): string {
  const params = buildFilterParams(filters);
  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Common filter presets for convenience
 */
export const FILTER_PRESETS = {
  // Get all samples with Y-DNA
  allWithYDna: (): SampleFilters => ({
    has_y_dna: true,
    page_size: 'all'
  }),
  
  // Get all samples with mtDNA
  allWithMtDna: (): SampleFilters => ({
    has_mt_dna: true,
    page_size: 'all'
  }),
  
  // Get samples by haplogroup root (includes all subclades)
  byHaplogroupRoot: (haplogroup: string): SampleFilters => ({
    y_dna_root: haplogroup,
    page_size: 'all'
  }),
  
  // Get samples by exact location
  byLocation: (country?: string, province?: string, city?: string): SampleFilters => ({
    ...(country && { country }),
    ...(province && { province }),
    ...(city && { city }),
    has_y_dna: true,
    page_size: 'all'
  }),
  
  // Get samples by ethnicity
  byEthnicity: (ethnicity: string): SampleFilters => ({
    ethnicity,
    has_y_dna: true,
    page_size: 'all'
  }),
  
  // Get modern samples (after 1900)
  modernSamples: (): SampleFilters => ({
    start_year_gte: 1900,
    has_y_dna: true,
    page_size: 'all'
  }),
  
  // Get ancient samples (before year 0)
  ancientSamples: (): SampleFilters => ({
    end_year_lte: 0,
    has_y_dna: true,
    page_size: 'all'
  }),
  
  // Get samples with high count
  highCountSamples: (minCount: number = 10): SampleFilters => ({
    count_gte: minCount,
    has_y_dna: true,
    ordering: '-count',
    page_size: 'all'
  })
};