import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  IndianRupee,
  BedDouble,
  DoorOpen,
  ScrollText,
  Save,
  Image as ImageIcon,
  Upload,
  X,
  ImagePlus,
} from 'lucide-react';
import Button from './Button';
import FacilitySelector from './FacilitySelector';
import HostelMap from './HostelMap';
import { getHostelImageUrl } from '../services/api';

const HOSTEL_TYPES = ['Boys', 'Girls', 'Co-ed'];

export const HostelForm = ({
  initialData = {},
  onSubmit,
  loading = false,
  submitLabel = 'Save Hostel',
}) => {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    description: initialData.description || '',
    type: initialData.type || 'Boys',
    address: initialData.address || '',
    city: initialData.city || '',
    state: initialData.state || '',
    pincode: initialData.pincode || '',
    contactPhone: initialData.contactPhone || '',
    contactEmail: initialData.contactEmail || '',
    totalRooms: initialData.totalRooms || '',
    totalBeds: initialData.totalBeds || '',
    startingRent: initialData.startingRent || '',
    securityDeposit: initialData.securityDeposit || '',
    latitude: initialData.location?.coordinates?.[1] || '',
    longitude: initialData.location?.coordinates?.[0] || '',
    facilities: initialData.facilities || [],
    hostelRules: initialData.hostelRules || [],
  });

  const [ruleInput, setRuleInput] = useState('');
  const [imagePreviews, setImagePreviews] = useState([]); // Array of { file, previewUrl, id }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter((file) => {
      const isImage = file.type.startsWith('image/');
      const isUnder5MB = file.size <= 5 * 1024 * 1024;
      return isImage && isUnder5MB;
    });

    const newPreviews = validFiles.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      id: `${file.name}-${Date.now()}-${Math.random()}`,
    }));

    setImagePreviews((prev) => [...prev, ...newPreviews]);
    e.target.value = '';
  };

  const removeSelectedImage = (idToRemove) => {
    setImagePreviews((prev) => {
      const target = prev.find((p) => p.id === idToRemove);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((p) => p.id !== idToRemove);
    });
  };

  const addRule = () => {
    const trimmed = ruleInput.trim();
    if (trimmed && !formData.hostelRules.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        hostelRules: [...prev.hostelRules, trimmed],
      }));
      setRuleInput('');
    }
  };

  const removeRule = (rule) => {
    setFormData((prev) => ({
      ...prev,
      hostelRules: prev.hostelRules.filter((r) => r !== rule),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      imageFiles: imagePreviews.map((p) => p.file),
    });
  };

  const inputClass =
    'w-full px-3 py-2.5 bg-rose-50/70 border border-white rounded-xl text-sm text-slate-700 placeholder-rose-300 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors';
  const labelClass =
    'block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5';

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Section 1: Basic Information */}
      <div className="bg-rose-50/80 border border-white rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-2 text-base font-bold text-slate-800">
          <Building2 className="w-5 h-5 text-teal-400" />
          <span>Basic Information</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={labelClass}>Hostel Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Royal Heritage Boys Hostel"
              required
              className={inputClass}
            />
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Describe your hostel, its ambience, and key highlights..."
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Hostel Type *</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className={inputClass}
            >
              {HOSTEL_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Contact Phone *</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-rose-300 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                placeholder="9876543210"
                required
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Contact Email *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-rose-300 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                placeholder="hostel@example.com"
                required
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Location Details */}
      <div className="bg-rose-50/80 border border-white rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-2 text-base font-bold text-slate-800">
          <MapPin className="w-5 h-5 text-emerald-400" />
          <span>Location Details</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={labelClass}>Full Address *</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="e.g. 5th Main Road, HSR Layout, Sector 2"
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>City *</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="e.g. Bangalore"
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>State *</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="e.g. Karnataka"
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Pincode *</label>
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              placeholder="e.g. 560102"
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Latitude (Optional)</label>
            <input
              type="number"
              step="any"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              placeholder="e.g. 12.9716"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Longitude (Optional)</label>
            <input
              type="number"
              step="any"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              placeholder="e.g. 77.5946"
              className={inputClass}
            />
          </div>

          {/* Interactive Map Location Picker */}
          <div className="md:col-span-2 pt-2">
            <label className="text-xs font-semibold text-slate-700 mb-2 block">
              Hostel Location Pinpoint (Click on map to select location)
            </label>
            <HostelMap
              height="280px"
              center={
                formData.latitude && formData.longitude && !isNaN(formData.latitude) && !isNaN(formData.longitude)
                  ? [parseFloat(formData.latitude), parseFloat(formData.longitude)]
                  : [12.9716, 77.5946]
              }
              pickerPosition={
                formData.latitude && formData.longitude && !isNaN(formData.latitude) && !isNaN(formData.longitude)
                  ? [parseFloat(formData.latitude), parseFloat(formData.longitude)]
                  : null
              }
              onLocationSelect={({ latitude, longitude }) => {
                setFormData((prev) => ({
                  ...prev,
                  latitude: latitude.toString(),
                  longitude: longitude.toString(),
                }));
              }}
            />
          </div>
        </div>
      </div>

      {/* Section 3: Capacity & Pricing */}
      <div className="bg-rose-50/80 border border-white rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-2 text-base font-bold text-slate-800">
          <IndianRupee className="w-5 h-5 text-amber-400" />
          <span>Capacity & Pricing</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className={labelClass}>Total Rooms</label>
            <div className="relative">
              <DoorOpen className="w-4 h-4 text-rose-300 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                min="0"
                name="totalRooms"
                value={formData.totalRooms}
                onChange={handleChange}
                placeholder="0"
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Total Beds</label>
            <div className="relative">
              <BedDouble className="w-4 h-4 text-rose-300 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                min="0"
                name="totalBeds"
                value={formData.totalBeds}
                onChange={handleChange}
                placeholder="0"
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Starting Rent (₹/month)</label>
            <div className="relative">
              <IndianRupee className="w-4 h-4 text-rose-300 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                min="0"
                name="startingRent"
                value={formData.startingRent}
                onChange={handleChange}
                placeholder="0"
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Security Deposit (₹)</label>
            <div className="relative">
              <IndianRupee className="w-4 h-4 text-rose-300 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                min="0"
                name="securityDeposit"
                value={formData.securityDeposit}
                onChange={handleChange}
                placeholder="0"
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Facilities */}
      <div className="bg-rose-50/80 border border-white rounded-2xl p-6">
        <FacilitySelector
          selected={formData.facilities}
          onChange={(facilities) => setFormData((prev) => ({ ...prev, facilities }))}
          label="Hostel Facilities & Amenities"
        />
      </div>

      {/* Section 5: Hostel Rules */}
      <div className="bg-rose-50/80 border border-white rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-base font-bold text-slate-800">
          <ScrollText className="w-5 h-5 text-cyan-400" />
          <span>Hostel Rules</span>
        </div>

        {formData.hostelRules.length > 0 && (
          <ul className="space-y-1.5">
            {formData.hostelRules.map((rule, idx) => (
              <li
                key={idx}
                className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-rose-50/60 border border-white/80 text-xs text-slate-600"
              >
                <span>
                  {idx + 1}. {rule}
                </span>
                <button
                  type="button"
                  onClick={() => removeRule(rule)}
                  className="p-1 rounded-lg text-rose-300 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <span className="text-xs">✕</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={ruleInput}
            onChange={(e) => setRuleInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addRule();
              }
            }}
            placeholder="e.g. No smoking on premises, Gate closes at 10 PM..."
            className={`flex-1 ${inputClass}`}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addRule}
            disabled={!ruleInput.trim()}
          >
            Add Rule
          </Button>
        </div>
      </div>

      {/* Section 6: Hostel Photos / Images */}
      <div className="bg-rose-50/80 border border-white rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-base font-bold text-slate-800">
            <ImageIcon className="w-5 h-5 text-rose-400" />
            <span>Hostel Photos & Gallery</span>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {imagePreviews.length > 0 ? `${imagePreviews.length} selected` : 'Multiple images allowed'}
          </span>
        </div>

        {/* Existing Images (When editing) */}
        {initialData.images && initialData.images.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-600">Current Uploaded Photos ({initialData.images.length}):</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {initialData.images.map((img) => (
                <div key={img._id} className="relative rounded-xl overflow-hidden aspect-square border border-slate-200 bg-white shadow-xs">
                  <img
                    src={getHostelImageUrl(initialData._id, img._id)}
                    alt={img.filename}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Drag & drop / upload zone */}
        <div className="border-2 border-dashed border-rose-200 hover:border-teal-400 bg-white/60 hover:bg-white/90 rounded-2xl p-6 text-center transition-all cursor-pointer relative group">
          <input
            type="file"
            multiple
            accept="image/png, image/jpeg, image/jpg, image/webp"
            onChange={handleImageSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            id="hostel-form-images"
          />
          <div className="flex flex-col items-center gap-2 pointer-events-none">
            <div className="p-3 bg-rose-100/80 rounded-2xl group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6 text-rose-500" />
            </div>
            <p className="text-sm font-bold text-slate-700">
              Click to select or drag & drop multiple images
            </p>
            <p className="text-xs text-slate-400">
              PNG, JPG, JPEG, WEBP up to 5 MB per image (select as many photos as you want)
            </p>
          </div>
        </div>

        {/* Selected Images Previews */}
        {imagePreviews.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                New Photos to Upload ({imagePreviews.length}):
              </h4>
              <button
                type="button"
                onClick={() => setImagePreviews([])}
                className="text-xs text-rose-500 hover:underline font-semibold"
              >
                Clear All
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {imagePreviews.map((p) => (
                <div
                  key={p.id}
                  className="relative group rounded-xl overflow-hidden aspect-square border border-slate-200 bg-white shadow-sm"
                >
                  <img
                    src={p.previewUrl}
                    alt={p.file.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                    <button
                      type="button"
                      onClick={() => removeSelectedImage(p.id)}
                      className="self-end p-1.5 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors shadow-md"
                      title="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] text-white truncate bg-black/50 px-1.5 py-0.5 rounded-md">
                      {(p.file.size / (1024 * 1024)).toFixed(1)} MB
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" variant="primary" size="lg" loading={loading} icon={Save}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default HostelForm;
