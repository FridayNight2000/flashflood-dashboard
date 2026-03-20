// --- Core data types ---
export interface HydroRecord {
  dateTime: Date;
  waterLevel: number | null;    // null = missing
  qualityFlag: string;          // "暫定値" | "" | "欠測" | "閉局" | "未登録"
  year: number;
  month: number;
  day: number;
}

export interface DetrendedRecord extends HydroRecord {
  detrended: number | null;
  baseline: number | null;
}

export interface ScannedFile {
  file: File;
  fileName: string;
  startDate: Date | null;       // parsed from filename
  endDate: Date | null;         // parsed from filename
  parseError: string | null;    // reason for filename parse failure
}

// --- Cleaning stats ---
export interface CleanStats {
  totalRows: number;
  validRows: number;
  tentativeCount: number;       // * 暫定値
  missingCount: number;         // $ 欠測
  closedCount: number;          // # 閉局
  unregisteredCount: number;    // - 未登録
  errorRows: number;            // unparseable lines (within selected range files)
  validRate: number;            // valid data ratio (0-1)
  longestGapHours: number;      // longest consecutive gap in hours
}

// TODO: FloodEvent detection will be implemented in a future iteration
// export interface FloodEvent { ... }

// --- Wizard state ---
export type WizardStep = 1 | 2 | 3 | 4;

export interface WizardState {
  currentStep: WizardStep;
  // Step 1
  stationId: string;
  uploadedFiles: File[];
  // Step 2 (locked after confirmation)
  scannedFiles: ScannedFile[];
  dateRange: { start: Date; end: Date } | null;
  selectedRange: { start: Date; end: Date } | null;
  isLocked: boolean;
  // Step 3
  cleanedData: HydroRecord[];
  cleanStats: CleanStats | null;
  // Step 4
  detrendStrategy: 'skip' | 'local' | 'full';
  eventThreshold: number;       // unit: meters
  processingProgress: number;   // 0-100
  detrendedData: DetrendedRecord[];
}
