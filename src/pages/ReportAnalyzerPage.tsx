import React, { useState } from 'react';
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
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { MedicalReport } from '../types';

export const ReportAnalyzerPage: React.FC = () => {
  const { reports, addReport } = useApp();
  const [selectedReportId, setSelectedReportId] = useState<string>(reports[0]?.id || 'rep_201');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const activeReport = reports.find((r) => r.id === selectedReportId) || reports[0];

  const handleSimulatedUpload = (customTitle?: string) => {
    setIsUploading(true);
    setUploadProgress(15);
    setProcessingStage('Reading document OCR layers...');

    setTimeout(() => {
      setUploadProgress(45);
      setProcessingStage('Extracting clinical lab biomarkers & units...');
    }, 400);

    setTimeout(() => {
      setUploadProgress(78);
      setProcessingStage('Cross-referencing laboratory normal intervals...');
    }, 800);

    setTimeout(() => {
      setUploadProgress(100);
      setProcessingStage('Generating plain-language explanation & doctor questions...');
    }, 1200);

    setTimeout(async () => {
      const newTitle = customTitle || 'Comprehensive Metabolic & Lipid Panel';
      let aiSummary = 'Hepatic and lipid metrics show mild elevation suggestive of metabolic strain, while renal function biomarkers remain within normal reference limits.';
      let aiQuestions = [
        'Could this mild ALT rise be linked to current cholesterol medications?',
        'Is an ultrasound abdomen indicated to check for hepatic steatosis?',
      ];

      try {
        const { api } = await import('../services/api');
        const analyzed = await api.analyzeReport({
          reportText: `${newTitle}: Total Cholesterol 220 mg/dL (Ref < 200), LDL 148 mg/dL (Ref < 100), ALT/SGPT 58 U/L (Ref < 45). Fasting blood glucose 104 mg/dL.`,
          reportType: 'Pathology / Biochemistry',
        });
        if (analyzed?.summary) {
          aiSummary = analyzed.summary;
        }
        if (analyzed?.discussionQuestions && analyzed.discussionQuestions.length > 0) {
          aiQuestions = analyzed.discussionQuestions;
        }
      } catch (err) {
        console.warn('Backend report analysis fallback:', err);
      }

      addReport({
        title: newTitle,
        category: 'Pathology',
        uploadDate: new Date().toISOString().split('T')[0],
        fileSize: '1.8 MB',
        fileName: 'lipid_metabolic_analyzed.pdf',
        doctorName: 'Dr. Priya Kulkarni',
        summary: aiSummary,
        parameters: [
          {
            name: 'SGPT / ALT',
            value: '58',
            referenceRange: '7 - 45',
            unit: 'U/L',
            status: 'high',
            explanation: 'Alanine aminotransferase is mildly elevated; often associated with metabolic hepatic stress or vigorous exercise.',
          },
          {
            name: 'LDL Cholesterol',
            value: '148',
            referenceRange: '0 - 100',
            unit: 'mg/dL',
            status: 'high',
            explanation: 'Low-density lipoprotein is moderately elevated above primary preventive targets.',
          },
          {
            name: 'Total Bilirubin',
            value: '0.9',
            referenceRange: '0.2 - 1.2',
            unit: 'mg/dL',
            status: 'normal',
            explanation: 'Normal hepatic clearance of red blood cell breakdown products.',
          },
        ],
        questionsForDoctor: aiQuestions,
        isDemo: true,
      });

      setIsUploading(false);
      setUploadProgress(0);
      setProcessingStage('');
    }, 1600);
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
            <Badge variant="teal" size="sm">OCR & Triage AI</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Upload laboratory reports to decipher complex medical jargon, flagged values, and clinical discussion points.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSimulatedUpload('Advanced Thyroid Profile (T3, T4, TSH)')}
            leftIcon={<Sparkles className="w-4 h-4 text-teal-600" />}
          >
            Load Sample Report
          </Button>
        </div>
      </div>

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
            onDrop={(e) => { e.preventDefault(); setDragActive(false); handleSimulatedUpload(); }}
            className="space-y-3 cursor-pointer"
            onClick={() => handleSimulatedUpload()}
          >
            <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto shadow-xs">
              <UploadCloud className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Drag & Drop your Lab Report or <span className="text-teal-600 underline">Browse Files</span>
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Supports PDF, PNG, JPEG blood tests, metabolic panels, and imaging summaries (up to 25MB).
            </p>
            <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-200">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>Simulated Sandboxed Processing • Non-diagnostic education only</span>
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
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{rep.title}</h4>
                    <Badge variant={abnormalCount > 0 ? 'high' : 'normal'} size="sm">
                      {abnormalCount > 0 ? `${abnormalCount} flagged` : 'Normal'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                    <span>{rep.category}</span>
                    <span>{rep.uploadDate}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Report AI Breakdown */}
        <div className="lg:col-span-8 space-y-6">
          {activeReport && (
            <Card className="p-6 sm:p-8 space-y-6">
              {/* Report Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900">{activeReport.title}</h2>
                    <Badge variant="neutral" size="sm">PDF Document</Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Uploaded on {activeReport.uploadDate} • File: {activeReport.fileName} ({activeReport.fileSize})
                  </p>
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

              {/* Biomarkers Table */}
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
                          <td className="p-3 text-slate-600">{param.referenceRange} {param.unit}</td>
                          <td className="p-3">
                            <Badge variant={param.status} size="sm">
                              {param.status.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="p-3 text-slate-600 leading-snug max-w-xs">{param.explanation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Questions for Doctor */}
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <HelpCircle className="w-4 h-4 text-sky-600" />
                  <span>Recommended Questions for Your Healthcare Provider</span>
                </div>
                <ul className="space-y-2">
                  {activeReport.questionsForDoctor.map((q, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <span className="font-bold text-teal-600 shrink-0">{idx + 1}.</span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Safety Footnote */}
              <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-3">
                <strong>Disclaimer:</strong> Laboratory reference intervals vary depending on testing methodology, gender, and age. Never adjust medication dosages or begin supplements without direct consultation from a licensed medical practitioner.
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
