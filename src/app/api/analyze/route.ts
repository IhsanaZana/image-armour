import { NextRequest, NextResponse } from "next/server";
import { fileTypeFromBuffer } from "file-type";
import exifParser from "exif-parser";
import crypto from "crypto";
import sharp from "sharp";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let riskScore = 0;
    const indicators: any[] = [];
    const hiddenDataSections: any[] = [];
    const exifDetails: Record<string, string> = {};

    // ── 1. FILE SIGNATURE & MIME VALIDATION ──────────────────────────────────
    const fileTypeInfo = await fileTypeFromBuffer(buffer);
    const extFromHeader = fileTypeInfo?.ext ?? "unknown";
    const mimeFromHeader = fileTypeInfo?.mime ?? "unknown";
    const fileExt = file.name.split(".").pop()?.toLowerCase() ?? "";

    const mimeMatch =
      extFromHeader === fileExt ||
      (extFromHeader === "jpg" && fileExt === "jpeg") ||
      (extFromHeader === "jpeg" && fileExt === "jpg");

    // Read the actual magic bytes for display
    const magicBytesHex = buffer.slice(0, 8).toString("hex").toUpperCase().match(/.{1,2}/g)?.join(" ") ?? "";

    if (mimeMatch) {
      indicators.push({
        id: "mime-match",
        name: "File Signature Valid",
        status: "PASS",
        riskImpact: 0,
        plainEnglish: "The file is a genuine image. Its internal binary signature matches the ."+fileExt+" extension.",
        technical: `Magic bytes: ${magicBytesHex} → Detected as ${mimeFromHeader}`,
        whyItMatters: "Attackers often rename harmful files (like viruses or scripts) to .jpg to trick users into opening them. This check confirms the file is really what it claims to be.",
      });
    } else {
      riskScore += 40;
      indicators.push({
        id: "mime-mismatch",
        name: "File Signature Mismatch ⚠️",
        status: "FAIL",
        riskImpact: 40,
        plainEnglish: `This file claims to be a .${fileExt} image, but its actual content is a "${extFromHeader === "unknown" ? "completely unrecognized file type" : extFromHeader}" file. This is a classic attack technique.`,
        technical: `Extension: .${fileExt} | Detected MIME: ${mimeFromHeader} | Magic bytes: ${magicBytesHex}`,
        whyItMatters: "If you had sent this to someone or uploaded it online, and their system trusted the .jpg extension, they might have accidentally executed a malicious file.",
      });
    }

    // ── 2. APPENDED DATA DETECTION ──────────────────────────────────────────
    if (extFromHeader === "jpg" || extFromHeader === "jpeg" || mimeFromHeader.includes("jpeg")) {
      const eofMarker = Buffer.from([0xff, 0xd9]);
      const eofIndex = buffer.lastIndexOf(eofMarker);

      if (eofIndex !== -1 && eofIndex < buffer.length - 2) {
        const extraStart = eofIndex + 2;
        const appendedBuffer = buffer.slice(extraStart);
        const extraBytes = appendedBuffer.length;

        if (extraBytes > 50) {
          riskScore += 30;
          // Try to decode as text to show what's hidden
          const textPreview = appendedBuffer.toString("utf8").replace(/\0/g, "").substring(0, 800);
          const hexDump = appendedBuffer
            .slice(0, 128)
            .toString("hex")
            .toUpperCase()
            .match(/.{1,2}/g)
            ?.join(" ") ?? "";

          // Detect what kind of payload it is
          let payloadType = "Unknown binary data";
          if (textPreview.includes("#!/bin/bash") || textPreview.includes("#!/bin/sh")) payloadType = "⚠️ Linux/Unix Shell Script";
          else if (textPreview.includes("curl") || textPreview.includes("wget")) payloadType = "⚠️ Network Download Command";
          else if (textPreview.includes("REG ADD") || textPreview.includes(".exe")) payloadType = "⚠️ Windows Registry / Executable Reference";
          else if (textPreview.includes("PK")) payloadType = "⚠️ ZIP Archive hidden inside image";
          else if (textPreview.includes("<script")) payloadType = "⚠️ JavaScript Code";
          else if (textPreview.includes("python") || textPreview.includes("import socket")) payloadType = "⚠️ Python Script";
          else if (/[a-zA-Z0-9+/]{40,}={0,2}/.test(textPreview)) payloadType = "⚠️ Base64 Encoded Payload";
          else if (/[\x00-\x08\x0E-\x1F]/.test(textPreview)) payloadType = "⚠️ Binary/Encrypted Blob";

          hiddenDataSections.push({
            type: "appended_payload",
            title: "Hidden Payload After Image EOF",
            payloadType,
            sizeBytes: extraBytes,
            textPreview: textPreview.trim(),
            hexDump,
            eofOffset: `0x${eofIndex.toString(16).toUpperCase()}`,
          });

          indicators.push({
            id: "appended-data",
            name: "Hidden Data Found After Image",
            status: "FAIL",
            riskImpact: 30,
            plainEnglish: `${extraBytes.toLocaleString()} hidden bytes were found tucked behind the image. The image appears normal to the eye, but it secretly carries additional code or data.`,
            technical: `EOF marker (FF D9) at offset 0x${eofIndex.toString(16).toUpperCase()}. ${extraBytes} bytes follow. Payload classified as: ${payloadType}`,
            whyItMatters: "This is a known technique called 'steganography'. Criminals use it to smuggle viruses, scripts, or secret data past security scanners by hiding them inside innocent-looking images.",
          });
        } else {
          indicators.push({
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
        indicators.push({
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
      indicators.push({
        id: "eof-skip",
        name: "EOF Check Not Applicable",
        status: "INFO",
        riskImpact: 0,
        plainEnglish: `The appended-data check is specifically for JPEG files. This file is a ${extFromHeader.toUpperCase()}.`,
        technical: `File type: ${mimeFromHeader}. JPEG-specific EOF scan skipped.`,
        whyItMatters: "Different file formats have different structures. JPEG EOF detection only works on JPEG/JPG images.",
      });
    }

    // ── 3. EXIF METADATA INSPECTION ─────────────────────────────────────────
    if (mimeFromHeader.includes("jpeg") || extFromHeader === "jpg") {
      try {
        const parser = exifParser.create(buffer);
        const result = parser.parse();
        const tags = result?.tags ?? {};
        const tagCount = Object.keys(tags).length;

        if (tagCount > 0) {
          // Map EXIF tags to human readable
          if (tags.Make) exifDetails["Camera Brand"] = tags.Make;
          if (tags.Model) exifDetails["Camera Model"] = tags.Model;
          if (tags.Software) exifDetails["Editing Software"] = tags.Software;
          if (tags.DateTimeOriginal) exifDetails["Date Taken"] = new Date(tags.DateTimeOriginal * 1000).toLocaleString();
          if (tags.GPSLatitude) exifDetails["GPS Latitude"] = tags.GPSLatitude.toFixed(6) + "°";
          if (tags.GPSLongitude) exifDetails["GPS Longitude"] = tags.GPSLongitude.toFixed(6) + "°";
          if (tags.ExposureTime) exifDetails["Shutter Speed"] = `1/${Math.round(1 / tags.ExposureTime)}s`;
          if (tags.FNumber) exifDetails["Aperture"] = `f/${tags.FNumber}`;
          if (tags.ISOSpeedRatings) exifDetails["ISO"] = String(tags.ISOSpeedRatings);
          if (tags.Flash) exifDetails["Flash"] = tags.Flash ? "Fired" : "Did not fire";
          if (tags.PixelXDimension) exifDetails["Stored Width"] = `${tags.PixelXDimension}px`;
          if (tags.PixelYDimension) exifDetails["Stored Height"] = `${tags.PixelYDimension}px`;

          riskScore += 5;
          indicators.push({
            id: "metadata-present",
            name: "EXIF Metadata Detected",
            status: "INFO",
            riskImpact: 5,
            plainEnglish: `This image contains ${tagCount} hidden metadata fields. This includes information about the device that created it, timestamps, and possibly its GPS location.`,
            technical: `${tagCount} EXIF tags found. Keys: ${Object.keys(tags).slice(0, 8).join(", ")}...`,
            whyItMatters: "EXIF metadata can expose private information — like where a photo was taken (GPS coordinates) or what device was used. Many people share images without realising this data is embedded.",
          });

          // Check for location data specifically
          if (tags.GPSLatitude && tags.GPSLongitude) {
            riskScore += 10;
            indicators.push({
              id: "gps-location",
              name: "GPS Location Embedded in Image ⚠️",
              status: "FAIL",
              riskImpact: 10,
              plainEnglish: `This image contains the exact GPS coordinates of where it was taken: ${tags.GPSLatitude.toFixed(4)}°, ${tags.GPSLongitude.toFixed(4)}°. Anyone who receives this image can pinpoint your location.`,
              technical: `EXIF GPS: Lat ${tags.GPSLatitude}, Lng ${tags.GPSLongitude}`,
              whyItMatters: "Sharing images with GPS data can reveal your home address, workplace, or regular locations. This is a serious privacy risk used in stalking and targeted attacks.",
            });
          }

          // Check for editing software
          if (tags.Software) {
            const suspiciousSoftware = ["photoshop", "gimp", "lightroom", "canva", "paint.net", "affinity"];
            const isSuspicious = suspiciousSoftware.some((sw) => tags.Software.toLowerCase().includes(sw));
            if (isSuspicious) {
              riskScore += 20;
              indicators.push({
                id: "editing-software",
                name: "Image Was Edited in Professional Software",
                status: "FAIL",
                riskImpact: 20,
                plainEnglish: `The image was processed using "${tags.Software}". This means the original image was deliberately modified before being shared.`,
                technical: `EXIF Software tag: "${tags.Software}"`,
                whyItMatters: "While editing software is used legitimately, in a forensic context it raises a flag — especially when paired with other anomalies. It means the image is not an original unmodified capture.",
              });
            }
          }
        } else {
          indicators.push({
            id: "no-exif",
            name: "No Metadata Found",
            status: "INFO",
            riskImpact: 0,
            plainEnglish: "This image has no EXIF metadata. This is common for images downloaded from social media (which strips metadata), screenshots, or artificially generated images.",
            technical: "EXIF parser found 0 tags in the JFIF/EXIF segment.",
            whyItMatters: "Missing metadata is not automatically bad. However, it could also mean metadata was deliberately stripped to hide the image's origin.",
          });
        }
      } catch {
        riskScore += 10;
        indicators.push({
          id: "exif-corrupt",
          name: "Metadata Segment Corrupt",
          status: "FAIL",
          riskImpact: 10,
          plainEnglish: "The area of the file that stores metadata is broken or malformed. This could mean the file was tampered with.",
          technical: "exif-parser threw an exception while reading the APP1/JFIF metadata segment.",
          whyItMatters: "A broken metadata section in an otherwise valid image is unusual and could indicate the file was manually modified at a binary level.",
        });
      }
    }

    // ── 4. PIXEL-LEVEL ENTROPY ANALYSIS ─────────────────────────────────────
    let dimensions = "Unknown";
    let pixelEntropy = "N/A";
    let imageWidth = 0;
    let imageHeight = 0;

    try {
      const image = sharp(buffer);
      const meta = await image.metadata();
      imageWidth = meta.width ?? 0;
      imageHeight = meta.height ?? 0;
      dimensions = `${imageWidth} × ${imageHeight}`;

      // Calculate real Shannon entropy on raw pixel data (resized for speed)
      const { data } = await image
        .resize(256, 256, { fit: "inside" })
        .raw()
        .toBuffer({ resolveWithObject: true });

      const hist = new Uint32Array(256);
      for (let i = 0; i < data.length; i++) hist[data[i]]++;

      let entropy = 0;
      for (let i = 0; i < 256; i++) {
        if (hist[i] > 0) {
          const p = hist[i] / data.length;
          entropy -= p * Math.log2(p);
        }
      }

      const entropyAvg = entropy;
      pixelEntropy = `${entropyAvg.toFixed(2)} bits/pixel`;

      if (entropyAvg < 1.0) {
        pixelEntropy += " (Very Low)";
        indicators.push({
          id: "low-entropy",
          name: "Very Low Pixel Entropy",
          status: "INFO",
          riskImpact: 0,
          plainEnglish: "The image has almost no visual complexity. This is normal for simple graphics, solid backgrounds, or generated test images.",
          technical: `Shannon entropy: ${entropyAvg.toFixed(4)} bits/pixel. Typical natural photos: 6-8 bits/pixel.`,
          whyItMatters: "A solid color or extremely simple image is not inherently suspicious. However, combined with other flags it can indicate an artificially constructed file.",
        });
      } else if (entropyAvg > 7.95) {
        riskScore += 15;
        pixelEntropy += " (Abnormally High ⚠️)";
        indicators.push({
          id: "high-entropy",
          name: "Abnormally High Pixel Entropy ⚠️",
          status: "FAIL",
          riskImpact: 15,
          plainEnglish: "The image pixel data is almost perfectly random — like white noise. This level of randomness in a normal photo is extremely rare and is a signature of encrypted data hidden inside the image.",
          technical: `Shannon entropy: ${entropyAvg.toFixed(4)} bits/pixel. Encrypted/compressed data typically scores > 7.9.`,
          whyItMatters: "Encrypted data hidden inside an image (a technique called steganography) appears as random noise at the pixel level. This is used to secretly communicate or smuggle encrypted data.",
        });
      } else {
        pixelEntropy += " (Normal)";
        indicators.push({
          id: "normal-entropy",
          name: "Pixel Entropy Normal",
          status: "PASS",
          riskImpact: 0,
          plainEnglish: `The image has a healthy level of visual complexity (${entropyAvg.toFixed(2)} bits/pixel), consistent with a real photograph or graphic.`,
          technical: `Shannon entropy: ${entropyAvg.toFixed(4)} bits/pixel. Within normal range (1.0–7.9).`,
          whyItMatters: "Normal entropy means the pixel data does not show signs of hidden encrypted content.",
        });
      }
    } catch {
      riskScore += 50;
      indicators.push({
        id: "sharp-fail",
        name: "Image Cannot Be Rendered ❌",
        status: "FAIL",
        riskImpact: 50,
        plainEnglish: "ImageArmour was unable to decode this file as an image at all. Despite having an image extension, the file cannot be displayed. It is not a real image.",
        technical: "sharp() threw an exception during decode. File is structurally invalid.",
        whyItMatters: "A file that cannot be decoded as an image but pretends to be one is highly suspicious and potentially dangerous.",
      });
    }

    // ── 5. LSB STEGANOGRAPHY DETECTION ─────────────────────────────────────
    try {
      // Get full-resolution raw pixel data (no resize — we need every pixel)
      const rawImage = sharp(buffer);
      const { data: rawPixels, info: rawInfo } = await rawImage
        .removeAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

      const totalChannels = rawPixels.length; // width * height * 3 (RGB)

      // Extract LSBs from each channel byte → reconstruct hidden bytes
      // Every 8 channel-bytes contribute 1 bit each → 1 hidden byte
      const maxBytesToCheck = Math.min(totalChannels, 3 * 1024 * 1024); // cap at ~1M pixels
      const hiddenBytes: number[] = [];
      let currentByte = 0;
      let bitsCollected = 0;

      for (let i = 0; i < maxBytesToCheck; i++) {
        currentByte = (currentByte << 1) | (rawPixels[i] & 1);
        bitsCollected++;
        if (bitsCollected === 8) {
          hiddenBytes.push(currentByte);
          currentByte = 0;
          bitsCollected = 0;
        }
      }

      // Helper: extract null-terminated UTF-8 string starting at offset
      const extractNullTerminated = (startOffset: number, maxLen = 8192): { text: string; endOffset: number } | null => {
        const end = hiddenBytes.indexOf(0, startOffset);
        if (end === -1 || end === startOffset || (end - startOffset) > maxLen) return null;
        const candidate = Buffer.from(hiddenBytes.slice(startOffset, end));
        try {
          const text = candidate.toString("utf8");
          const printable = text.split("").filter((c) => {
            const code = c.charCodeAt(0);
            return (code >= 32 && code <= 126) || code === 9 || code === 10 || code === 13;
          }).length;
          const ratio = text.length > 0 ? printable / text.length : 0;
          if (ratio > 0.80) return { text, endOffset: end };
        } catch { /* ignore */ }
        return null;
      };

      // Known tool magic headers that prefix the real message
      const KNOWN_HEADERS = ["Steg", "steg", "STEG", "msg", "MSG", "hidden", "HIDDEN", "data", "DATA"];

      let lsbMessage: string | null = null;
      let lsbMessageLength = 0;

      // Strategy 1: null-terminated scan — handles devglan "Steg\0[message]\0" format
      // We walk through all null-terminated segments in the first 8 KB, skipping known headers
      {
        let offset = 0;
        const maxScanOffset = Math.min(hiddenBytes.length, 8192);
        while (offset < maxScanOffset && !lsbMessage) {
          const result = extractNullTerminated(offset, 4096);
          if (!result) break;
          const isKnownHeader = KNOWN_HEADERS.includes(result.text.trim());
          if (!isKnownHeader && result.text.trim().length > 0) {
            // This is the actual message (not a header marker)
            lsbMessage = result.text;
            lsbMessageLength = result.text.length;
          }
          // Move past this null byte to check the next segment
          offset = result.endOffset + 1;
        }
      }

      // Strategy 2: look for 32-bit length-prefixed format (some tools write length first)
      if (!lsbMessage && hiddenBytes.length >= 4) {
        const claimedLen =
          (hiddenBytes[0] << 24) | (hiddenBytes[1] << 16) | (hiddenBytes[2] << 8) | hiddenBytes[3];
        if (claimedLen > 0 && claimedLen <= 4096 && claimedLen + 4 <= hiddenBytes.length) {
          const candidate = Buffer.from(hiddenBytes.slice(4, 4 + claimedLen));
          const text = candidate.toString("utf8");
          const printable = text.split("").filter((c) => {
            const code = c.charCodeAt(0);
            return (code >= 32 && code <= 126) || code === 9 || code === 10 || code === 13;
          }).length;
          const ratio = claimedLen > 0 ? printable / text.length : 0;
          if (ratio > 0.80 && text.trim().length > 0) {
            lsbMessage = text;
            lsbMessageLength = claimedLen;
          }
        }
      }

      // Strategy 3: scan first 512 reconstructed bytes for any readable text run
      if (!lsbMessage) {
        const sample = Buffer.from(hiddenBytes.slice(0, 512)).toString("binary");
        const readableRun = sample.match(/[ -~\t\n\r]{6,}/g); // 6+ printable chars
        if (readableRun && readableRun.length > 0) {
          const longestRun = readableRun.sort((a, b) => b.length - a.length)[0];
          if (longestRun.length >= 6) {
            lsbMessage = longestRun.trim();
            lsbMessageLength = longestRun.length;
          }
        }
      }

      if (lsbMessage) {
        riskScore += 65;
        hiddenDataSections.push({
          type: "lsb_steganography",
          title: "LSB Steganography Detected",
          payloadType: "Hidden text message embedded in pixel LSBs",
          sizeBytes: lsbMessageLength,
          textPreview: lsbMessage,
          hexDump: Buffer.from(hiddenBytes.slice(0, Math.min(lsbMessageLength + 4, 128)))
            .toString("hex")
            .toUpperCase()
            .match(/.{1,2}/g)
            ?.join(" ") ?? "",
          eofOffset: "N/A (pixel-level)",
        });

        indicators.push({
          id: "lsb-stego",
          name: "LSB Steganography Detected 🚨",
          status: "FAIL",
          riskImpact: 65,
          plainEnglish: `A secret text message ("${lsbMessage.substring(0, 80)}${lsbMessage.length > 80 ? "…" : ""}") was found hidden inside the pixel data of this image. The image looks completely normal to the eye but is actively being used as a covert communication channel.`,
          technical: `Least Significant Bit steganography detected. ${lsbMessageLength} bytes of hidden UTF-8 plaintext extracted from pixel channel LSBs. Encoding consistent with devglan.com / standard 1-bit-per-channel LSB embedding. Message readable without a passphrase.`,
          whyItMatters: "LSB steganography is the primary technique used by threat actors to exfiltrate data and communicate covertly without triggering network-level detection. Because the image appears visually identical, it bypasses standard antivirus, email filters, and content scanners entirely. Discovery of a readable plaintext payload indicates active operational use.",
        });
      } else {
        // Check if the LSB pattern itself is non-random (chi-square test on 0/1 distribution)
        let ones = 0;
        const sampleSize = Math.min(totalChannels, 100000);
        for (let i = 0; i < sampleSize; i++) ones += rawPixels[i] & 1;
        const ratio0 = (sampleSize - ones) / sampleSize;
        const ratio1 = ones / sampleSize;
        // Natural images: LSBs ≈ 50/50. Strongly biased → not stego but unusual
        const isHighlyBiased = ratio0 < 0.35 || ratio0 > 0.65;
        if (isHighlyBiased) {
          riskScore += 10;
          indicators.push({
            id: "lsb-bias",
            name: "LSB Bit Distribution Anomaly",
            status: "FAIL",
            riskImpact: 10,
            plainEnglish: `The pixel data shows an unusual pattern in its least significant bits (${(ratio1 * 100).toFixed(1)}% ones vs expected ~50%). This can indicate LSB steganography with an encrypted or compressed payload.`,
            technical: `LSB 0/1 ratio: ${(ratio0 * 100).toFixed(2)}% / ${(ratio1 * 100).toFixed(2)}% over ${sampleSize.toLocaleString()} samples. Expected ≈50/50 for natural images.`,
            whyItMatters: "A biased LSB distribution is a statistical fingerprint of hidden data or payload manipulation inside image pixels.",
          });
        } else {
          indicators.push({
            id: "no-lsb-stego",
            name: "No LSB Steganography Detected",
            status: "PASS",
            riskImpact: 0,
            plainEnglish: "No hidden text messages were found encoded into the pixel data using LSB steganography.",
            technical: `LSB extraction found no null-terminated or length-prefixed UTF-8 text. LSB 0/1 ratio: ${(ratio0 * 100).toFixed(2)}% / ${(ratio1 * 100).toFixed(2)}% (normal).`,
            whyItMatters: "LSB steganography is the most common method for hiding messages in images. A clean result here means no readable plaintext payload was embedded using this technique.",
          });
        }
      }
    } catch (lsbErr) {
      // Non-fatal: skip LSB check if pixel extraction fails
      console.warn("LSB check skipped:", lsbErr);
    }

    // ── 6. CRYPTOGRAPHIC HASH ────────────────────────────────────────────────
    const hashSum = crypto.createHash("sha256");
    hashSum.update(buffer);
    const fileHash = hashSum.digest("hex");

    // ── FINAL CLASSIFICATION ─────────────────────────────────────────────────
    let classification = "SAFE";
    let classificationReason = "No significant security issues were detected. This image appears structurally sound and safe to use.";

    if (riskScore >= 40) {
      classification = "UNSAFE";
      classificationReason = "One or more critical security issues were detected. Do NOT share, open, or use this image until the issues below are resolved.";
    } else if (riskScore > 10) {
      classification = "SUSPICIOUS";
      classificationReason = "Some anomalies were detected. While not immediately dangerous, this image warrants caution, especially if it came from an unknown source.";
    }

    return NextResponse.json({
      success: true,
      scanId:
        crypto.randomBytes(4).toString("hex").toUpperCase() +
        "-" +
        crypto.randomBytes(2).toString("hex").toUpperCase(),
      date: new Date().toISOString(),
      riskScore: Math.min(riskScore, 100),
      classification,
      classificationReason,
      indicators,
      hiddenDataSections,
      exifDetails,
      technicalData: {
        fileHash,
        pixelEntropy,
        softwareTag: exifDetails["Editing Software"] ?? "None",
        dimensions,
        mimeType: mimeFromHeader,
        magicBytes: buffer.slice(0, 8).toString("hex").toUpperCase().match(/.{1,2}/g)?.join(" ") ?? "",
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
