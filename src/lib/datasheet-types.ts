export interface DatasheetHit {
  id: string;
  mpn: string;
  manufacturer: string;
  category: string;
  page: number;
  score: number;
  text: string;
  thumbnail_url?: string;
}

export interface DatasheetSpecs {
  mpn: string;
  voltage?: { min: number; max: number; unit: "V" };
  current?: { max: number; unit: "A" | "mA" };
  package?: string;
  pinout?: string;
  raw_text: string;
  extracted_at: string;
}

export interface DatasheetPage {
  mpn: string;
  page: number;
  text: string;
  image_url?: string;
}

export interface ComparisonResult {
  table: string;
  mpns: string[];
  criteria: string[];
}

export interface IngestResult {
  queued: boolean;
  mpn: string;
}
