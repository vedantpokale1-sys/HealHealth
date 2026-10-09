import React, { useState } from 'react';
import { AlertTriangle, PhoneCall, X } from 'lucide-react';

export const EmergencyBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white text-xs px-4 py-2.5 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 flex-1">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-300" />
          <p className="font-medium leading-tight">
            <span className="font-bold underline decoration-red-300 mr-1.5">Medical Safety Notice:</span>
            HEALHEALTH AI provides clinical guidance and specialist navigation, not definitive medical diagnoses. If you have severe chest pain, sudden numbness, or shortness of breath, immediately contact emergency services.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href="tel:112"
            className="inline-flex items-center gap-1.5 bg-white text-red-700 hover:bg-red-50 font-bold px-3 py-1 rounded-lg text-xs shadow-xs transition"
          >
            <PhoneCall className="w-3.5 h-3.5 text-red-600" />
            <span>Call 112 / 911</span>
          </a>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="text-white/80 hover:text-white p-1 rounded transition"
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
