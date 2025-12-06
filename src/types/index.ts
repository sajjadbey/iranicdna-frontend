export interface Sample {
  province: string;
  y_dna: { root_haplogroup: string; name: string } | null;
  mt_dna: { root_haplogroup: string; name: string } | null;
  count: number;
}