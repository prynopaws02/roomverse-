'use client';

import React from 'react';

export interface Preferences {
  hospital: boolean;
  streetlights: boolean;
  walkingDistance: boolean;
  wifi: boolean;
  ac: boolean;
  laundry: boolean;
  gym: boolean;
}

interface CompatibilityQuizProps {
  preferences: Preferences;
  onPreferenceChange: (key: keyof Preferences, value: boolean) => void;
}

export default function CompatibilityQuiz({ preferences, onPreferenceChange }: CompatibilityQuizProps) {
  const preferenceItems = [
    { key: 'hospital', label: 'Nearby Hospital (< 1km)', icon: '🏥' },
    { key: 'streetlights', label: 'Well-lit Streetlights', icon: '💡' },
    { key: 'walkingDistance', label: 'Walking Distance (< 500m)', icon: '🚶' },
    { key: 'wifi', label: 'High-speed Wi-Fi', icon: '📶' },
    { key: 'ac', label: 'Air Conditioning (AC)', icon: '❄️' },
    { key: 'laundry', label: 'Laundry Service', icon: '🧺' },
    { key: 'gym', label: 'In-house Gym', icon: '🏋️' },
  ] as const;

  const handleClear = () => {
    Object.keys(preferences).forEach((key) => {
      onPreferenceChange(key as keyof Preferences, false);
    });
  };

  const selectedCount = Object.values(preferences).filter(Boolean).length;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
      {/* Background glow overlay */}
      <div className="absolute -right-20 -top-20 w-40 h-40 rounded-full bg-emerald-50/40 blur-3xl pointer-events-none"></div>
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-extrabold text-lg tracking-tight text-slate-800">
            Compatibility Match
          </h3>
          <p className="text-xs text-slate-500 mt-1">Select your critical preferences</p>
        </div>
        {selectedCount > 0 && (
          <button
            onClick={handleClear}
            className="text-xs font-bold text-royal-green hover:text-emerald-700 transition-colors cursor-pointer"
          >
            Reset
          </button>
        )}
      </div>

      <div className="space-y-3">
        {preferenceItems.map(({ key, label, icon }) => (
          <label
            key={key}
            className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all duration-300 ${
              preferences[key]
                ? 'bg-emerald-50/50 border-royal-green text-royal-green shadow-[0_4px_15px_rgba(15,81,50,0.03)] font-semibold'
                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{icon}</span>
              <span className="text-xs font-semibold">{label}</span>
            </div>
            <input
              type="checkbox"
              checked={preferences[key]}
              onChange={(e) => onPreferenceChange(key, e.target.checked)}
              className="w-4 h-4 rounded text-royal-green border-slate-300 focus:ring-royal-green bg-white focus:ring-offset-0 cursor-pointer"
            />
          </label>
        ))}
      </div>
      
      {selectedCount > 0 && (
        <div className="mt-5 p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Active preferences:</span>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-royal-green font-bold border border-emerald-100">
            {selectedCount} Selected
          </span>
        </div>
      )}
    </div>
  );
}
