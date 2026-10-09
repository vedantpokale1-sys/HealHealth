import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  Building,
  User,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';

export const AppointmentBookingPage: React.FC = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
  const [searchParams] = useSearchParams();
  const { doctors, addAppointment } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();

  const doctor = doctors.find((d) => d.id === doctorId) || doctors[0];

  // Booking details state
  const defaultSlot = searchParams.get('slot') || doctor?.availableSlots[0] || '10:30 AM';
  const [selectedSlot, setSelectedSlot] = useState(defaultSlot);
  const [selectedDate, setSelectedDate] = useState('2026-10-16');
  const [consultType, setConsultType] = useState<'video' | 'in-person'>('video');
  const [patientNotes, setPatientNotes] = useState('Follow-up review on recent lab reports and routine symptom review.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingConfirmedModal, setBookingConfirmedModal] = useState(false);
  const [confirmedAptId, setConfirmedAptId] = useState('');

  // 7-day date strip
  const dateOptions = [
    { label: 'Fri, Oct 16', value: '2026-10-16' },
    { label: 'Sat, Oct 17', value: '2026-10-17' },
    { label: 'Mon, Oct 19', value: '2026-10-19' },
    { label: 'Tue, Oct 20', value: '2026-10-20' },
    { label: 'Wed, Oct 21', value: '2026-10-21' },
    { label: 'Thu, Oct 22', value: '2026-10-22' },
  ];

  const handleConfirmBooking = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const aptId = addAppointment({
        doctorId: doctor.id,
        doctorName: doctor.name,
        doctorSpecialty: doctor.specialty,
        doctorAvatar: doctor.avatarUrl,
        clinic: doctor.clinic,
        date: selectedDate,
        time: selectedSlot,
        type: consultType,
        status: 'upcoming',
        patientName: user?.name || 'Aarav Sharma',
        notes: patientNotes,
        meetingLink: consultType === 'video' ? `https://meet.healhealth.app/room/apt-${Date.now()}` : undefined,
      });

      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch {
        // Fallback gracefully
      }

      setConfirmedAptId(aptId);
      setIsSubmitting(false);
      setBookingConfirmedModal(true);
    }, 600);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-200">
      <div>
        <Link
          to={`/doctors/${doctor.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-teal-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to doctor profile</span>
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-900 mt-2">Schedule Your Medical Appointment</h1>
        <p className="text-xs text-slate-500">Confirm visit type, time slot, and patient consultation notes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Details */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. Consultation Format */}
          <Card className="p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-3">1. Select Consultation Format</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => setConsultType('video')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition flex items-start gap-3 ${
                  consultType === 'video'
                    ? 'border-teal-600 bg-teal-50/50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className={`p-2 rounded-lg ${consultType === 'video' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Video Telehealth</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Encrypted video room directly in your browser.</p>
                </div>
              </div>

              <div
                onClick={() => setConsultType('in-person')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition flex items-start gap-3 ${
                  consultType === 'in-person'
                    ? 'border-teal-600 bg-teal-50/50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className={`p-2 rounded-lg ${consultType === 'in-person' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">In-Person Clinic Visit</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">At {doctor.clinic}, {doctor.location}.</p>
                </div>
              </div>
            </div>
          </Card>

          {/* 2. Select Date */}
          <Card className="p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-teal-600" />
              2. Select Appointment Date
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {dateOptions.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setSelectedDate(d.value)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition text-center ${
                    selectedDate === d.value
                      ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </Card>

          {/* 3. Select Time Slot */}
          <Card className="p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600" />
              3. Available Time Slots
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {doctor.availableSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition text-center ${
                    selectedSlot === slot
                      ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </Card>

          {/* 4. Patient Information & Consultation Notes */}
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-teal-600" />
              4. Patient Details & Consultation Reason
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-500 mb-1">Patient Name</label>
                <input
                  type="text"
                  value={user?.name || 'Aarav Sharma'}
                  disabled
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-700"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={user?.phone || '+91 98201 44521'}
                  disabled
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for Visit or Symptoms (Optional)
              </label>
              <textarea
                rows={3}
                value={patientNotes}
                onChange={(e) => setPatientNotes(e.target.value)}
                placeholder="Describe your current symptoms or specific questions for the physician..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          </Card>
        </div>

        {/* Right Column: Doctor Summary & Fee Checkout */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6 sticky top-24 space-y-5">
            <div className="flex items-start gap-3.5 pb-4 border-b border-slate-100">
              <img
                src={doctor.avatarUrl}
                alt={doctor.name}
                className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
              />
              <div>
                <h4 className="text-sm font-bold text-slate-900">{doctor.name}</h4>
                <p className="text-xs font-semibold text-teal-600 mt-0.5">{doctor.specialty}</p>
                <p className="text-[11px] text-slate-500">{doctor.clinic}</p>
              </div>
            </div>

            {/* Booking Review Summary */}
            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Date:</span>
                <span className="font-bold text-slate-900">{selectedDate}</span>
              </div>
              <div className="flex justify-between">
                <span>Slot:</span>
                <span className="font-bold text-slate-900">{selectedSlot}</span>
              </div>
              <div className="flex justify-between">
                <span>Type:</span>
                <span className="font-bold text-slate-900 uppercase">{consultType}</span>
              </div>
            </div>

            {/* Fee summary */}
            <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-200 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Consultation Fee:</span>
                <span>₹{doctor.consultationFee}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Booking & Platform Fee:</span>
                <span className="text-emerald-700 font-bold">FREE (Demo)</span>
              </div>
              <div className="flex justify-between font-extrabold text-sm text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Amount:</span>
                <span className="text-teal-700">₹{doctor.consultationFee}</span>
              </div>
            </div>

            <Button
              variant="teal"
              size="lg"
              onClick={handleConfirmBooking}
              isLoading={isSubmitting}
              className="w-full shadow-md"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Confirm Appointment
            </Button>

            <div className="flex items-center gap-2 text-[11px] text-slate-400 justify-center">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Simulated Instant Booking Confirmation</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={bookingConfirmedModal}
        onClose={() => {
          setBookingConfirmedModal(false);
          navigate('/appointments');
        }}
        title="Appointment Successfully Confirmed"
        description="Your appointment has been registered with the physician."
      >
        <div className="space-y-4 text-center py-2">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <p className="text-sm text-slate-700 leading-relaxed">
            Your appointment with <strong className="text-slate-900">{doctor.name}</strong> is booked for{' '}
            <strong>{selectedDate} at {selectedSlot}</strong> ({consultType === 'video' ? 'Virtual Video Consult' : 'In-Clinic'}).
          </p>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-left space-y-1 text-slate-600">
            <div><strong>Appointment ID:</strong> {confirmedAptId}</div>
            <div><strong>Hospital/Clinic:</strong> {doctor.clinic}</div>
            {consultType === 'video' && <div><strong>Meeting Link:</strong> Added to your Appointments portal</div>}
          </div>

          <Button
            variant="teal"
            size="md"
            onClick={() => {
              setBookingConfirmedModal(false);
              navigate('/appointments');
            }}
            className="w-full"
          >
            Go to My Appointments
          </Button>
        </div>
      </Modal>
    </div>
  );
};
