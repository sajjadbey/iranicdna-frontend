export interface Sample {
  name: string;
  country: string | null;
  province: string | null;
  city: string | null;
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