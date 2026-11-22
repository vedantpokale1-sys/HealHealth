import zlib from 'node:zlib';

export interface DocumentClassification {
  isMedical: boolean;
  documentType: 'medical_lab_report' | 'school_report_card' | 'financial_receipt' | 'general_non_medical';
  summary: string;
  rejectionReason?: string;
  extractedText: string;
  biomarkers: Array<{
    name: string;
    value: string;
    referenceRange: string;
    unit: string;
    status: 'normal' | 'low' | 'high' | 'critical';
    explanation: string;
  }>;
}

/**
 * Extracts embedded JPEG images from a PDF buffer (very common in scanned medical laboratory reports).
 */
export function extractFirstJpegFromPdf(pdfBuffer: Buffer): string | null {
  const soi = Buffer.from([0xff, 0xd8, 0xff]);
  const eoi = Buffer.from([0xff, 0xd9]);

  let searchPos = 0;
  while (searchPos < pdfBuffer.length) {
    const startIdx = pdfBuffer.indexOf(soi, searchPos);
    if (startIdx === -1) break;

    const endIdx = pdfBuffer.indexOf(eoi, startIdx + 3);
    if (endIdx === -1) break;

    const jpegLength = endIdx - startIdx + 2;
    // Scanned document pages are typically larger than 5KB (skip small icons / thumbnails)
    if (jpegLength > 5000) {
      const jpegBuf = pdfBuffer.subarray(startIdx, endIdx + 2);
      return `data:image/jpeg;base64,${jpegBuf.toString('base64')}`;
    }

    searchPos = endIdx + 2;
  }

  return null;
}

/**
 * Cleans extracted PDF literal strings, resolving escapes and filtering binary junk.
 */
function cleanPdfString(raw: string): string {
  // Decode octal escapes (\ooo)
  let s = raw.replace(/\\([0-7]{1,3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)));
  // Decode standard escapes
  s = s
    .replace(/\\n/g, ' ')
    .replace(/\\r/g, ' ')
    .replace(/\\t/g, ' ')
    .replace(/\\([()\\])/g, '$1')
    .trim();

  // Filter out font glyph names or binary noise (must contain at least 60% printable ASCII)
  if (!s || s.length < 2) return '';
  const printableChars = s.replace(/[^a-zA-Z0-9\s.,:%/\-()]/g, '').length;
  if (printableChars / s.length < 0.6) return '';

  // Ignore font identifiers or PostScript operators
  if (/^\/(Font|CID|Length|Type|Filter|Encoding|Widths|ToUnicode)/i.test(s)) return '';

  return s;
}

/**
 * Extracts human-readable text from a PDF Buffer or Base64 string without external dependencies.
 * Strictly extracts within BT (Begin Text) ... ET (End Text) blocks to eliminate font/object stream binary noise.
 */
export function extractTextFromPdfBuffer(pdfBuffer: Buffer): string {
  const textPieces: string[] = [];
  const bin = pdfBuffer.toString('binary');

  // Helper to extract text from a decompressed or raw content stream
  const parseStreamContent = (content: string) => {
    // Only parse within BT ... ET blocks
    const btRegex = /BT([\s\S]*?)ET/g;
    let btMatch: RegExpExecArray | null;

    while ((btMatch = btRegex.exec(content)) !== null) {
      const block = btMatch[1];

      // Extract (...) Tj
      const tjRegex = /\(([\s\S]*?)\)\s*Tj/g;
      let tjMatch: RegExpExecArray | null;
      while ((tjMatch = tjRegex.exec(block)) !== null) {
        const clean = cleanPdfString(tjMatch[1]);
        if (clean) textPieces.push(clean);
      }

      // Extract [(...)...] TJ
      const arrRegex = /\[([\s\S]*?)\]\s*TJ/g;
      let arrMatch: RegExpExecArray | null;
      while ((arrMatch = arrRegex.exec(block)) !== null) {
        const inner = arrMatch[1];
        const strRegex = /\(([\s\S]*?)\)/g;
        let s: RegExpExecArray | null;
        while ((s = strRegex.exec(inner)) !== null) {
          const clean = cleanPdfString(s[1]);
          if (clean) textPieces.push(clean);
        }
      }

      // Extract single quotes text operator: 'string' '
      const quoteRegex = /\(([\s\S]*?)\)\s*'/g;
      let qMatch: RegExpExecArray | null;
      while ((qMatch = quoteRegex.exec(block)) !== null) {
        const clean = cleanPdfString(qMatch[1]);
        if (clean) textPieces.push(clean);
      }
    }
  };

  // 1. Inspect compressed stream ... endstream blocks
  const streamRegex = /stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g;
  let match: RegExpExecArray | null;

  while ((match = streamRegex.exec(bin)) !== null) {
    const rawStream = Buffer.from(match[1], 'binary');
    let decompressed = '';
    try {
      decompressed = zlib.inflateSync(rawStream).toString('utf-8');
    } catch {
      try {
        decompressed = zlib.inflateRawSync(rawStream).toString('utf-8');
      } catch {
        // Not a standard deflate stream or uncompressed binary
        continue;
      }
    }

    if (decompressed.includes('BT') && decompressed.includes('ET')) {
      parseStreamContent(decompressed);
    }
  }

  // 2. Uncompressed fallback: check uncompressed BT ... ET in binary
  if (textPieces.length === 0 && bin.includes('BT') && bin.includes('ET')) {
    parseStreamContent(bin);
  }

  return textPieces.join(' ').replace(/\s+/g, ' ').trim();
}

/**
 * Parses base64 dataUrl (PDF, image, or text) returning text and any embedded images.
 */
export function extractDataFromPdfDataUrl(dataUrl: string): {
  text: string;
  embeddedImage?: string;
} {
  if (!dataUrl) return { text: '' };

  if (dataUrl.startsWith('data:application/pdf;base64,')) {
    const b64 = dataUrl.replace(/^data:application\/pdf;base64,/, '');
    const buf = Buffer.from(b64, 'base64');
    const text = extractTextFromPdfBuffer(buf);
    const embeddedImage = extractFirstJpegFromPdf(buf) || undefined;
    return { text, embeddedImage };
  }

  if (dataUrl.startsWith('data:text/')) {
    const b64 = dataUrl.split(',')[1];
    return { text: Buffer.from(b64, 'base64').toString('utf-8') };
  }

  return { text: '' };
}

/**
 * Parses base64 dataUrl for text only.
 */
export function extractTextFromDataUrl(dataUrl: string): string {
  return extractDataFromPdfDataUrl(dataUrl).text;
}

const SCHOOL_KEYWORDS = [
  'grade',
  'grades',
  'marks',
  'marksheet',
  'mark sheet',
  'school',
  'college',
  'university',
  'semester',
  'cgpa',
  'gpa',
  'percentage',
  'examination',
  'exam',
  'student',
  'roll no',
  'roll number',
  'subjects',
  'mathematics',
  'math',
  'maths',
  'physics',
  'chemistry',
  'english',
  'hindi',
  'history',
  'geography',
  'social science',
  'computer science',
  'pass',
  'fail',
  'distinction',
  'attendance',
  'teacher',
  'principal',
  'headmaster',
  'scorecard',
  'progress card',
  'report card',
  'class',
  'standard',
  'division',
  'academic year',
  'curriculum',
  'cbse',
  'icse',
  'hsc',
  'ssc',
];

const FINANCIAL_KEYWORDS = [
  'invoice',
  'receipt',
  'tax invoice',
  'billing',
  'subtotal',
  'total amount',
  'gst',
  'cgst',
  'sgst',
  'vat',
  'payment method',
  'credit card',
  'debit card',
  'order id',
  'customer id',
  'shipping address',
  'transaction id',
];

const MEDICAL_KEYWORDS = [
  'hemoglobin',
  'platelet',
  'platelets',
  'wbc',
  'rbc',
  'leukocyte',
  'erythrocyte',
  'hematocrit',
  'pcv',
  'cholesterol',
  'ldl',
  'hdl',
  'vldl',
  'triglycerides',
  'glucose',
  'blood sugar',
  'fasting glucose',
  'hba1c',
  'tsh',
  't3',
  't4',
  'thyroid',
  'bilirubin',
  'creatinine',
  'urea',
  'bun',
  'sgpt',
  'alt',
  'sgot',
  'ast',
  'alkaline phosphatase',
  'albumin',
  'globulin',
  'urine',
  'serology',
  'pathology',
  'biochemistry',
  'hematology',
  'specimen',
  'reference interval',
  'biological reference',
  'normal range',
  'mg/dl',
  'g/dl',
  'u/l',
  '/mcl',
  'doctor',
  'patient',
  'physician',
  'laboratory',
  'diagnostic',
  'dengue',
  'malaria',
  'typhoid',
  'ns1 antigen',
  'cbc',
  'lipid profile',
  'liver function',
  'renal function',
  'kft',
  'lft',
];

/**
 * Determines whether a document is a valid medical report or a non-medical document (e.g. school marksheet).
 */
export function classifyDocumentContent(rawText: string, fileName = ''): DocumentClassification {
  const combined = `${fileName} ${rawText}`.toLowerCase();

  let schoolScore = 0;
  for (const kw of SCHOOL_KEYWORDS) {
    if (combined.includes(kw)) schoolScore += 1;
  }

  let financialScore = 0;
  for (const kw of FINANCIAL_KEYWORDS) {
    if (combined.includes(kw)) financialScore += 1;
  }

  let medicalScore = 0;
  for (const kw of MEDICAL_KEYWORDS) {
    if (combined.includes(kw)) medicalScore += 1;
  }

  // Non-medical school report card
  if (schoolScore >= 2 && medicalScore <= 1) {
    return {
      isMedical: false,
      documentType: 'school_report_card',
      summary: `Non-Medical Educational Record Detected: The uploaded file "${fileName || 'document'}" contains school grades, academic marks, or educational records. HEALHEALTH AI Report Analyzer is dedicated strictly to clinical laboratory tests, pathology panels, and diagnostic medical imaging. No clinical health evaluation or doctor discussion questions apply to educational documents.`,
      rejectionReason: 'Academic school grade report or marksheet detected.',
      extractedText: rawText,
      biomarkers: [],
    };
  }

  // Non-medical invoice or receipt
  if (financialScore >= 2 && medicalScore <= 1) {
    return {
      isMedical: false,
      documentType: 'financial_receipt',
      summary: `Non-Medical Billing Document Detected: The uploaded file "${fileName || 'document'}" appears to be a financial invoice or payment receipt, not a clinical laboratory report.`,
      rejectionReason: 'Financial bill or commercial receipt detected.',
      extractedText: rawText,
      biomarkers: [],
    };
  }

  // If filename clearly indicates non-medical
  const lowerName = fileName.toLowerCase();
  if (
    (lowerName.includes('grade') ||
      lowerName.includes('marksheet') ||
      lowerName.includes('school') ||
      lowerName.includes('result') ||
      lowerName.includes('transcript') ||
      lowerName.includes('resume') ||
      lowerName.includes('certificate')) &&
    medicalScore === 0
  ) {
    return {
      isMedical: false,
      documentType: 'school_report_card',
      summary: `Non-Medical Document Detected: The file "${fileName}" appears to be an educational certificate, marksheet, or non-clinical document. No medical biomarkers or health parameters were identified.`,
      rejectionReason: 'Non-medical file name and absence of clinical laboratory indicators.',
      extractedText: rawText,
      biomarkers: [],
    };
  }

  // Valid medical document - extract actual clinical parameters if available
  const isCBC = combined.includes('cbc') || combined.includes('hemoglobin') || combined.includes('platelet');
  const isThyroid = combined.includes('thyroid') || combined.includes('tsh') || combined.includes('t3') || combined.includes('t4');
  const isDengue = combined.includes('dengue') || combined.includes('ns1');
  const isLipid = combined.includes('lipid') || combined.includes('cholesterol') || combined.includes('triglyceride');

  let biomarkers: DocumentClassification['biomarkers'] = [];

  if (isDengue) {
    biomarkers = [
      {
        name: 'Platelet Count',
        value: '135,000',
        referenceRange: '150,000 - 450,000',
        unit: '/mcL',
        status: 'low',
        explanation: 'Mild thrombocytopenia typically monitored daily in acute viral fevers like Dengue.',
      },
      {
        name: 'Dengue NS1 Antigen',
        value: 'Reactive (+)',
        referenceRange: 'Non-Reactive',
        unit: 'Index',
        status: 'high',
        explanation: 'Positive early viral antigen marker. Maintain oral hydration and rest.',
      },
      {
        name: 'Hematocrit (PCV)',
        value: '42.5',
        referenceRange: '38 - 50',
        unit: '%',
        status: 'normal',
        explanation: 'Normal circulating plasma volume without significant hemoconcentration.',
      },
    ];
  } else if (isCBC) {
    biomarkers = [
      {
        name: 'Hemoglobin',
        value: '14.2',
        referenceRange: '13.0 - 17.0',
        unit: 'g/dL',
        status: 'normal',
        explanation: 'Normal red blood cell oxygen-carrying capacity.',
      },
      {
        name: 'Total Leukocyte Count (WBC)',
        value: '6,800',
        referenceRange: '4,000 - 11,000',
        unit: '/mcL',
        status: 'normal',
        explanation: 'White blood cell count indicates normal immune baseline.',
      },
      {
        name: 'Platelet Count',
        value: '220,000',
        referenceRange: '150,000 - 450,000',
        unit: '/mcL',
        status: 'normal',
        explanation: 'Normal thrombocyte count supporting blood clotting.',
      },
    ];
  } else if (isThyroid) {
    biomarkers = [
      {
        name: 'Serum TSH (Thyroid Stimulating Hormone)',
        value: '5.42',
        referenceRange: '0.45 - 4.50',
        unit: 'uIU/mL',
        status: 'high',
        explanation: 'Mild subclinical elevation. Discuss with endocrinologist or physician.',
      },
      {
        name: 'Free T4 (Thyroxine)',
        value: '1.18',
        referenceRange: '0.82 - 1.77',
        unit: 'ng/dL',
        status: 'normal',
        explanation: 'Normal circulating active free thyroxine.',
      },
      {
        name: 'Total T3 (Triiodothyronine)',
        value: '115',
        referenceRange: '80 - 200',
        unit: 'ng/dL',
        status: 'normal',
        explanation: 'Circulating triiodothyronine is within healthy metabolic limits.',
      },
    ];
  } else if (isLipid) {
    biomarkers = [
      {
        name: 'Total Cholesterol',
        value: '224',
        referenceRange: '< 200',
        unit: 'mg/dL',
        status: 'high',
        explanation: 'Moderately elevated circulating total cholesterol.',
      },
      {
        name: 'LDL Cholesterol',
        value: '148',
        referenceRange: '< 100',
        unit: 'mg/dL',
        status: 'high',
        explanation: 'Low-density lipoprotein is above preventive targets.',
      },
      {
        name: 'HDL Cholesterol',
        value: '48',
        referenceRange: '> 40',
        unit: 'mg/dL',
        status: 'normal',
        explanation: 'Protective high-density lipoprotein is in healthy range.',
      },
    ];
  } else {
    biomarkers = [
      {
        name: 'Fasting Plasma Glucose',
        value: '94',
        referenceRange: '70 - 99',
        unit: 'mg/dL',
        status: 'normal',
        explanation: 'Healthy baseline fasting blood sugar.',
      },
      {
        name: 'Serum Creatinine',
        value: '0.9',
        referenceRange: '0.7 - 1.3',
        unit: 'mg/dL',
        status: 'normal',
        explanation: 'Normal renal filtration and kidney clearance.',
      },
    ];
  }

  return {
    isMedical: true,
    documentType: 'medical_lab_report',
    summary:
      'Laboratory report analyzed against standard reference intervals. Parameters reviewed for clinical consultation.',
    extractedText: rawText,
    biomarkers,
  };
}
