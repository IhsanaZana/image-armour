import exifParser from "exif-parser";
import { ImageAnalyzer } from "../ImageAnalyzer";

export class ExifAnalyzer {
  /**
   * 3. EXIF METADATA INSPECTION
   * Parses the EXIF tags to identify location data or professional editing.
   * 
   * Edge Cases Handled:
   * - Only runs on JPEG/JPG files (PNGs handle metadata differently)
   * - Gracefully handles completely missing EXIF segments (e.g. social media strips)
   * - Catches corrupt metadata segments indicating manual hex editing
   * - Flags highly sensitive data like GPS coordinates and professional editing suites
   */
  static analyze(analyzer: ImageAnalyzer) {
    if (analyzer.mimeFromHeader.includes("jpeg") || analyzer.extFromHeader === "jpg") {
      try {
        const parser = exifParser.create(analyzer.buffer);
        const result = parser.parse();
        const tags = result?.tags ?? {};
        const tagCount = Object.keys(tags).length;

        if (tagCount > 0) {
          if (tags.Make) analyzer.exifDetails["Camera Brand"] = tags.Make;
          if (tags.Model) analyzer.exifDetails["Camera Model"] = tags.Model;
          if (tags.Software) analyzer.exifDetails["Editing Software"] = tags.Software;
          if (tags.DateTimeOriginal) analyzer.exifDetails["Date Taken"] = new Date(tags.DateTimeOriginal * 1000).toLocaleString();
          if (tags.GPSLatitude) analyzer.exifDetails["GPS Latitude"] = tags.GPSLatitude.toFixed(6) + "°";
          if (tags.GPSLongitude) analyzer.exifDetails["GPS Longitude"] = tags.GPSLongitude.toFixed(6) + "°";
          if (tags.ExposureTime) analyzer.exifDetails["Shutter Speed"] = `1/${Math.round(1 / tags.ExposureTime)}s`;
          if (tags.FNumber) analyzer.exifDetails["Aperture"] = `f/${tags.FNumber}`;
          if (tags.ISOSpeedRatings) analyzer.exifDetails["ISO"] = String(tags.ISOSpeedRatings);
          if (tags.Flash) analyzer.exifDetails["Flash"] = tags.Flash ? "Fired" : "Did not fire";
          if (tags.PixelXDimension) analyzer.exifDetails["Stored Width"] = `${tags.PixelXDimension}px`;
          if (tags.PixelYDimension) analyzer.exifDetails["Stored Height"] = `${tags.PixelYDimension}px`;

          analyzer.riskScore += 5;
          analyzer.indicators.push({
            id: "metadata-present",
            name: "EXIF Metadata Detected",
            status: "INFO",
            riskImpact: 5,
            plainEnglish: `This image contains ${tagCount} hidden metadata fields. This includes information about the device that created it, timestamps, and possibly its GPS location.`,
            technical: `${tagCount} EXIF tags found. Keys: ${Object.keys(tags).slice(0, 8).join(", ")}...`,
            whyItMatters: "EXIF metadata can expose private information — like where a photo was taken (GPS coordinates) or what device was used. Many people share images without realising this data is embedded.",
          });

          if (tags.GPSLatitude && tags.GPSLongitude) {
            analyzer.riskScore += 10;
            analyzer.indicators.push({
              id: "gps-location",
              name: "GPS Location Embedded in Image ⚠️",
              status: "FAIL",
              riskImpact: 10,
              plainEnglish: `This image contains the exact GPS coordinates of where it was taken: ${tags.GPSLatitude.toFixed(4)}°, ${tags.GPSLongitude.toFixed(4)}°. Anyone who receives this image can pinpoint your location.`,
              technical: `EXIF GPS: Lat ${tags.GPSLatitude}, Lng ${tags.GPSLongitude}`,
              whyItMatters: "Sharing images with GPS data can reveal your home address, workplace, or regular locations. This is a serious privacy risk used in stalking and targeted attacks.",
            });
          }

          if (tags.Software) {
            const suspiciousSoftware = ["photoshop", "gimp", "lightroom", "canva", "paint.net", "affinity"];
            const isSuspicious = suspiciousSoftware.some((sw) => tags.Software.toLowerCase().includes(sw));
            if (isSuspicious) {
              analyzer.riskScore += 20;
              analyzer.indicators.push({
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
          analyzer.indicators.push({
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
        analyzer.riskScore += 10;
        analyzer.indicators.push({
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
  }
}
