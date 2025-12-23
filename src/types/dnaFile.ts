export interface DNAFile {
  id: string;
  original_filename: string;
  file_size: number;
  detected_format: 'vcf' | '23andme' | 'myheritage' | 'plink' | 'unknown';
  format_display: string;
  format_confidence: number;
  format_details: {
    version?: string;
    source?: string;
    sample_count?: number;
    estimated_snps?: number;
    has_header?: boolean;
    binary?: boolean;
  };
  sample_name: string;
  description: string;
  uploaded_at: string;
  last_used_at: string | null;
  is_valid: boolean;
  validation_errors: string[];
  file_url: string | null;
}

export interface DNAFileUploadData {
  file: File;
  sample_name?: string;
  description?: string;
}

export interface DNAFileUpdateData {
  sample_name?: string;
  description?: string;
}