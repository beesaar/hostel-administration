import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

const PRESET_FACILITIES = [
  'High Speed WiFi',
  '24/7 Security',
  'CCTV Surveillance',
  'Power Backup',
  'Hot Water',
  'Laundry Service',
  'Parking',
  'Gym & Fitness',
  'Study Room',
  'Common TV Room',
  'Attached Washroom',
  'Air Conditioning',
  'Water Purifier',
  'Cafeteria / Mess',
  'First Aid',
  'Fire Safety',
  'Biometric Access',
  'Solar Heating',
  'Elevator / Lift',
  'Gaming Zone',
];

export const FacilitySelector = ({ selected = [], onChange, label = 'Facilities' }) => {
  const [customInput, setCustomInput] = useState('');

  const toggleFacility = (facility) => {
    if (selected.includes(facility)) {
      onChange(selected.filter((f) => f !== facility));
    } else {
      onChange([...selected, facility]);
    }
  };

  const addCustomFacility = () => {
    const trimmed = customInput.trim();
    if (trimmed && !selected.includes(trimmed)) {
      onChange([...selected, trimmed]);
      setCustomInput('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomFacility();
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
        {label}
      </label>

      {/* Selected Tags */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((facility) => (
            <span
              key={facility}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-500/15 text-indigo-300 border border-indigo-500/30"
            >
              {facility}
              <button
                type="button"
                onClick={() => toggleFacility(facility)}
                className="p-0.5 rounded hover:bg-indigo-500/30 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Preset Options Grid */}
      <div className="flex flex-wrap gap-1.5">
        {PRESET_FACILITIES.filter((f) => !selected.includes(f)).map((facility) => (
          <button
            key={facility}
            type="button"
            onClick={() => toggleFacility(facility)}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800/80 text-slate-400 border border-slate-700/80 hover:bg-slate-700 hover:text-slate-200 transition-colors cursor-pointer"
          >
            + {facility}
          </button>
        ))}
      </div>

      {/* Custom Facility Input */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a custom facility..."
          className="flex-1 px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
        />
        <button
          type="button"
          onClick={addCustomFacility}
          disabled={!customInput.trim()}
          className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default FacilitySelector;
