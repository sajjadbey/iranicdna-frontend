import { useState, useEffect } from 'react';
import { type Sample } from '../types';
import { API_ENDPOINTS } from '../config/api';
import { cachedFetchNormalized } from '../utils/apiCache';
import { buildSamplesUrl, type SampleFilters } from '../utils/apiFilters';

interface UseSampleFiltersReturn {
  samples: Sample[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  refetch: () => void;
}

/**
 * Custom hook for fetching samples with filters
 * Handles loading states, caching, and error handling
 */
export function useSampleFilters(
  filters: SampleFilters,
  cacheTTL: number = 2 * 60 * 1000
): UseSampleFiltersReturn {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const url = buildSamplesUrl(API_ENDPOINTS.samples, filters);
        const data = await cachedFetchNormalized<Sample>(url, {
          cacheOptions: { ttl: cacheTTL }
        });

        if (mounted) {
          setSamples(data.results);
          setTotalCount(data.count);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load data');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [filters, cacheTTL, refetchTrigger]);

  const refetch = () => setRefetchTrigger(prev => prev + 1);

  return {
    samples,
    loading,
    error,
    totalCount,
    refetch
  };
}