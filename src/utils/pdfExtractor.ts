/**
 * Client-side PDF Extractor for HEALHEALTH
 * Extracts embedded JPEG images (e.g. scanned laboratory tests) and text streams from PDFs.
 */

export interface ParsedPdfResult {
  hasContent: boolean;
  isScannedImage: boolean;
  dataUrl: string;
  extractedText: string;
}

/**
 * Searches for embedded JPEG image streams inside a PDF Uint8Array.
 */
export function extractJpegFromPdfBytes(bytes: Uint8Array): string | null {
  const len = bytes.length;
  let searchPos = 0;

  while (searchPos < len - 4) {
    // Look for JPEG SOI: 0xFF, 0xD8, 0xFF
    if (bytes[searchPos] === 0xff && bytes[searchPos + 1] === 0xd8 && bytes[searchPos + 2] === 0xff) {
      const startIdx = searchPos;
      let endIdx = -1;

      // Find JPEG EOI: 0xFF, 0xD9
      for (let j = startIdx + 3; j < len - 1; j++) {
        if (bytes[j] === 0xff && bytes[j + 1] === 0xd9) {
          endIdx = j + 2;
          break;
        }
      }

      if (endIdx !== -1) {
        const jpegSize = endIdx - startIdx;
        // Document page scans are typically > 5KB
        if (jpegSize > 5000) {
          const slice = bytes.subarray(startIdx, endIdx);
          let binary = '';
          const chunkSize = 8192;
          for (let i = 0; i < slice.length; i += chunkSize) {
            binary += String.fromCharCode.apply(null, slice.subarray(i, i + chunkSize) as any);
          }
          const base64 = btoa(binary);
          return `data:image/jpeg;base64,${base64}`;
        }
        searchPos = endIdx;
        continue;
      }
    }
    searchPos++;
  }

  return null;
}

/**
 * Extracts clean, human-readable text from uncompressed BT ... ET blocks in a PDF string.
 */
export function extractTextFromPdfString(rawString: string): string {
  const pieces: string[] = [];
  const btRegex = /BT([\s\S]*?)ET/g;
  let match: RegExpExecArray | null;

  while ((match = btRegex.exec(rawString)) !== null) {
    const block = match[1];

    const tjRegex = /\(([\s\S]*?)\)\s*Tj/g;
    let tjMatch: RegExpExecArray | null;
    while ((tjMatch = tjRegex.exec(block)) !== null) {
      const str = tjMatch[1]
        .replace(/\\n/g, ' ')
        .replace(/\\r/g, ' ')
        .replace(/\\([()\\])/g, '$1')
        .trim();
      if (str.length >= 2 && !/^\/(Font|CID|Length|Type|Filter)/i.test(str)) {
        pieces.push(str);
      }
    }

    const arrRegex = /\[([\s\S]*?)\]\s*TJ/g;
    let arrMatch: RegExpExecArray | null;
    while ((arrMatch = arrRegex.exec(block)) !== null) {
      const inner = arrMatch[1];
      const strRegex = /\(([\s\S]*?)\)/g;
      let s: RegExpExecArray | null;
      while ((s = strRegex.exec(inner)) !== null) {
        const str = s[1]
          .replace(/\\n/g, ' ')
          .replace(/\\r/g, ' ')
          .replace(/\\([()\\])/g, '$1')
          .trim();
        if (str.length >= 2 && !/^\/(Font|CID|Length|Type|Filter)/i.test(str)) {
          pieces.push(str);
        }
      }
    }
  }

  return pieces.join(' ').replace(/\s+/g, ' ').trim();
}

/**
 * Inspects an uploaded PDF File and extracts either an embedded document image or readable text.
 */
export async function parsePdfFile(file: File): Promise<ParsedPdfResult> {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  // 1. Check for embedded scanned image (like mobile scans or diagnostic printouts)
  const jpegDataUrl = extractJpegFromPdfBytes(bytes);
  if (jpegDataUrl) {
    return {
      hasContent: true,
      isScannedImage: true,
      dataUrl: jpegDataUrl,
      extractedText: '',
    };
  }

  // 2. Check for human-readable text
  const latin1 = new TextDecoder('latin1').decode(bytes);
  const text = extractTextFromPdfString(latin1);

  // Convert full PDF to base64 fallback
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize) as any);
  }
  const defaultPdfDataUrl = `data:application/pdf;base64,${btoa(binary)}`;

  return {
    hasContent: text.length > 10,
    isScannedImage: false,
    dataUrl: defaultPdfDataUrl,
    extractedText: text,
  };
}
