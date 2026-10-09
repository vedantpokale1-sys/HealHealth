import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  Activity,
  Heart,
  Brain,
  Wind,
  Compass,
  ArrowRight,
  Stethoscope,
  Info,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { BodyExplorer3DCanvas } from '../components/3d/BodyExplorer3DCanvas';
import { MOCK_ANATOMY_REGIONS } from '../data/mockData';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const BodyExplorerPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedRegionId, setSelectedRegionId] = useState('heart');
  const [activeLayer, setActiveLayer] = useState<'all' | 'organs' | 'skeletal' | 'nervous'>('all');

  const selectedRegion =
    MOCK_ANATOMY_REGIONS.find((r) => r.id === selectedRegionId) || MOCK_ANATOMY_REGIONS[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Interactive 3D Body Explorer
            </h1>
            <Badge variant="teal" size="sm">Real-time WebGL</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Rotate the holographic anatomical model, inspect organ systems, and discover correlated medical specialties.
          </p>
        </div>

        {/* Layer Selector */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs">
          {(['all', 'organs', 'skeletal', 'nervous'] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setActiveLayer(l)}
              className={`px-3 py-1.5 rounded-lg font-bold capitalize transition ${
                activeLayer === l
                  ? 'bg-white text-teal-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Main 3D Canvas + Context Information Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: 3D Canvas Viewer */}
        <div className="lg:col-span-7 space-y-4">
          <BodyExplorer3DCanvas
            regions={MOCK_ANATOMY_REGIONS}
            selectedRegionId={selectedRegionId}
            onSelectRegion={setSelectedRegionId}
            activeLayer={activeLayer}
          />

          {/* Quick Region Selector Pills */}
          <div className="flex flex-wrap gap-2 text-xs">
            {MOCK_ANATOMY_REGIONS.map((region) => (
              <button
                key={region.id}
                type="button"
                onClick={() => setSelectedRegionId(region.id)}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 border ${
                  selectedRegionId === region.id
                    ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>{region.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Contextual Educational Dossier */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6 sm:p-8 space-y-6 border-slate-200">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <Badge variant="teal" size="sm">{selectedRegion.category} Anatomy</Badge>
                <span className="text-[11px] text-slate-400 font-mono">Hotspot: Active</span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">{selectedRegion.name}</h2>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{selectedRegion.description}</p>
            </div>

            {/* Common Symptoms */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Common Clinical Symptoms
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedRegion.commonSymptoms.map((sym, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium"
                  >
                    • {sym}
                  </div>
                ))}
              </div>
            </div>

            {/* Suggested Specialists & Action */}
            <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-teal-900">
                <Stethoscope className="w-4 h-4 text-teal-600" />
                <span>Correlated Medical Specialists</span>
              </div>
              <p className="text-xs text-teal-800">
                {selectedRegion.suggestedSpecialists.join(', ')}
              </p>
              <Button
                variant="teal"
                size="sm"
                onClick={() => navigate(`/doctors?query=${encodeURIComponent(selectedRegion.suggestedSpecialists[0])}`)}
                className="w-full text-xs"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Find {selectedRegion.suggestedSpecialists[0]}
              </Button>
            </div>

            {/* Educational Notes */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5 text-slate-600">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                <span>Physiological Education Fact</span>
              </div>
              <p className="leading-relaxed">{selectedRegion.educationalNotes}</p>
            </div>

            {/* Medical Educational Footnote */}
            <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-3">
              <strong>Educational Notice:</strong> The 3D model represents illustrative human anatomy. Clinical assessments require real-world diagnostic radiography and physician examination.
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
