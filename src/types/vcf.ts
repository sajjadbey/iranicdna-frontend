// VCF Analysis Types

export type AnalysisStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type AdmixModel = 'K7b' | 'K12b' | 'globe13' | 'world9' | 'E11';

export interface AdmixtureResults {
  [model: string]: {
    [population: string]: number;
  };
}

export interface VCFAnalysisResponse {
  id: string;
  vcf_file: string;
  sample_id: string;
  models_requested: string[];
  tolerance: number;
  status: AnalysisStatus;
  results: AdmixtureResults | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface VCFUploadFormProps {
  onUploadSuccess: (analysis: VCFAnalysisResponse) => void;
  onUploadError: (error: string) => void;
}

export interface AnalysisResultCardProps {
  analysis: VCFAnalysisResponse;
}

export interface AdmixtureChartProps {
  results: AdmixtureResults;
  model: string;
}