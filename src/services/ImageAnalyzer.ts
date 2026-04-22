import { Indicator, HiddenSection } from "@/types";
import { MimeAnalyzer } from "./modules/MimeAnalyzer";
import { AppendedDataAnalyzer } from "./modules/AppendedDataAnalyzer";
import { ExifAnalyzer } from "./modules/ExifAnalyzer";
import { EntropyAnalyzer } from "./modules/EntropyAnalyzer";
import { LsbAnalyzer } from "./modules/LsbAnalyzer";

/**
 * ImageAnalyzer acts as the central orchestration class for all forensic analysis modules.
 * It manages the shared state (indicators, risk scores, buffers) and coordinates the execution
 * of the independent security modules.
 */
export class ImageAnalyzer {
  // Shared State
  public riskScore = 0;
  public indicators: Indicator[] = [];
  public hiddenDataSections: HiddenSection[] = [];
  public exifDetails: Record<string, string> = {};
  
  public extFromHeader = "unknown";
  public mimeFromHeader = "unknown";
  public magicBytesHex = "";
  
  public dimensions = "Unknown";
  public pixelEntropy = "N/A";
  public fullHexDump = "";
  
  public buffer: Buffer;
  public fileName: string;
  public fileExt: string;

  constructor(buffer: Buffer, fileName: string) {
    this.buffer = buffer;
    this.fileName = fileName;
    this.fileExt = fileName.split(".").pop()?.toLowerCase() ?? "";
  }

  /**
   * Runs the full suite of forensic analysis methods on the provided image buffer.
   * Delegates the actual processing to independent, specialised modules.
   */
  public async analyzeAll(): Promise<void> {
    // 1. MIME Validation
    await MimeAnalyzer.analyze(this);
    
    // 2. Appended EOF Payloads
    AppendedDataAnalyzer.analyze(this);
    
    // 3. EXIF & Metadata
    ExifAnalyzer.analyze(this);
    
    // 4. Pixel-Level Entropy & Encryption Detection
    await EntropyAnalyzer.analyze(this);
    
    // 5. Advanced LSB Steganography Extraction
    await LsbAnalyzer.analyze(this);
    
    // 6. Base Hex Dump Generation
    this.generateFullHexDump();
  }

  /**
   * Generates a forensic hex dump of the first 4KB of the file for the UI Viewer.
   */
  private generateFullHexDump() {
    const slice = this.buffer.slice(0, 4096);
    this.fullHexDump = slice
      .toString("hex")
      .toUpperCase()
      .match(/.{1,2}/g)
      ?.join(" ") ?? "";
  }
}
