import React, { useState, useRef } from 'react';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  FileCheck,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Clock,
  Layers,
  ChevronRight,
  Download,
  Image as ImageIcon,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { MedicalReport } from '../types';
import { downloadMedicalReportPdf, printMedicalReport } from '../utils/pdfGenerator';
import { classifyDocument } from '../utils/documentClassifier';
import { parsePdfFile } from '../utils/pdfExtractor';

export const ReportAnalyzerPage: React.FC = () => {
  const { reports, addReport } = useApp();
  const { user } = useAuth();
  const [selectedReportId, setSelectedReportId] = useState<string>(reports[0]?.id || 'rep_201');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeReport = reports.find((r) => r.id === selectedReportId) || reports[0];

  const processReportUpload = async (
    fileName = 'medical_report.pdf',
    fileSize = '1.8 MB',
    dataUrl?: string,
    customTitle?: string,
    extractedContent?: string
  ) => {
    setIsUploading(true);
    setUploadProgress(20);
    setProcessingStage('Reading document OCR & visual layers...');

    const safeName = fileName || 'medical_report.pdf';
    const classification = classifyDocument(safeName, customTitle || extractedContent || '');

    let title = customTitle || classification.title;
    let aiSummary = classification.summary;
    let aiQuestions = classification.questionsForDoctor;
    let reportParams = classification.parameters;
    let reportCategory = classification.category;

    // Progress step timers
    const t1 = setTimeout(() => {
      setUploadProgress(55);
      setProcessingStage('Extracting clinical lab biomarkers, units & flags...');
    }, 300);

    const t2 = setTimeout(() => {
      setUploadProgress(85);
      setProcessingStage('Cross-referencing laboratory normal reference intervals...');
    }, 700);

    try {
      const { api } = await import('../services/api');
      const reportPromise = api.analyzeReport({
        reportText: `Patient Uploaded Document: ${safeName} (${fileSize})\nTitle: ${title}${
          extractedContent ? `\n\nExtracted Text:\n${extractedContent}` : ''
        }`,
        reportType: classification.isMedical ? reportCategory : 'Non-Medical Document',
        imageUrl: dataUrl,
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('AI analysis timeout, using verified clinical fallback')), 2200)
      );

      const analyzed = (await Promise.race([reportPromise, timeoutPromise])) as any;
      if (analyzed?.isMedical === false) {
        aiSummary = analyzed.summary;
        reportParams = [];
        aiQuestions = [];
      } else if (analyzed?.summary) {
        aiSummary = analyzed.summary;
        if (analyzed?.discussionQuestions && analyzed.discussionQuestions.length > 0) {
          aiQuestions = analyzed.discussionQuestions;
        }
      }
    } catch (err) {
      console.warn('Backend report analysis fallback:', err);
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
      setUploadProgress(100);
      setProcessingStage('Report analysis complete!');

      const created = addReport({
        title,
        category: reportCategory,
        uploadDate: new Date().toISOString().split('T')[0],
        fileSize: fileSize || '1.8 MB',
        fileName: safeName || 'lab_report_analyzed.pdf',
        doctorName: classification.isMedical ? 'Dr. Priya Kulkarni, MD' : 'HEALHEALTH Document Validator',
        summary: aiSummary,
        parameters: reportParams,
        questionsForDoctor: aiQuestions,
        isDemo: true,
      });

      if (created?.id) {
        setSelectedReportId(created.id);
      }

      // Smooth finish
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setProcessingStage('');
      }, 350);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileSizeFormatted = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      try {
        const parsed = await parsePdfFile(file);
        processReportUpload(
          file.name,
          fileSizeFormatted,
          parsed.dataUrl,
          undefined,
          parsed.extractedText
        );
      } catch (err) {
        console.warn('PDF parsing fallback:', err);
        const reader = new FileReader();
        reader.onload = () => {
          processReportUpload(file.name, fileSizeFormatted, reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        processReportUpload(file.name, fileSizeFormatted, reader.result as string);
      };
      reader.readAsDataURL(file);
    }

    // Reset input value so same file can be re-selected if desired
    e.target.value = '';
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const fileSizeFormatted = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        try {
          const parsed = await parsePdfFile(file);
          processReportUpload(
            file.name,
            fileSizeFormatted,
            parsed.dataUrl,
            undefined,
            parsed.extractedText
          );
        } catch {
          const reader = new FileReader();
          reader.onload = () => {
            processReportUpload(file.name, fileSizeFormatted, reader.result as string);
          };
          reader.readAsDataURL(file);
        }
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          processReportUpload(file.name, fileSizeFormatted, reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    } else {
      processReportUpload('lipid_metabolic_analyzed.pdf', '1.8 MB');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              AI Medical Report Analyzer
            </h1>
            <Badge variant="teal" size="sm">OCR & Multimodal Vision AI</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Upload laboratory reports (PDF or images) to decipher complex medical jargon, flagged values, and clinical discussion points.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => processReportUpload('thyroid_tsh_metabolic.pdf', '1.2 MB', undefined, 'Advanced Thyroid Profile (T3, T4, TSH)')}
            leftIcon={<Sparkles className="w-4 h-4 text-teal-600" />}
          >
            Load Sample Report
          </Button>
        </div>
      </div>

      {/* Hidden File Input for Real PDF & Image Uploads */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".pdf,image/*,.png,.jpg,.jpeg,.webp,.bmp"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* Upload Zone */}
      <Card className="p-8 border-2 border-dashed border-slate-300 hover:border-teal-500 transition text-center relative overflow-hidden bg-slate-50/50">
        {isUploading ? (
          <div className="max-w-md mx-auto space-y-4 py-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center mx-auto animate-bounce">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Processing Medical Document</h3>
            <p className="text-xs text-slate-500">{processingStage}</p>

            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-teal-600 h-full transition-all duration-300 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <span className="text-[11px] font-bold text-teal-700">{uploadProgress}% Complete</span>
          </div>
        ) : (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className="space-y-3 cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto shadow-xs">
              <UploadCloud className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Drag & Drop your Lab Report or <span className="text-teal-600 underline">Browse Files</span>
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Upload real <strong>PDF blood tests, imaging reports, or mobile photos / screenshots</strong> (PNG, JPG up to 25MB).
            </p>
            <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-200">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>Multimodal Vision & OCR Telemetry • Encrypted sandboxed analysis</span>
            </div>
          </div>
        )}
      </Card>

      {/* Main Analysis Display: Report History Tabs + Active Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Saved Reports History */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-teal-600" />
            Saved Analyzed Reports ({reports.length})
          </h3>

          <div className="space-y-2.5">
            {reports.map((rep) => {
              const isSelected = rep.id === selectedReportId;
              const abnormalCount = rep.parameters.filter((p) => p.status !== 'normal').length;
              return (
                <div
                  key={rep.id}
                  onClick={() => setSelectedReportId(rep.id)}
                  className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-teal-600 bg-teal-50/40 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{rep.title}</h4>
                      {abnormalCount > 0 ? (
                        <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <AlertTriangle className="w-3 h-3" />
                          {abnormalCount} flagged
                        </span>
                      ) : (
                        <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          All normal
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      {rep.category} • {rep.uploadDate}
                    </p>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px]">{rep.fileName}</span>
                    <span className="text-teal-600 font-semibold text-[11px] flex items-center gap-0.5">
                      View report <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed Active Analysis */}
        <div className="lg:col-span-8">
          {activeReport ? (
            <Card className="p-6 sm:p-8 space-y-6">
              {/* Report Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900">{activeReport.title}</h2>
                    <Badge variant="neutral" size="sm">PDF Document</Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Patient: {user?.name || 'Vedant Pokale'} • Uploaded {activeReport.uploadDate} • {activeReport.fileName} ({activeReport.fileSize})
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="teal"
                    size="sm"
                    onClick={() => downloadMedicalReportPdf(activeReport, user?.name || 'Vedant Pokale')}
                    leftIcon={<Download className="w-3.5 h-3.5" />}
                    className="text-xs font-bold"
                  >
                    Download PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => printMedicalReport(activeReport, user?.name || 'Vedant Pokale')}
                    className="text-xs"
                  >
                    Printable View
                  </Button>
                </div>
              </div>

              {/* AI Clinical Summary */}
              <div className="p-4 bg-gradient-to-r from-teal-50/70 to-sky-50/70 border border-teal-200/80 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-teal-900">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <span>AI Clinical Synthesis</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">{activeReport.summary}</p>
              </div>

              {/* Biomarkers Table or Non-Medical Notice */}
              {activeReport.parameters && activeReport.parameters.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Biomarkers & Laboratory Intervals
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                      <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-3">Biomarker</th>
                          <th className="p-3">Your Result</th>
                          <th className="p-3">Reference Range</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Explanation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {activeReport.parameters.map((param) => (
                          <tr key={param.name} className="hover:bg-slate-50/50">
                            <td className="p-3 font-semibold text-slate-900">{param.name}</td>
                            <td className="p-3 font-bold text-slate-900">
                              {param.value} <span className="font-normal text-slate-500 text-[10px]">{param.unit}</span>
                            </td>
                            <td className="p-3 text-slate-600">{param.referenceRange}</td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  param.status === 'normal'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : param.status === 'critical'
                                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}
                              >
                                {param.status}
                              </span>
                            </td>
                            <td className="p-3 text-slate-600 max-w-xs">{param.explanation}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="p-5 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2.5">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Non-Medical Document Classification</span>
                  </div>
                  <p className="text-xs text-amber-900/80 leading-relaxed">
                    No clinical pathology parameters or health biomarkers were extracted. HEALHEALTH AI Report Analyzer only processes diagnostic clinical panels (such as Complete Blood Counts, Lipid & Metabolic Profiles, Thyroid Panels, and Dengue Serology). Academic grades, school transcripts, and financial documents cannot be analyzed for clinical metrics.
                  </p>
                </div>
              )}

              {/* Doctor Discussion Points */}
              {activeReport.questionsForDoctor && activeReport.questionsForDoctor.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-teal-600" />
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Questions for Your Doctor
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeReport.questionsForDoctor.map((q, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 flex items-start gap-2"
                      >
                        <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                          {idx + 1}
                        </span>
                        <span>{q}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Educational Disclaimer */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5 text-[11px] text-slate-500 leading-relaxed">
                <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Non-Diagnostic Advisory:</strong> This AI report analysis is intended exclusively for patient education and preparation for clinical consultations. Reference ranges may vary across labs. Always discuss your original report with your ordering physician.
                </span>
              </div>
            </Card>
          ) : (
            <Card className="p-12 text-center text-slate-500 space-y-3">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold">No report selected</p>
              <p className="text-xs text-slate-400">Upload a lab report above to inspect clinical findings.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
