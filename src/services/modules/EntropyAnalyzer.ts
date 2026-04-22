import sharp from "sharp";
import { ImageAnalyzer } from "../ImageAnalyzer";

export class EntropyAnalyzer {
  /**
   * 4. PIXEL-LEVEL ENTROPY ANALYSIS
   * Calculates Shannon entropy to detect embedded encrypted data.
   * 
   * Edge Cases Handled:
   * - Downsamples the image to 256x256 to prevent memory overflow on huge images
   * - Identifies completely blank/test images via mathematically low entropy (< 1.0)
   * - Identifies encrypted noise blobs embedded as pixels via high entropy (> 7.95)
   * - Fails gracefully if the file is completely corrupt and Sharp cannot decode it
   */
  static async analyze(analyzer: ImageAnalyzer) {
    try {
      const image = sharp(analyzer.buffer);
      const meta = await image.metadata();
      const imageWidth = meta.width ?? 0;
      const imageHeight = meta.height ?? 0;
      analyzer.dimensions = `${imageWidth} × ${imageHeight}`;

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

      analyzer.pixelEntropy = `${entropy.toFixed(2)} bits/pixel`;

      if (entropy < 1.0) {
        analyzer.pixelEntropy += " (Very Low)";
        analyzer.indicators.push({
          id: "low-entropy",
          name: "Very Low Pixel Entropy",
          status: "INFO",
          riskImpact: 0,
          plainEnglish: "The image has almost no visual complexity. This is normal for simple graphics, solid backgrounds, or generated test images.",
          technical: `Shannon entropy: ${entropy.toFixed(4)} bits/pixel. Typical natural photos: 6-8 bits/pixel.`,
          whyItMatters: "A solid color or extremely simple image is not inherently suspicious. However, combined with other flags it can indicate an artificially constructed file.",
        });
      } else if (entropy > 7.95) {
        analyzer.riskScore += 15;
        analyzer.pixelEntropy += " (Abnormally High ⚠️)";
        analyzer.indicators.push({
          id: "high-entropy",
          name: "Abnormally High Pixel Entropy ⚠️",
          status: "FAIL",
          riskImpact: 15,
          plainEnglish: "The image pixel data is almost perfectly random — like white noise. This level of randomness in a normal photo is extremely rare and is a signature of encrypted data hidden inside the image.",
          technical: `Shannon entropy: ${entropy.toFixed(4)} bits/pixel. Encrypted/compressed data typically scores > 7.9.`,
          whyItMatters: "Encrypted data hidden inside an image (a technique called steganography) appears as random noise at the pixel level. This is used to secretly communicate or smuggle encrypted data.",
        });
      } else {
        analyzer.pixelEntropy += " (Normal)";
        analyzer.indicators.push({
          id: "normal-entropy",
          name: "Pixel Entropy Normal",
          status: "PASS",
          riskImpact: 0,
          plainEnglish: `The image has a healthy level of visual complexity (${entropy.toFixed(2)} bits/pixel), consistent with a real photograph or graphic.`,
          technical: `Shannon entropy: ${entropy.toFixed(4)} bits/pixel. Within normal range (1.0–7.9).`,
          whyItMatters: "Normal entropy means the pixel data does not show signs of hidden encrypted content.",
        });
      }
    } catch {
      analyzer.riskScore += 50;
      analyzer.indicators.push({
        id: "sharp-fail",
        name: "Image Cannot Be Rendered ❌",
        status: "FAIL",
        riskImpact: 50,
        plainEnglish: "ImageArmour was unable to decode this file as an image at all. Despite having an image extension, the file cannot be displayed. It is not a real image.",
        technical: "sharp() threw an exception during decode. File is structurally invalid.",
        whyItMatters: "A file that cannot be decoded as an image but pretends to be one is highly suspicious and potentially dangerous.",
      });
    }
  }
}
