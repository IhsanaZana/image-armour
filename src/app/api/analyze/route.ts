import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { ImageAnalyzer } from "@/services/ImageAnalyzer";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Initialize the analyzer with the image buffer and file name
    const analyzer = new ImageAnalyzer(buffer, file.name);
    
    // Run the full suite of forensic checks
    await analyzer.analyzeAll();

    // Calculate cryptographic hash (SHA-256)
    const hashSum = crypto.createHash("sha256");
    hashSum.update(buffer);
    const fileHash = hashSum.digest("hex");

    // Determine final classification based on the aggregated risk score
    let classification = "SAFE";
    let classificationReason = "No significant security issues were detected. This image appears structurally sound and safe to use.";

    if (analyzer.riskScore >= 40) {
      classification = "UNSAFE";
      classificationReason = "One or more critical security issues were detected. Do NOT share, open, or use this image until the issues below are resolved.";
    } else if (analyzer.riskScore > 10) {
      classification = "SUSPICIOUS";
      classificationReason = "Some anomalies were detected. While not immediately dangerous, this image warrants caution, especially if it came from an unknown source.";
    }

    // Build the final response object
    return NextResponse.json({
      success: true,
      scanId:
        crypto.randomBytes(4).toString("hex").toUpperCase() +
        "-" +
        crypto.randomBytes(2).toString("hex").toUpperCase(),
      date: new Date().toISOString(),
      riskScore: Math.min(analyzer.riskScore, 100),
      classification,
      classificationReason,
      indicators: analyzer.indicators,
      hiddenDataSections: analyzer.hiddenDataSections,
      exifDetails: analyzer.exifDetails,
      technicalData: {
        fileHash,
        pixelEntropy: analyzer.pixelEntropy,
        softwareTag: analyzer.exifDetails["Editing Software"] ?? "None",
        dimensions: analyzer.dimensions,
        mimeType: analyzer.mimeFromHeader,
        magicBytes: analyzer.magicBytesHex,
        fullHexDump: analyzer.fullHexDump,
        size: file.size,
        filename: file.name,
      },
    });
  } catch (error: any) {
    console.error("Analysis Error:", error);
    return NextResponse.json(
      { error: "Analysis failed: " + error.message },
      { status: 500 }
    );
  }
}
