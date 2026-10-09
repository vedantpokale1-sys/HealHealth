import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Star,
  MapPin,
  Building,
  Globe,
  Award,
  Calendar,
  Clock,
  Video,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const DoctorProfilePage: React.FC = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
  const { doctors } = useApp();
  const navigate = useNavigate();

  const doctor = doctors.find((d) => d.id === doctorId) || doctors[0];
  const [selectedSlot, setSelectedSlot] = useState(doctor?.availableSlots[0] || '10:30 AM');

  if (!doctor) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-slate-600">Doctor not found.</p>
        <Button variant="outline" onClick={() => navigate('/doctors')}>Return to directory</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-200">
      {/* Back button */}
      <div>
        <Link
          to="/doctors"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-teal-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to doctor directory</span>
        </Link>
      </div>

      {/* Main Profile Card */}
      <Card className="p-6 sm:p-8">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <img
            src={doctor.avatarUrl}
            alt={doctor.name}
            className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl object-cover border-2 border-slate-200 shadow-md shrink-0"
          />

          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-extrabold text-slate-900">{doctor.name}</h1>
                  <Badge variant="teal" size="sm">Demo Profile</Badge>
                </div>
                <p className="text-sm font-semibold text-teal-700 mt-0.5">{doctor.specialty}</p>
              </div>

              <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-800">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span>{doctor.rating}</span>
                <span className="text-slate-400 font-normal">({doctor.reviewCount} reviews)</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              {doctor.qualifications} • {doctor.experienceYears} Years Clinical Experience
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <Building className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">{doctor.clinic}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">{doctor.location}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">{doctor.languages.join(', ')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bio & Clinical Focus */}
        <div className="mt-8 pt-6 border-t border-slate-100 space-y-4">
          <h3 className="text-sm font-bold text-slate-900">About the Specialist</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{doctor.about}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <h4 className="font-bold text-slate-900">Consultation Formats Supported</h4>
              <div className="flex items-center gap-3 pt-1">
                {doctor.consultationTypes.includes('video') && (
                  <span className="inline-flex items-center gap-1 text-teal-700 bg-teal-50 border border-teal-200 px-2 py-1 rounded-md font-medium">
                    <Video className="w-3.5 h-3.5" /> Virtual Telehealth
                  </span>
                )}
                {doctor.consultationTypes.includes('in-person') && (
                  <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 border border-blue-200 px-2 py-1 rounded-md font-medium">
                    <Building className="w-3.5 h-3.5" /> In-Clinic Evaluation
                  </span>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
              <div>
                <span className="text-slate-500 block">Consultation Fee</span>
                <span className="text-lg font-extrabold text-slate-900">₹{doctor.consultationFee}</span>
              </div>
              <Badge variant="success" size="sm">Fixed Transparent Pricing</Badge>
            </div>
          </div>
        </div>

        {/* Available Calendar Slots Section */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Next Available Schedule</h3>
              <p className="text-xs text-slate-500">Earliest slot: {doctor.nextAvailable}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 mb-6">
            {doctor.availableSlots.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setSelectedSlot(slot)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition text-center ${
                  selectedSlot === slot
                    ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                {slot}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <span className="text-xs text-slate-500">
              Selected slot: <strong className="text-slate-900">{selectedSlot}</strong>
            </span>
            <Button
              variant="teal"
              size="lg"
              onClick={() => navigate(`/booking/${doctor.id}?slot=${encodeURIComponent(selectedSlot)}`)}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Proceed to Booking
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
