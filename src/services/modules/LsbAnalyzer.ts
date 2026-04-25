import sharp from "sharp";
import { ImageAnalyzer } from "../ImageAnalyzer";

export class LsbAnalyzer {
  /**
   * 5. LSB STEGANOGRAPHY DETECTION
   * Extracts Least Significant Bits to discover hidden text messages.
   * 
   * Edge Cases Handled:
   * - Proprietary Magic Bytes (Devglan): Identifies custom "Steg" headers (`0x53746567`) 
   *   used by commercial steganography tools to correctly parse shifted length prefixes 
   *   and prevent massive false-positive length rejections.
   * - Parallel RGBA vs RGB Extraction: Some tools (like Devglan) skip the Alpha channel, 
   *   while others don't. We run a dual-pass to catch both without corrupting the bitstream.
   * - Strict NLP Filtering: Purely mathematical extraction results in random "ghost" strings (e.g. "YPOV Rkkw"). 
   *   We enforce strict per-word vowel checks and linguistic shapes to eliminate false positives.
   * - Length Prefixes: Safely unpacks standard Big-Endian and Little-Endian 32-bit length headers.
   * - Null-Terminated Walkbacks: Detects strings cleanly terminated by 0x00 and isolates the payload.
   * - Complex Spaceless Payloads: Recovers encrypted/base64 strings if they are long and 100% text-dense.
   */
  static async analyze(analyzer: ImageAnalyzer) {
    try {
      const rawImage = sharp(analyzer.buffer);
      const meta = await rawImage.metadata();
      const channels = meta.channels || 3;
      
      const { data: rawPixels } = await rawImage
        .raw()
        .toBuffer({ resolveWithObject: true });

      const totalChannels = rawPixels.length;
      const maxBytesToCheck = Math.min(totalChannels, 4 * 1024 * 1024); // Limit to 4MB of channels to avoid memory spike
      
      const hiddenBytesMSB: number[] = [];
      const hiddenBytesLSB: number[] = [];
      const hiddenBytesMSB_RGB: number[] = [];
      const hiddenBytesLSB_RGB: number[] = [];
      
      let currentByteMSB = 0;
      let currentByteLSB = 0;
      let bitsCollected = 0;
      
      let currentByteMSB_RGB = 0;
      let currentByteLSB_RGB = 0;
      let bitsCollected_RGB = 0;

      for (let i = 0; i < maxBytesToCheck; i++) {
        const bit = rawPixels[i] & 1;
        
        // 1. Collect from ALL channels (Handles RGBA embeddings natively)
        currentByteMSB = (currentByteMSB << 1) | bit;
        currentByteLSB = currentByteLSB | (bit << bitsCollected);
        bitsCollected++;
        if (bitsCollected === 8) {
          hiddenBytesMSB.push(currentByteMSB);
          hiddenBytesLSB.push(currentByteLSB);
          currentByteMSB = 0;
          currentByteLSB = 0;
          bitsCollected = 0;
        }

        // 2. Collect from RGB channels only (Skips Alpha channel for Devglan compatibility)
        if (channels !== 4 || (i % 4) !== 3) {
          currentByteMSB_RGB = (currentByteMSB_RGB << 1) | bit;
          currentByteLSB_RGB = currentByteLSB_RGB | (bit << bitsCollected_RGB);
          bitsCollected_RGB++;
          if (bitsCollected_RGB === 8) {
            hiddenBytesMSB_RGB.push(currentByteMSB_RGB);
            hiddenBytesLSB_RGB.push(currentByteLSB_RGB);
            currentByteMSB_RGB = 0;
            currentByteLSB_RGB = 0;
            bitsCollected_RGB = 0;
          }
        }
      }

      let lsbMessage: string | null = null;
      let lsbMessageLength = 0;
      let hiddenBytesToUse = hiddenBytesMSB;

      // Helper to strictly validate human-like text to kill false-positive statistical ghosts
      const isHumanText = (text: string): boolean => {
         const trimmed = text.trim();
         if (trimmed.length >= 20) return true; // Accept long strings
         if (trimmed.startsWith("http") || trimmed.startsWith("www.")) return true;
         
         if (!trimmed.includes(" ")) return false;
         
         const words = trimmed.split(/\s+/).filter(w => w.length >= 2);
         if (words.length < 2) return false;
         
         // Per-word linguistic verification: Every word must have a vowel
         for (const word of words) {
            if (!/[aeiouyAEIOUY]/.test(word)) return false;
         }
         return true;
      };

      // Helper to check if a buffer is mostly readable text
      const isReadableText = (buf: Buffer, minLen: number = 8): string | null => {
        if (buf.length < minLen) return null;
        try {
          const text = buf.toString("utf8");
          if (text.includes('\ufffd')) return null;
          
          let printableCount = 0;
          for (let i = 0; i < text.length; i++) {
            const code = text.charCodeAt(i);
            if ((code >= 32 && code <= 126) || code === 9 || code === 10 || code === 13) {
              printableCount++;
            }
          }
          const ratio = printableCount / text.length;
          if (ratio >= 0.90 && text.trim().length >= minLen) {
            if (text.trim().length < 20 && !isHumanText(text)) return null;
            return text;
          }
        } catch { /* ignore */ }
        return null;
      };

      const findPayload = (hiddenBytes: number[]): { text: string, length: number } | null => {
        // 1. Length-Prefixed Payload (Devglan specific "Steg" magic bytes)
        if (hiddenBytes.length >= 12 && 
            hiddenBytes[0] === 0x53 && hiddenBytes[1] === 0x74 && 
            hiddenBytes[2] === 0x65 && hiddenBytes[3] === 0x67) {
          const claimedLenBE = ((hiddenBytes[8] << 24) | (hiddenBytes[9] << 16) | (hiddenBytes[10] << 8) | hiddenBytes[11]) >>> 0;
          if (claimedLenBE > 0 && claimedLenBE <= 8192 && claimedLenBE + 12 <= hiddenBytes.length) {
            const candidate = Buffer.from(hiddenBytes.slice(12, 12 + claimedLenBE));
            const text = isReadableText(candidate, 2); // Devglan uses explicit magic bytes, so even short text is highly reliable
            if (text) return { text, length: claimedLenBE };
          }
        }

        // 1.5. Generic Length-Prefixed Payload
        if (hiddenBytes.length >= 4) {
          const claimedLenBE = ((hiddenBytes[0] << 24) | (hiddenBytes[1] << 16) | (hiddenBytes[2] << 8) | hiddenBytes[3]) >>> 0;
          if (claimedLenBE > 0 && claimedLenBE <= 8192 && claimedLenBE + 4 <= hiddenBytes.length) {
            const candidate = Buffer.from(hiddenBytes.slice(4, 4 + claimedLenBE));
            const text = isReadableText(candidate, 5);
            if (text) return { text, length: claimedLenBE };
          }
          
          const claimedLenLE = ((hiddenBytes[3] << 24) | (hiddenBytes[2] << 16) | (hiddenBytes[1] << 8) | hiddenBytes[0]) >>> 0;
          if (claimedLenLE > 0 && claimedLenLE <= 8192 && claimedLenLE + 4 <= hiddenBytes.length) {
            const candidate = Buffer.from(hiddenBytes.slice(4, 4 + claimedLenLE));
            const text = isReadableText(candidate, 5);
            if (text) return { text, length: claimedLenLE };
          }
        }

        // 2. Scan for explicitly Null-Terminated Strings
        const searchLimit = Math.min(hiddenBytes.length, 16384);
        for (let i = 0; i < searchLimit; i++) {
          if (hiddenBytes[i] === 0) {
            const textBytes: number[] = [];
            for (let j = i - 1; j >= 0; j--) {
              const code = hiddenBytes[j];
              if ((code >= 32 && code <= 126) || code === 9 || code === 10 || code === 13) {
                textBytes.unshift(code);
              } else {
                break;
              }
            }
            
            if (textBytes.length >= 8) {
              const text = Buffer.from(textBytes).toString("utf8");
              const trimmed = text.trim();
              if (trimmed.length < 8) continue;

              const pureTextMatch = text.match(/[a-zA-Z0-9 \n\r]/g);
              const pureRatio = pureTextMatch ? pureTextMatch.length / text.length : 0;
              
              if (pureRatio >= 0.90) {
                if (/(.)\1{4,}/.test(trimmed)) continue; // Reject repetitive noise

                const letterCount = trimmed.match(/[a-zA-Z]/g)?.length || 0;
                const letterRatio = letterCount / trimmed.length;

                // For short strings (< 20 chars), strictly enforce human readability
                if (trimmed.length < 20) {
                    if (!isHumanText(trimmed) || letterRatio < 0.7) continue;
                }
                return { text: trimmed, length: textBytes.length };
              }
            }
          }
        }

        // 3. Strict Regex Fallback for Raw Payloads (No Prefixes/Terminators)
        const sample = Buffer.from(hiddenBytes).toString("binary");
        const runs = sample.match(/[ -~\t\n\r]{8,}/g);
        
        if (runs) {
          for (const run of runs.sort((a, b) => b.length - a.length)) {
            if (/(.)\1{4,}/.test(run)) continue; // Reject repetitive noise

            const trimmed = run.trim();
            if (trimmed.length < 10) continue; // Minimum length 10 required for unformatted payloads

            const pureTextMatch = run.match(/[a-zA-Z0-9 \n\r]/g);
            const pureRatio = pureTextMatch ? pureTextMatch.length / run.length : 0;
            
            const hasSpace = trimmed.includes(" ");
            const vowelCount = trimmed.match(/[aeiouyAEIOUY]/g)?.length || 0;
            const letterCount = trimmed.match(/[a-zA-Z]/g)?.length || 0;
            const letterRatio = letterCount / trimmed.length;
            const isUrl = trimmed.startsWith("http") || trimmed.startsWith("www.");

            // A. Long Strings (>= 20 chars)
            if (trimmed.length >= 20 && pureRatio >= 0.95) {
               if (isUrl) return { text: trimmed, length: run.length };
               if (hasSpace && vowelCount >= 3 && letterRatio >= 0.6) {
                   return { text: trimmed, length: run.length };
               }
               // Catch complex spaceless payloads (like passwords or encoded strings)
               if (!hasSpace && letterRatio >= 0.85 && vowelCount >= 3) {
                   return { text: trimmed, length: run.length };
               }
            }
            
            // B. Short Strings (10-19 chars)
            // Highly susceptible to statistical noise. Requires absolute perfection.
            if (trimmed.length >= 10 && trimmed.length < 20 && pureRatio === 1.0) {
              if (isHumanText(trimmed) && letterRatio >= 0.75) {
                 return { text: trimmed, length: run.length };
              }
            }
          }
        }

        return null;
      };

      // Cascade check through all channel extraction combinations
      let payloadInfo = findPayload(hiddenBytesMSB);
      if (!payloadInfo) payloadInfo = findPayload(hiddenBytesLSB);
      if (!payloadInfo) payloadInfo = findPayload(hiddenBytesMSB_RGB);
      if (!payloadInfo) payloadInfo = findPayload(hiddenBytesLSB_RGB);

      if (payloadInfo) {
        lsbMessage = payloadInfo.text;
        lsbMessageLength = payloadInfo.length;
        hiddenBytesToUse = hiddenBytesMSB; 
      }

      if (lsbMessage) {
        analyzer.riskScore += 65;
        analyzer.hiddenDataSections.push({
          type: "lsb_steganography",
          title: "LSB Steganography Detected",
          payloadType: "Hidden text message embedded in pixel LSBs",
          sizeBytes: lsbMessageLength,
          textPreview: lsbMessage,
          hexDump: Buffer.from(hiddenBytesToUse.slice(0, Math.min(lsbMessageLength + 4, 128)))
            .toString("hex")
            .toUpperCase()
            .match(/.{1,2}/g)
            ?.join(" ") ?? "",
          eofOffset: "N/A (pixel-level)",
        });

        analyzer.indicators.push({
          id: "lsb-stego",
          name: "LSB Steganography Detected 🚨",
          status: "FAIL",
          riskImpact: 65,
          plainEnglish: `A secret text message ("${lsbMessage.substring(0, 80)}${lsbMessage.length > 80 ? "…" : ""}") was found hidden inside the pixel data of this image. The image looks completely normal to the eye but is actively being used as a covert communication channel.`,
          technical: `Least Significant Bit steganography detected. ${lsbMessageLength} bytes of hidden UTF-8 plaintext extracted from pixel channel LSBs. Encoding consistent with standard 1-bit-per-channel LSB embedding. Message readable without a passphrase.`,
          whyItMatters: "LSB steganography is the primary technique used by threat actors to exfiltrate data and communicate covertly without triggering network-level detection. Because the image appears visually identical, it bypasses standard antivirus, email filters, and content scanners entirely. Discovery of a readable plaintext payload indicates active operational use.",
        });
      } else {
        // Entropy Baseline Check for statistical anomalies (e.g. encrypted LSBs)
        let ones = 0;
        const sampleSize = Math.min(totalChannels, 100000);
        for (let i = 0; i < sampleSize; i++) ones += rawPixels[i] & 1;
        const ratio0 = (sampleSize - ones) / sampleSize;
        const ratio1 = ones / sampleSize;
        
        const isHighlyBiased = ratio0 < 0.35 || ratio0 > 0.65;
        if (isHighlyBiased) {
          analyzer.riskScore += 10;
          analyzer.indicators.push({
            id: "lsb-bias",
            name: "LSB Bit Distribution Anomaly",
            status: "FAIL",
            riskImpact: 10,
            plainEnglish: `The pixel data shows an unusual pattern in its least significant bits (${(ratio1 * 100).toFixed(1)}% ones vs expected ~50%). This can indicate LSB steganography with an encrypted or compressed payload.`,
            technical: `LSB 0/1 ratio: ${(ratio0 * 100).toFixed(2)}% / ${(ratio1 * 100).toFixed(2)}% over ${sampleSize.toLocaleString()} samples. Expected ≈50/50 for natural images.`,
            whyItMatters: "A biased LSB distribution is a statistical fingerprint of hidden data or payload manipulation inside image pixels.",
          });
        } else {
          analyzer.indicators.push({
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
      console.warn("LSB check skipped:", lsbErr);
    }
  }
}
