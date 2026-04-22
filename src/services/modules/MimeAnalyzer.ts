import { fileTypeFromBuffer } from "file-type";
import { ImageAnalyzer } from "../ImageAnalyzer";

export class MimeAnalyzer {
  /**
   * 1. FILE SIGNATURE & MIME VALIDATION
   * Checks the magic bytes of the file against its claimed extension.
   * 
   * Edge Cases Handled:
   * - Mismatched extensions (e.g., a .exe renamed to .jpg)
   * - Different but equivalent extensions (e.g., .jpg vs .jpeg)
   * - Completely unknown/unrecognized file types
   */
  static async analyze(analyzer: ImageAnalyzer) {
    const fileTypeInfo = await fileTypeFromBuffer(analyzer.buffer);
    analyzer.extFromHeader = fileTypeInfo?.ext ?? "unknown";
    analyzer.mimeFromHeader = fileTypeInfo?.mime ?? "unknown";
    
    const mimeMatch =
      analyzer.extFromHeader === analyzer.fileExt ||
      (analyzer.extFromHeader === "jpg" && analyzer.fileExt === "jpeg") ||
      (analyzer.extFromHeader === "jpeg" && analyzer.fileExt === "jpg");

    analyzer.magicBytesHex = analyzer.buffer.slice(0, 8).toString("hex").toUpperCase().match(/.{1,2}/g)?.join(" ") ?? "";

    if (mimeMatch) {
      analyzer.indicators.push({
        id: "mime-match",
        name: "File Signature Valid",
        status: "PASS",
        riskImpact: 0,
        plainEnglish: `The file is a genuine image. Its internal binary signature matches the .${analyzer.fileExt} extension.`,
        technical: `Magic bytes: ${analyzer.magicBytesHex} → Detected as ${analyzer.mimeFromHeader}`,
        whyItMatters: "Attackers often rename harmful files (like viruses or scripts) to .jpg to trick users into opening them. This check confirms the file is really what it claims to be.",
      });
    } else {
      analyzer.riskScore += 40;
      analyzer.indicators.push({
        id: "mime-mismatch",
        name: "File Signature Mismatch ⚠️",
        status: "FAIL",
        riskImpact: 40,
        plainEnglish: `This file claims to be a .${analyzer.fileExt} image, but its actual content is a "${analyzer.extFromHeader === "unknown" ? "completely unrecognized file type" : analyzer.extFromHeader}" file. This is a classic attack technique.`,
        technical: `Extension: .${analyzer.fileExt} | Detected MIME: ${analyzer.mimeFromHeader} | Magic bytes: ${analyzer.magicBytesHex}`,
        whyItMatters: "If you had sent this to someone or uploaded it online, and their system trusted the .jpg extension, they might have accidentally executed a malicious file.",
      });
    }
  }
}
