export type Indicator = {
  id: string;
  name: string;
  status: "PASS" | "FAIL" | "INFO";
  riskImpact: number;
  plainEnglish: string;
  technical: string;
  whyItMatters: string;
};

export type HiddenSection = {
  type: string;
  title: string;
  payloadType: string;
  sizeBytes: number;
  textPreview: string;
  hexDump: string;
  eofOffset: string;
};

export type ReportData = {
  success: boolean;
  scanId: string;
  date: string;
  riskScore: number;
  classification: "SAFE" | "SUSPICIOUS" | "UNSAFE";
  classificationReason: string;
  indicators: Indicator[];
  hiddenDataSections: HiddenSection[];
  exifDetails: Record<string, string>;
  technicalData: {
    fileHash: string;
    pixelEntropy: string;
    softwareTag: string;
    dimensions: string;
    mimeType: string;
    magicBytes: string;
    size: number;
    filename: string;
  };
};
