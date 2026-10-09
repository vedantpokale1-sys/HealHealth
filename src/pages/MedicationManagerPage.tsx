import React, { useState } from 'react';
import {
  Pill,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Calendar,
  Check,
  ShieldCheck,
  User,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Medication } from '../types';

export const MedicationManagerPage: React.FC = () => {
  const { medications, toggleMedicationDose } = useApp();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');
  const [addModalOpen, setAddModalOpen] = useState(false);

  // New medication form state
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('Once daily');
  const [instructions, setInstructions] = useState('');

  const filteredMeds = medications.filter((m) => {
    if (filter === 'all') return true;
    return m.status === filter;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Prescription & Medication Manager
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Keep track of doctor-prescribed daily dosages, time slots, and administration instructions.
          </p>
        </div>

        <Button
          variant="teal"
          size="sm"
          onClick={() => setAddModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Prescription Record
        </Button>
      </div>

      {/* Safety Notice */}
      <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between gap-3 text-xs text-teal-900">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
          <span>
            <strong>Clinical Safety Protocol:</strong> HEALHEALTH records prescriptions solely for scheduling reminders. AI systems will never alter clinician-prescribed dosages.
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        {(['active', 'all', 'completed'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
              filter === f ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {f} Prescriptions
          </button>
        ))}
      </div>

      {/* Medication List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMeds.map((med) => (
          <Card key={med.id} className="p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <Pill className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{med.name}</h3>
                    <span className="text-xs font-semibold text-slate-500">{med.dosage}</span>
                  </div>
                </div>
                <Badge variant={med.status === 'active' ? 'teal' : 'neutral'} size="sm">
                  {med.status}
                </Badge>
              </div>

              <p className="text-xs text-slate-600 mb-4">{med.instructions}</p>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1 mb-4 text-slate-600">
                <div><strong>Schedule:</strong> {med.frequency}</div>
                <div><strong>Prescribed by:</strong> {med.prescribedBy}</div>
                <div><strong>Started:</strong> {med.startDate}</div>
              </div>
            </div>

            {/* Dose Check-off action buttons */}
            <div className="pt-3 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-2">
                Today's Dose Checkoff
              </span>
              <div className="flex flex-wrap gap-2">
                {med.timeSlots.map((slot, sIdx) => (
                  <button
                    key={slot.time}
                    type="button"
                    onClick={() => toggleMedicationDose(med.id, sIdx)}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                      slot.taken
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                    }`}
                  >
                    <CheckCircle2 className={`w-3.5 h-3.5 ${slot.taken ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>{slot.time}</span>
                    {slot.taken ? <span className="text-[10px]">✓ Taken</span> : <span>Take</span>}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Medication Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add Medication Reminder"
        description="Track an existing doctor-prescribed medication."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Medication Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Metformin, Losartan"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Dosage</label>
            <input
              type="text"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              placeholder="e.g. 500 mg"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Frequency</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            >
              <option value="Once daily">Once daily</option>
              <option value="Twice daily">Twice daily</option>
              <option value="Three times daily">Three times daily</option>
              <option value="As needed">As needed (SOS)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Instructions</label>
            <input
              type="text"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. After breakfast with water"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="teal"
              size="sm"
              onClick={() => {
                alert('Medication added to your schedule (Demo simulated)');
                setAddModalOpen(false);
              }}
            >
              Save Prescription
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
