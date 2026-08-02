/**
 * Open-source PDF compression for document uploads.
 *
 * Strategy (best of both, pick smaller result):
 * 1. Structural pass via pdf-lib (object streams + strip metadata) — keeps text selectable
 * 2. Image pass via unpdf (Mozilla PDF.js) + sharp — recompresses embedded page images
 *    into a rebuilt JPEG-page PDF (great for scanned IDs / leases)
 *
 * Libraries: pdf-lib (MIT), unpdf/PDF.js (Apache-2.0), sharp (Apache-2.0)
 */

import { PDFDocument } from "pdf-lib";
import sharp from "sharp";
import { extractImages, getDocumentProxy } from "unpdf";

const MAX_IMAGE_EDGE = 1600;
const JPEG_QUALITY = 72;
const MAX_PAGES_FOR_IMAGE_REBUILD = 40;

async function structuralCompress(input: Buffer): Promise<Buffer> {
  const pdfDoc = await PDFDocument.load(input, {
    ignoreEncryption: true,
    updateMetadata: false,
  });

  pdfDoc.setTitle("");
  pdfDoc.setAuthor("");
  pdfDoc.setSubject("");
  pdfDoc.setKeywords([]);
  pdfDoc.setProducer("RentAwas");
  pdfDoc.setCreator("RentAwas");

  const saved = await pdfDoc.save({
    useObjectStreams: true,
    addDefaultPage: false,
  });

  return Buffer.from(saved);
}

/**
 * Rebuild PDF from the largest embedded image on each page (typical scanned docs).
 * Returns null when a page has no extractable images (text-heavy / vector PDF).
 */
async function rebuildFromEmbeddedImages(input: Buffer): Promise<Buffer | null> {
  const pdf = await getDocumentProxy(new Uint8Array(input), {
    maxImageSize: 16_777_216,
  });

  if (pdf.numPages < 1 || pdf.numPages > MAX_PAGES_FOR_IMAGE_REBUILD) {
    return null;
  }

  const outDoc = await PDFDocument.create();

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const images = await extractImages(pdf, pageNum);
    if (!images.length) return null;

    const largest = images.reduce((a, b) =>
      a.width * a.height >= b.width * b.height ? a : b
    );

    const jpeg = await sharp(Buffer.from(largest.data), {
      raw: {
        width: largest.width,
        height: largest.height,
        channels: largest.channels,
      },
    })
      .rotate()
      .resize({
        width: MAX_IMAGE_EDGE,
        height: MAX_IMAGE_EDGE,
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
      .toBuffer();

    const embedded = await outDoc.embedJpg(jpeg);
    const page = outDoc.addPage([embedded.width, embedded.height]);
    page.drawImage(embedded, {
      x: 0,
      y: 0,
      width: embedded.width,
      height: embedded.height,
    });
  }

  const saved = await outDoc.save({
    useObjectStreams: true,
    addDefaultPage: false,
  });

  return Buffer.from(saved);
}

/**
 * Compress a PDF buffer. Always returns a valid PDF; never enlarges past the original
 * (falls back to the input if compression would increase size).
 */
export async function compressPdfBuffer(input: Buffer): Promise<{
  buffer: Buffer;
  method: "structural" | "images" | "unchanged";
  originalBytes: number;
  compressedBytes: number;
  compressionPct: number;
}> {
  const originalBytes = input.length;
  let best = input;
  let method: "structural" | "images" | "unchanged" = "unchanged";

  try {
    const structural = await structuralCompress(input);
    if (structural.length < best.length) {
      best = structural;
      method = "structural";
    }
  } catch (err) {
    console.warn("PDF structural compress failed:", err);
  }

  try {
    const rebuilt = await rebuildFromEmbeddedImages(input);
    if (rebuilt && rebuilt.length < best.length) {
      best = rebuilt;
      method = "images";
    }
  } catch (err) {
    console.warn("PDF image rebuild compress failed:", err);
  }

  const compressedBytes = best.length;
  const compressionPct =
    originalBytes > 0
      ? Math.max(0, Math.round(((originalBytes - compressedBytes) / originalBytes) * 100))
      : 0;

  return {
    buffer: best,
    method,
    originalBytes,
    compressedBytes,
    compressionPct,
  };
}
