import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Video,
  Building,
  AlertTriangle,
  RotateCcw,
  XCircle,
  CheckCircle2,
  ExternalLink,
  Plus,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { TelehealthRoomModal } from '../components/healthcare/TelehealthRoomModal';
import { Appointment } from '../types';

export const MyAppointmentsPage: React.FC = () => {
  const { appointments, cancelAppointment, rescheduleAppointment } = useApp();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
  const [videoModalApt, setVideoModalApt] = useState<Appointment | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [newDate, setNewDate] = useState('2026-10-25');
  const [newTime, setNewTime] = useState('11:30 AM');

  const filteredAppointments = appointments.filter((apt) => apt.status === activeTab);

  const handleConfirmCancel = () => {
    if (selectedApt) {
      cancelAppointment(selectedApt.id);
      setCancelModalOpen(false);
      setSelectedApt(null);
    }
  };

  const handleConfirmReschedule = () => {
    if (selectedApt) {
      rescheduleAppointment(selectedApt.id, newDate, newTime);
      setRescheduleModalOpen(false);
      setSelectedApt(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Appointments
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Track upcoming consultations, join virtual rooms, or adjust calendar bookings.
          </p>
        </div>

        <Button
          variant="teal"
          size="sm"
          onClick={() => navigate('/doctors')}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Book New Consultation
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {(['upcoming', 'completed', 'cancelled'] as const).map((tab) => {
          const count = appointments.filter((a) => a.status === tab).length;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition flex items-center gap-2 ${
                activeTab === tab
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>{tab}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === tab ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Appointment Cards List */}
      {filteredAppointments.length === 0 ? (
        <Card className="p-12 text-center space-y-3">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 capitalize">No {activeTab} appointments found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {activeTab === 'upcoming'
              ? 'You do not currently have any scheduled visits. Browse our verified physicians to book a consultation.'
              : `There are no ${activeTab} consultations in your history.`}
          </p>
          {activeTab === 'upcoming' && (
            <Button variant="teal" size="sm" onClick={() => navigate('/doctors')}>
              Discover Specialists
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((apt) => (
            <Card key={apt.id} className="p-6 hover:shadow-md transition">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <img
                    src={apt.doctorAvatar}
                    alt={apt.doctorName}
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shrink-0"
                  />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{apt.doctorName}</h3>
                      <Badge
                        variant={apt.status === 'upcoming' ? 'teal' : apt.status === 'completed' ? 'normal' : 'critical'}
                        size="sm"
                      >
                        {apt.status}
                      </Badge>
                      <Badge variant="neutral" size="sm">
                        {apt.type === 'video' ? 'Video Telehealth' : 'In-Person'}
                      </Badge>
                    </div>

                    <p className="text-xs font-semibold text-teal-700 mt-0.5">{apt.doctorSpecialty}</p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                      <span className="flex items-center gap-1.5 font-medium text-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" /> {apt.date}
                      </span>
                      <span className="flex items-center gap-1.5 font-medium text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> {apt.time}
                      </span>
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Building className="w-3.5 h-3.5 text-slate-400" /> {apt.clinic}
                      </span>
                    </div>

                    {apt.notes && (
                      <p className="text-xs text-slate-500 mt-2 bg-slate-50 p-2 rounded-lg border border-slate-100 max-w-xl">
                        <strong>Reason:</strong> {apt.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap md:flex-col items-end gap-2 shrink-0">
                  {apt.status === 'upcoming' && (
                    <>
                      {apt.type === 'video' && (
                        <button
                          type="button"
                          onClick={() => setVideoModalApt(apt)}
                          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                        >
                          <Video className="w-4 h-4" />
                          <span>Join Video Room</span>
                        </button>
                      )}

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedApt(apt);
                            setRescheduleModalOpen(true);
                          }}
                          className="text-xs"
                        >
                          Reschedule
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => {
                            setSelectedApt(apt);
                            setCancelModalOpen(true);
                          }}
                          className="text-xs bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                        >
                          Cancel
                        </Button>
                      </div>
                    </>
                  )}

                  {apt.status === 'completed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/booking/${apt.doctorId}`)}
                      className="text-xs"
                    >
                      Book Follow-up
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Appointment"
        description="Are you sure you want to cancel this booking?"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Cancelling your appointment with <strong>{selectedApt?.doctorName}</strong> on {selectedApt?.date} will release the slot to other patients.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setCancelModalOpen(false)}>
              Keep Appointment
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmCancel}>
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reschedule Modal */}
      <Modal
        isOpen={rescheduleModalOpen}
        onClose={() => setRescheduleModalOpen(false)}
        title="Reschedule Appointment"
        description={`Select a new date and time with ${selectedApt?.doctorName}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">New Date</label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Time Slot</label>
            <select
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            >
              {['09:30 AM', '10:30 AM', '11:30 AM', '02:30 PM', '04:15 PM', '06:00 PM'].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setRescheduleModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="teal" size="sm" onClick={handleConfirmReschedule}>
              Confirm Reschedule
            </Button>
          </div>
        </div>
      </Modal>

      {/* Telehealth In-App Consultation Modal */}
      <TelehealthRoomModal
        isOpen={!!videoModalApt}
        onClose={() => setVideoModalApt(null)}
        appointment={videoModalApt}
      />
    </div>
  );
};
