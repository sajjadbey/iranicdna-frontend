// Types for qpAdm functionality

export interface QpAdmRun {
  id: string;
  username: string;
  target_population: string;
  source_populations: string[];
  right_populations: string[];
  dataset_type: '1240k' | 'HO';
  additional_params?: Record<string, any>;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  queue_position: number | null;
  queue_info: QueueInfo | null;
  results: QpAdmResults | null;
  error_message: string | null;
  execution_time_seconds: number | null;
  runs_remaining_today: number;
}

export interface QueueInfo {
  position_in_queue: number;
  tasks_ahead: number;
  is_processing: boolean;
  estimated_wait_minutes: number;
}

export interface QpAdmResults {
  raw_output: string;
  p_value: number | null;
  target: string;
  sources: string[];
  coefficients: number[];
  std_errors: number[];
  passed: boolean;
  ancestry_breakdown?: {
    source: string;
    percentage: number;
    std_error: number | null;
  }[];
  target_population: string;
  source_populations: string[];
  right_populations: string[];
  execution_time_seconds: number;
}

export interface QpAdmStatus {
  runs_used_today: number;
  runs_remaining_today: number;
  daily_limit: number;
  can_run: boolean;
  next_reset: string;
}

export interface QpAdmPopulations {
  populations: string[];
  categories: Record<string, string[]>;
  common_right_sets: Record<string, string[]>;
  common_source_sets: Record<string, string[]>;
}

export interface QpAdmRunRequest {
  target_population: string;
  source_populations: string[];
  right_populations: string[];
  dataset_type?: '1240k' | 'HO';
  additional_params?: Record<string, any>;
}