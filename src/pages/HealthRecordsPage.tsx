import React, { useState } from 'react';
import {
  FolderHeart,
  FileText,
  Search,
  Upload,
  Download,
  Eye,
  Lock,
  ShieldCheck,
  Plus,
  Filter,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { MedicalReport } from '../types';

export const HealthRecordsPage: React.FC = () => {
  const { reports } = useApp();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewingDoc, setViewingDoc] = useState<MedicalReport | null>(null);

  const categories = ['All', 'Blood Test', 'Radiology', 'Pathology', 'Prescription'];

  const filteredRecords = reports.filter((r) => {
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || r.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Personal Health Records Vault
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Centrally organize diagnostic documents, pathology transcripts, and allergy alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="teal">Encrypted Demo Vault</Badge>
        </div>
      </div>

      {/* Patient Health Summary Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-teal-50/60 border-teal-200 text-xs space-y-1">
          <span className="font-bold text-teal-900">Known Allergies ({user?.allergies.length || 0})</span>
          <p className="text-teal-800 font-semibold">{user?.allergies.join(', ') || 'None reported'}</p>
        </Card>
        <Card className="p-4 bg-sky-50/60 border-sky-200 text-xs space-y-1">
          <span className="font-bold text-sky-900">Chronic Conditions ({user?.chronicConditions.length || 0})</span>
          <p className="text-sky-800 font-semibold">{user?.chronicConditions.join(', ') || 'None noted'}</p>
        </Card>
        <Card className="p-4 bg-purple-50/60 border-purple-200 text-xs space-y-1">
          <span className="font-bold text-purple-900">Emergency ID Link</span>
          <p className="text-purple-800 font-semibold">
            {user?.emergencyContact.name} ({user?.emergencyContact.phone})
          </p>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search records by keyword, doctor, or test type..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setSelectedCategory(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === c
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </Card>

      {/* Records Table / List */}
      <Card className="overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900">Diagnostic Reports & Clinical Documents</h3>
          <span className="text-xs text-slate-500">{filteredRecords.length} records available</span>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredRecords.map((doc) => (
            <div
              key={doc.id}
              className="p-4 hover:bg-slate-50/60 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{doc.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <Badge variant="neutral" size="sm">{doc.category}</Badge>
                    <span>Uploaded {doc.uploadDate}</span>
                    <span>• {doc.fileSize}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewingDoc(doc)}
                  leftIcon={<Eye className="w-3.5 h-3.5 text-slate-500" />}
                  className="text-xs"
                >
                  Preview
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => alert(`Simulated secure download of ${doc.fileName}`)}
                  leftIcon={<Download className="w-3.5 h-3.5 text-slate-500" />}
                  className="text-xs"
                >
                  Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Document Preview Modal */}
      <Modal
        isOpen={!!viewingDoc}
        onClose={() => setViewingDoc(null)}
        title={viewingDoc?.title || 'Report Details'}
        description={`File: ${viewingDoc?.fileName} (${viewingDoc?.fileSize})`}
      >
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
            <div><strong>Category:</strong> {viewingDoc?.category}</div>
            <div><strong>Upload Date:</strong> {viewingDoc?.uploadDate}</div>
            {viewingDoc?.doctorName && <div><strong>Ordering Clinician:</strong> {viewingDoc?.doctorName}</div>}
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 mb-1">Clinical Synthesis</h4>
            <p className="text-xs text-slate-600 leading-relaxed bg-teal-50/50 p-3 rounded-xl border border-teal-200/60">
              {viewingDoc?.summary}
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="outline" size="sm" onClick={() => setViewingDoc(null)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
