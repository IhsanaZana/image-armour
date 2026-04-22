import { ImageAnalyzer } from "../ImageAnalyzer";

export class AppendedDataAnalyzer {
  /**
   * 2. APPENDED DATA DETECTION
   * Checks for extra bytes appended after the End-Of-File (EOF) marker in JPEGs.
   * 
   * Edge Cases Handled:
   * - Skips check if file is not a JPEG (other formats don't have strict EOFs)
   * - Allows minor padding (<= 50 bytes) as normal encoder behavior
   * - Fingerprints common payload types (Bash, Exe, Python, Base64) to give accurate alerts
   */
  static analyze(analyzer: ImageAnalyzer) {
    if (analyzer.extFromHeader === "jpg" || analyzer.extFromHeader === "jpeg" || analyzer.mimeFromHeader.includes("jpeg")) {
      const eofMarker = Buffer.from([0xff, 0xd9]);
      const eofIndex = analyzer.buffer.lastIndexOf(eofMarker);

      if (eofIndex !== -1 && eofIndex < analyzer.buffer.length - 2) {
        const extraStart = eofIndex + 2;
        const appendedBuffer = analyzer.buffer.slice(extraStart);
        const extraBytes = appendedBuffer.length;

        if (extraBytes > 50) {
          analyzer.riskScore += 30;
          const textPreview = appendedBuffer.toString("utf8").replace(/\0/g, "").substring(0, 800);
          const hexDump = appendedBuffer
            .slice(0, 128)
            .toString("hex")
            .toUpperCase()
            .match(/.{1,2}/g)
            ?.join(" ") ?? "";

          let payloadType = "Unknown binary data";
          if (textPreview.includes("#!/bin/bash") || textPreview.includes("#!/bin/sh")) payloadType = "⚠️ Linux/Unix Shell Script";
          else if (textPreview.includes("curl") || textPreview.includes("wget")) payloadType = "⚠️ Network Download Command";
          else if (textPreview.includes("REG ADD") || textPreview.includes(".exe")) payloadType = "⚠️ Windows Registry / Executable Reference";
          else if (textPreview.includes("PK")) payloadType = "⚠️ ZIP Archive hidden inside image";
          else if (textPreview.includes("<script")) payloadType = "⚠️ JavaScript Code";
          else if (textPreview.includes("python") || textPreview.includes("import socket")) payloadType = "⚠️ Python Script";
          else if (/[a-zA-Z0-9+/]{40,}={0,2}/.test(textPreview)) payloadType = "⚠️ Base64 Encoded Payload";
          else if (/[\x00-\x08\x0E-\x1F]/.test(textPreview)) payloadType = "⚠️ Binary/Encrypted Blob";

          analyzer.hiddenDataSections.push({
            type: "appended_payload",
            title: "Hidden Payload After Image EOF",
            payloadType,
            sizeBytes: extraBytes,
            textPreview: textPreview.trim(),
            hexDump,
            eofOffset: `0x${eofIndex.toString(16).toUpperCase()}`,
          });

          analyzer.indicators.push({
            id: "appended-data",
            name: "Hidden Data Found After Image",
            status: "FAIL",
            riskImpact: 30,
            plainEnglish: `${extraBytes.toLocaleString()} hidden bytes were found tucked behind the image. The image appears normal to the eye, but it secretly carries additional code or data.`,
            technical: `EOF marker (FF D9) at offset 0x${eofIndex.toString(16).toUpperCase()}. ${extraBytes} bytes follow. Payload classified as: ${payloadType}`,
            whyItMatters: "This is a known technique called 'steganography'. Criminals use it to smuggle viruses, scripts, or secret data past security scanners by hiding them inside innocent-looking images.",
          });
        } else {
          analyzer.indicators.push({
            id: "minor-padding",
            name: "Minor Padding (Normal)",
            status: "PASS",
            riskImpact: 0,
            plainEnglish: `A tiny amount of padding (${extraBytes} bytes) exists after the image. This is harmless and common in standard JPEG files.`,
            technical: `${extraBytes} bytes after EOF marker at 0x${eofIndex.toString(16).toUpperCase()}`,
            whyItMatters: "Some image encoders add a few bytes of harmless padding. This is not a threat.",
          });
        }
      } else {
        analyzer.indicators.push({
          id: "no-append",
          name: "No Hidden Data After Image",
          status: "PASS",
          riskImpact: 0,
          plainEnglish: "The image file ends exactly where a JPEG should end. Nothing is hidden after the image data.",
          technical: "EOF marker (FF D9) found at end of file. No extra bytes detected.",
          whyItMatters: "This confirms no data has been secretly appended to the file after the image content.",
        });
      }
    } else {
      analyzer.indicators.push({
        id: "eof-skip",
        name: "EOF Check Not Applicable",
        status: "INFO",
        riskImpact: 0,
        plainEnglish: `The appended-data check is specifically for JPEG files. This file is a ${analyzer.extFromHeader.toUpperCase()}.`,
        technical: `File type: ${analyzer.mimeFromHeader}. JPEG-specific EOF scan skipped.`,
        whyItMatters: "Different file formats have different structures. JPEG EOF detection only works on JPEG/JPG images.",
      });
    }
  }
}
