import sharp from "sharp";
import { ImageAnalyzer } from "../ImageAnalyzer";

export class LsbAnalyzer {

  static async analyze(analyzer: ImageAnalyzer) {
    try {
      // ── GUARD: Skip if already analysed (prevents duplicate indicators on re-run) ──
      if (analyzer.indicators.some(i => i.id === "lsb-stego" || i.id === "no-lsb-stego" || i.id === "lsb-bias")) {
        return;
      }

      const rawImage = sharp(analyzer.buffer);
      const meta = await rawImage.metadata();
      const channels = meta.channels || 3;

      // ── GUARD: Reject images too small to carry any meaningful LSB payload ──
      // An 8-byte hidden message needs at least 64 pixels × channels worth of data.
      const { data: rawPixels, info } = await rawImage
        .raw()
        .toBuffer({ resolveWithObject: true });

      const totalSubpixels = rawPixels.length;
      if (totalSubpixels < 256) {
        analyzer.indicators.push({
          id: "no-lsb-stego",
          name: "No LSB Steganography Detected",
          status: "PASS",
          riskImpact: 0,
          plainEnglish: "Image is too small to carry any meaningful LSB payload.",
          technical: `Only ${totalSubpixels} sub-pixel samples available — far below the minimum needed for LSB steganography.`,
          whyItMatters: "LSB steganography requires a minimum pixel surface area. Extremely small images cannot hide data this way.",
        });
        return;
      }

      // ── MEMORY-BOUNDED EXTRACTION ──
      // Cap at 2MB of sub-pixels to prevent OOM on 50MP+ photos.
      // 2MB of channels = 2M extracted bits = 256KB of hidden bytes per stream — far more than
      // any realistic plaintext payload. Devglan caps at 8KB.
      const maxBytesToCheck = Math.min(totalSubpixels, 2 * 1024 * 1024);

      // Use Uint8Array instead of number[] to cut memory usage by ~8× on V8
      const estimatedBytesAll  = Math.ceil(maxBytesToCheck / 8);
      const estimatedBytesRGB  = Math.ceil((maxBytesToCheck * (channels >= 4 ? 3 / 4 : 1)) / 8);

      const hiddenBytesMSB     = new Uint8Array(estimatedBytesAll);
      const hiddenBytesLSB     = new Uint8Array(estimatedBytesAll);
      const hiddenBytesMSB_RGB = new Uint8Array(estimatedBytesRGB);
      const hiddenBytesLSB_RGB = new Uint8Array(estimatedBytesRGB);

      let idxAll = 0, idxRGB = 0;
      let currentByteMSB = 0, currentByteLSB = 0, bitsCollected = 0;
      let currentByteMSB_RGB = 0, currentByteLSB_RGB = 0, bitsCollected_RGB = 0;

      for (let i = 0; i < maxBytesToCheck; i++) {
        const bit = rawPixels[i] & 1;

        // Collect from ALL channels (handles RGBA/Greyscale embeddings)
        currentByteMSB = (currentByteMSB << 1) | bit;
        currentByteLSB = currentByteLSB | (bit << bitsCollected);
        bitsCollected++;
        if (bitsCollected === 8) {
          hiddenBytesMSB[idxAll] = currentByteMSB;
          hiddenBytesLSB[idxAll] = currentByteLSB;
          idxAll++;
          currentByteMSB = 0;
          currentByteLSB = 0;
          bitsCollected = 0;
        }

        // Collect from RGB-only channels (skips Alpha for Devglan; skips nothing for 1/2/3-channel images)
        const isAlphaChannel = channels === 4 && (i % 4) === 3;
        if (!isAlphaChannel) {
          currentByteMSB_RGB = (currentByteMSB_RGB << 1) | bit;
          currentByteLSB_RGB = currentByteLSB_RGB | (bit << bitsCollected_RGB);
          bitsCollected_RGB++;
          if (bitsCollected_RGB === 8) {
            hiddenBytesMSB_RGB[idxRGB] = currentByteMSB_RGB;
            hiddenBytesLSB_RGB[idxRGB] = currentByteLSB_RGB;
            idxRGB++;
            currentByteMSB_RGB = 0;
            currentByteLSB_RGB = 0;
            bitsCollected_RGB = 0;
          }
        }
      }

      // Trim to actual filled length
      const allMSB = hiddenBytesMSB.subarray(0, idxAll);
      const allLSB = hiddenBytesLSB.subarray(0, idxAll);
      const rgbMSB = hiddenBytesMSB_RGB.subarray(0, idxRGB);
      const rgbLSB = hiddenBytesLSB_RGB.subarray(0, idxRGB);

      // ═══════════════════════════════════════════════════════════════════════════
      //  HELPER FUNCTIONS
      // ═══════════════════════════════════════════════════════════════════════════

      // Shannon entropy in bits-per-character. Real English ≈ 3.5–4.5, Base64 ≈ 5.5–6.0, noise < 3.
      const shannonEntropy = (s: string): number => {
        if (s.length === 0) return 0;
        const freq: Record<string, number> = {};
        for (const c of s) freq[c] = (freq[c] || 0) + 1;
        return Object.values(freq).reduce((h, n) => {
          const p = n / s.length;
          return h - p * Math.log2(p);
        }, 0);
      };

      // Sanitise extracted text so it can't break JSON serialisation or inject HTML.
      // Replaces control chars (except space/tab/newline) with the Unicode replacement character.
      const sanitise = (s: string): string =>
        s.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, "\ufffd");

      // ── NLP FILTER: isHumanText ──
      // Strict linguistic gate that rejects statistical noise from pixel extraction.
      const isHumanText = (text: string): boolean => {
        const trimmed = text.trim();
        if (trimmed.length === 0) return false;
        if (trimmed.startsWith("http") || trimmed.startsWith("www.")) return true;

        const hasSpace = trimmed.includes(" ");

        // ── Spaceless path ──
        if (!hasSpace) {
          if (trimmed.length >= 20) {
            const uniqueChars = new Set(trimmed).size;
            if (uniqueChars < 10) return false;
            const entropy = shannonEntropy(trimmed);
            if (entropy < 3.5) return false;

            // Reject if the string is dominated by a single character (> 40% of total)
            const freq: Record<string, number> = {};
            for (const c of trimmed) freq[c] = (freq[c] || 0) + 1;
            const maxFreq = Math.max(...Object.values(freq));
            if (maxFreq / trimmed.length > 0.40) return false;

            return true;
          }
          return false;
        }

        // ── Spaced (multi-word) path ──
        const words = trimmed.split(/\s+/).filter(w => w.length >= 2);
        if (words.length < 2) return false;

        // Require at least 2 distinct core vowel types (a, e, i, o, u) across the whole string.
        const distinctCoreVowels = new Set(
          trimmed.toLowerCase().split('').filter(c => 'aeiou'.includes(c))
        ).size;
        if (distinctCoreVowels < 2) return false;

        // Per-word vowel check (core vowels only — Y is excluded to block noise like "YYYY")
        let vowelWords = 0;
        for (const word of words) {
          if (/[aeiouAEIOU]/.test(word)) vowelWords++;
        }
        if ((vowelWords / words.length) < 0.5) return false;

        // Reject strings with extremely low Shannon entropy even with spaces
        // (e.g. "aa aa aa bb bb" = noise from periodic pixel patterns)
        const entropy = shannonEntropy(trimmed);
        if (entropy < 2.5) return false;

        return true;
      };

      // ── isReadableText: checks if a Buffer contains mostly human-readable UTF-8 ──
      const isReadableText = (buf: Uint8Array | Buffer, minLen: number = 8, skipHumanCheck: boolean = false): string | null => {
        if (buf.length < minLen) return null;
        try {
          const text = Buffer.from(buf).toString("utf8");

          // Reject if UTF-8 decoder produced replacement characters (invalid sequences)
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
            if (!skipHumanCheck && !isHumanText(text)) return null;
            return sanitise(text);
          }
        } catch { /* malformed UTF-8 — reject silently */ }
        return null;
      };

      // ═══════════════════════════════════════════════════════════════════════════
      //  PAYLOAD EXTRACTION STRATEGIES
      // ═══════════════════════════════════════════════════════════════════════════

      // ── STRATEGY 1: Devglan "Steg" magic-byte header ──
      // Header layout: [0x53 0x74 0x65 0x67] [4-byte flags] [4-byte BE length] [payload...]
      const findExactPayload = (hiddenBytes: Uint8Array): { text: string, length: number } | null => {
        if (hiddenBytes.length < 12) return null;
        if (hiddenBytes[0] !== 0x53 || hiddenBytes[1] !== 0x74 ||
            hiddenBytes[2] !== 0x65 || hiddenBytes[3] !== 0x67) return null;

        // Parse 4-byte Big-Endian length at offset 8
        const claimedLen = ((hiddenBytes[8] << 24) | (hiddenBytes[9] << 16) | (hiddenBytes[10] << 8) | hiddenBytes[11]) >>> 0;

        // Sanity: reject impossible lengths (0, > 32KB, or exceeding available data)
        if (claimedLen === 0 || claimedLen > 32768 || claimedLen + 12 > hiddenBytes.length) return null;

        const candidate = hiddenBytes.slice(12, 12 + claimedLen);
        const text = isReadableText(candidate, 1, true);
        if (text) return { text: text.trim(), length: claimedLen };

        return null;
      };

      // ── STRATEGY 2: Generic length-prefixed payloads ──
      const findLengthPrefixedPayload = (hiddenBytes: Uint8Array): { text: string, length: number } | null => {
        if (hiddenBytes.length < 4) return null;

        // Try Big-Endian then Little-Endian 32-bit length prefix
        const attempts = [
          ((hiddenBytes[0] << 24) | (hiddenBytes[1] << 16) | (hiddenBytes[2] << 8) | hiddenBytes[3]) >>> 0,
          ((hiddenBytes[3] << 24) | (hiddenBytes[2] << 16) | (hiddenBytes[1] << 8) | hiddenBytes[0]) >>> 0,
        ];

        for (const claimedLen of attempts) {
          if (claimedLen === 0 || claimedLen > 8192 || claimedLen + 4 > hiddenBytes.length) continue;

          const candidate = hiddenBytes.slice(4, 4 + claimedLen);
          const text = isReadableText(candidate, 5);
          if (!text) continue;

          // Anti-coincidence gate: reject if the "length" happens to equal a common
          // pixel value pattern (e.g. 0x00FFFFFF = 16777215 from white pixels).
          // Also verify the payload itself has reasonable entropy.
          const trimmed = text.trim();
          if (trimmed.length < 5) continue;
          const entropy = shannonEntropy(trimmed);
          if (entropy < 2.0) continue;

          return { text: trimmed, length: claimedLen };
        }
        return null;
      };

      // ── STRATEGY 3: Null-terminated string walkback ──
      const findNullTerminatedPayload = (hiddenBytes: Uint8Array): { text: string, length: number } | null => {
        const searchLimit = Math.min(hiddenBytes.length, 16384);

        for (let i = 0; i < searchLimit; i++) {
          if (hiddenBytes[i] !== 0) continue;

          const textBytes: number[] = [];
          for (let j = i - 1; j >= 0; j--) {
            const code = hiddenBytes[j];
            if ((code >= 32 && code <= 126) || code === 9 || code === 10 || code === 13) {
              textBytes.unshift(code);
            } else {
              break;
            }
          }

          if (textBytes.length < 8) continue;

          const text = Buffer.from(textBytes).toString("utf8");
          const trimmed = text.trim();
          if (trimmed.length < 8) continue;

          // Reject repetitive noise (e.g. "AAAAAAA...")
          if (/(.)(\1){4,}/.test(trimmed)) continue;

          const pureTextMatch = text.match(/[a-zA-Z0-9 \n\r]/g);
          const pureRatio = pureTextMatch ? pureTextMatch.length / text.length : 0;
          if (pureRatio < 0.90) continue;

          const letterCount = trimmed.match(/[a-zA-Z]/g)?.length || 0;
          const letterRatio = letterCount / trimmed.length;
          if (letterRatio < 0.7) continue;
          if (!isHumanText(trimmed)) continue;

          // Shannon entropy gate to catch borderline noise that passes vowel checks
          const entropy = shannonEntropy(trimmed);
          if (entropy < 2.5) continue;

          return { text: sanitise(trimmed), length: textBytes.length };
        }

        return null;
      };

      // ── STRATEGY 4: Regex fallback for raw (unframed) payloads ──
      const findRawPayload = (hiddenBytes: Uint8Array): { text: string, length: number } | null => {
        // Convert only the first 32KB to avoid regex DoS on megabyte strings
        const sliceLen = Math.min(hiddenBytes.length, 32768);
        const sample = Buffer.from(hiddenBytes.subarray(0, sliceLen)).toString("binary");
        const runs = sample.match(/[ -~\t\n\r]{8,}/g);

        if (!runs) return null;

        // Sort by length descending — longer runs are more likely to be real payloads
        for (const run of runs.sort((a, b) => b.length - a.length)) {
          if (/(.)(\1){4,}/.test(run)) continue;

          const trimmed = run.trim();
          if (trimmed.length < 10) continue;

          const pureTextMatch = run.match(/[a-zA-Z0-9 \n\r]/g);
          const pureRatio = pureTextMatch ? pureTextMatch.length / run.length : 0;

          const letterCount = trimmed.match(/[a-zA-Z]/g)?.length || 0;
          const letterRatio = letterCount / trimmed.length;

          if (pureRatio < 0.95 || !isHumanText(trimmed)) continue;

          // Shannon entropy gate
          const entropy = shannonEntropy(trimmed);

          if (trimmed.length < 20) {
            if (pureRatio === 1.0 && letterRatio >= 0.75 && entropy >= 3.0) {
              return { text: sanitise(trimmed), length: run.length };
            }
          } else {
            if (letterRatio >= 0.6 && entropy >= 3.0) {
              return { text: sanitise(trimmed), length: run.length };
            }
          }
        }

        return null;
      };

      // Combined heuristic (non-magic-byte) search across one stream
      const findPayload = (hiddenBytes: Uint8Array): { text: string, length: number } | null => {
        return findLengthPrefixedPayload(hiddenBytes)
            || findNullTerminatedPayload(hiddenBytes)
            || findRawPayload(hiddenBytes);
      };

      // ═══════════════════════════════════════════════════════════════════════════
      //  CASCADE: Check all 4 extraction streams in priority order
      // ═══════════════════════════════════════════════════════════════════════════

      let lsbMessage: string | null = null;
      let lsbMessageLength = 0;
      let hiddenBytesToUse: Uint8Array = allMSB;

      // Phase 1 — Magic-byte exact match (RGB-first for Devglan, then RGBA fallback)
      const exactStreams: [Uint8Array, string][] = [
        [rgbMSB,  "RGB_MSB"],
        [rgbLSB,  "RGB_LSB"],
        [allMSB,  "RGBA_MSB"],
        [allLSB,  "RGBA_LSB"],
      ];

      let payloadInfo: { text: string; length: number } | null = null;

      for (const [stream] of exactStreams) {
        payloadInfo = findExactPayload(stream);
        if (payloadInfo) { hiddenBytesToUse = stream; break; }
      }

      // Phase 2 — Heuristic fallback (same RGB-first priority)
      if (!payloadInfo) {
        for (const [stream] of exactStreams) {
          payloadInfo = findPayload(stream);
          if (payloadInfo) { hiddenBytesToUse = stream; break; }
        }
      }

      if (payloadInfo) {
        lsbMessage = payloadInfo.text;
        lsbMessageLength = payloadInfo.length;
      }

      // ═══════════════════════════════════════════════════════════════════════════
      //  RESULTS
      // ═══════════════════════════════════════════════════════════════════════════

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
        // ── LSB Bias Check ──
        // Sample ONLY RGB channels (skip Alpha) to avoid false positives.
        // Alpha is almost always 0xFF (LSB=1) or 0x00 (LSB=0), which would
        // heavily skew the ratio and trigger bogus "anomaly" alerts.
        let ones = 0;
        let rgbSampled = 0;
        const maxSample = Math.min(totalSubpixels, 100000);
        for (let i = 0; i < maxSample; i++) {
          const isAlpha = channels === 4 && (i % 4) === 3;
          if (isAlpha) continue;
          ones += rawPixels[i] & 1;
          rgbSampled++;
        }

        const ratio0 = rgbSampled > 0 ? (rgbSampled - ones) / rgbSampled : 0.5;
        const ratio1 = rgbSampled > 0 ? ones / rgbSampled : 0.5;

        // Classify the bias level:
        //   Extreme (>85% or <15%) → Synthetic/generated image (logos, screenshots,
        //     solid colors). All-even pixel values are normal here. NOT suspicious.
        //   Moderate (35-45% or 55-65%) → Could indicate non-encrypted LSB stego.
        //   Normal (45-55%) → Expected for natural photos and encrypted stego alike.
        const isExtremeBias = ratio0 < 0.15 || ratio0 > 0.85;
        const isModerateBias = !isExtremeBias && (ratio0 < 0.38 || ratio0 > 0.62);

        if (isModerateBias) {
          analyzer.riskScore += 10;
          analyzer.indicators.push({
            id: "lsb-bias",
            name: "LSB Bit Distribution Anomaly",
            status: "FAIL",
            riskImpact: 10,
            plainEnglish: `The pixel data shows an unusual pattern in its least significant bits (${(ratio1 * 100).toFixed(1)}% ones vs expected ~50%). This can indicate LSB steganography with an encrypted or compressed payload.`,
            technical: `LSB 0/1 ratio (RGB only): ${(ratio0 * 100).toFixed(2)}% / ${(ratio1 * 100).toFixed(2)}% over ${rgbSampled.toLocaleString()} RGB samples. Expected ≈50/50 for natural photographs.`,
            whyItMatters: "A moderately biased LSB distribution can be a statistical fingerprint of hidden data embedded in pixel channels.",
          });
        } else {
          analyzer.indicators.push({
            id: "no-lsb-stego",
            name: "No LSB Steganography Detected",
            status: "PASS",
            riskImpact: 0,
            plainEnglish: "No hidden text messages were found encoded into the pixel data using LSB steganography.",
            technical: `LSB extraction found no readable hidden text. LSB 0/1 ratio (RGB only): ${(ratio0 * 100).toFixed(2)}% / ${(ratio1 * 100).toFixed(2)}%${isExtremeBias ? " — consistent with a synthetic/generated image." : " (normal)."}`,
            whyItMatters: "LSB steganography is the most common method for hiding messages in images. A clean result here means no readable plaintext payload was embedded using this technique.",
          });
        }
      }
    } catch (lsbErr) {
      console.error("LSB analysis failed:", lsbErr);
      analyzer.indicators.push({
        id: "lsb-error",
        name: "LSB Analysis Error",
        status: "INFO",
        riskImpact: 0,
        plainEnglish: "The LSB steganography scan could not complete due to an internal error. This does not mean the image is safe — manual review is recommended.",
        technical: `Error: ${lsbErr instanceof Error ? lsbErr.message : String(lsbErr)}`,
        whyItMatters: "A failed scan leaves a blind spot. The image should be re-analysed or manually inspected.",
      });
    }
  }
}
