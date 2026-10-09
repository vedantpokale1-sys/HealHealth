import React, { useState, useEffect } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  ShieldCheck,
  Sparkles,
  Users,
  MessageSquare,
  Clock,
  Maximize2,
} from 'lucide-react';
import { Appointment } from '../../types';
import { Button } from '../ui/Button';

interface TelehealthRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
}

export const TelehealthRoomModal: React.FC<TelehealthRoomModalProps> = ({
  isOpen,
  onClose,
  appointment,
}) => {
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isOpen) {
      setCallDuration(0);
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen || !appointment) return null;

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-5xl bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col h-[85vh] text-white">
        {/* Top Telehealth Room Bar */}
        <div className="px-6 py-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">{appointment.doctorName}</h3>
                <span className="text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40 px-2 py-0.5 rounded-full">
                  Telehealth Encrypted Room
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {appointment.doctorSpecialty} • {appointment.clinic}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 px-3 py-1 rounded-full text-xs text-slate-300">
              <Clock className="w-3.5 h-3.5 text-teal-400" />
              <span className="font-mono">{formatDuration(callDuration)}</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800 px-2.5 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>E2E 256-bit AES Encrypted</span>
            </div>
          </div>
        </div>

        {/* Video Canvas & Feeds Area */}
        <div className="flex-1 relative bg-gradient-to-b from-slate-900 to-slate-950 p-4 flex items-center justify-center overflow-hidden">
          {/* Doctor Video Feed Simulation */}
          <div className="relative w-full h-full max-w-4xl rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex flex-col items-center justify-center shadow-inner">
            <img
              src={appointment.doctorAvatar}
              alt={appointment.doctorName}
              className="w-full h-full object-cover opacity-80 filter brightness-95"
            />
            {/* Live Feed Overlay Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/30" />

            {/* Doctor Info Pill on feed */}
            <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="font-bold text-white">{appointment.doctorName}</span>
              <span className="text-slate-400">({appointment.doctorSpecialty})</span>
            </div>

            {/* Simulated Live Audio Spectrum */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-1 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700">
              <span className="w-1 h-3 bg-teal-400 rounded animate-pulse" />
              <span className="w-1 h-5 bg-teal-400 rounded animate-pulse delay-75" />
              <span className="w-1 h-2 bg-teal-400 rounded animate-pulse delay-150" />
              <span className="w-1 h-4 bg-teal-400 rounded animate-pulse" />
              <span className="text-[10px] text-teal-300 ml-1 font-mono">HD Audio</span>
            </div>

            {/* Patient Self Video Preview (Picture in Picture) */}
            <div className="absolute top-4 right-4 z-10 w-36 h-28 sm:w-44 sm:h-32 rounded-xl overflow-hidden border-2 border-teal-500/80 shadow-2xl bg-slate-900">
              {isVideoOn ? (
                <div className="w-full h-full bg-slate-800 flex items-center justify-center relative">
                  <div className="w-12 h-12 rounded-full bg-teal-600 flex items-center justify-center font-bold text-lg text-white">
                    {appointment.patientName[0]}
                  </div>
                  <span className="absolute bottom-1 left-2 text-[10px] text-white/90 bg-black/60 px-1.5 rounded">
                    You (Patient)
                  </span>
                </div>
              ) : (
                <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center text-slate-500">
                  <VideoOff className="w-6 h-6 mb-1" />
                  <span className="text-[10px]">Camera Paused</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Control Dock */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Connection: <strong>Optimal (14ms latency)</strong></span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMicOn(!isMicOn)}
              className={`p-3 rounded-2xl transition ${
                isMicOn
                  ? 'bg-slate-800 hover:bg-slate-700 text-white'
                  : 'bg-rose-600 text-white'
              }`}
              title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
            >
              {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>

            <button
              type="button"
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`p-3 rounded-2xl transition ${
                isVideoOn
                  ? 'bg-slate-800 hover:bg-slate-700 text-white'
                  : 'bg-rose-600 text-white'
              }`}
              title={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
            >
              {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-3 px-5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition"
              title="Leave Telehealth Room"
            >
              <PhoneOff className="w-4 h-4" />
              <span>Leave Consultation</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Room ID: <strong>{appointment.id}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
