import React, { useState, useEffect, useMemo } from 'react';
import { Search, SlidersHorizontal, X, ChevronDown, RotateCcw, List, Map as MapIcon } from 'lucide-react';
import { studentService } from '../../services/studentService';
import StudentHostelCard from '../../components/StudentHostelCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import HostelMap from '../../components/HostelMap';

const GENDER_OPTIONS = ['Boys', 'Girls', 'Co-ed'];

const AMENITY_OPTIONS = [
  'High Speed WiFi',
  '24/7 Security',
  'CCTV Surveillance',
  'Power Backup',
  'Hot Water',
  'Laundry Service',
  'Parking',
  'Gym & Fitness',
  'Study Room',
  'Attached Washroom',
  'Air Conditioning',
  'Cafeteria / Mess',
  'Biometric Access',
];

const HostelsDiscoveryPage = () => {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  useEffect(() => {
    fetchHostels();
  }, []);

  const fetchHostels = async () => {
    try {
      setLoading(true);
      const data = await studentService.getApprovedHostels();
      setHostels(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch hostels:', err);
      setError('Failed to load hostels. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Extract unique cities from fetched hostels for the dropdown
  const availableCities = useMemo(() => {
    const cities = [...new Set(hostels.map((h) => h.city).filter(Boolean))];
    return cities.sort();
  }, [hostels]);

  // Extract unique amenities/facilities from fetched hostels
  const availableAmenities = useMemo(() => {
    const amenitySet = new Set();
    hostels.forEach((h) => {
      (h.facilities || []).forEach((f) => amenitySet.add(f));
      (h.amenities || []).forEach((a) => amenitySet.add(a));
    });
    // Merge with preset list for good defaults, then sort
    AMENITY_OPTIONS.forEach((a) => amenitySet.add(a));
    return [...amenitySet].sort();
  }, [hostels]);

  // How many filters are active (for badge count)
  const activeFilterCount = [
    selectedCity,
    selectedGender,
    maxPrice,
    selectedAmenities.length > 0,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSelectedCity('');
    setSelectedGender('');
    setMaxPrice('');
    setSelectedAmenities([]);
  };

  const toggleAmenity = (amenity) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  // --- Filtering Logic ---
  const filteredHostels = useMemo(() => {
    return hostels.filter((hostel) => {
      // Text search (name or city)
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesName = hostel.name?.toLowerCase().includes(term);
        const matchesCity = hostel.city?.toLowerCase().includes(term);
        const matchesAddress = hostel.address?.toLowerCase().includes(term);
        if (!matchesName && !matchesCity && !matchesAddress) return false;
      }

      // City filter
      if (selectedCity && hostel.city !== selectedCity) return false;

      // Gender filter
      if (selectedGender && hostel.type !== selectedGender) return false;

      // Max price filter (startingRent)
      if (maxPrice) {
        const priceLimit = Number(maxPrice);
        if (!isNaN(priceLimit) && hostel.startingRent > priceLimit) return false;
      }

      // Amenities filter — hostel must have ALL selected amenities
      if (selectedAmenities.length > 0) {
        const hostelAmenities = [
          ...(hostel.facilities || []),
          ...(hostel.amenities || []),
        ];
        const hasAll = selectedAmenities.every((a) =>
          hostelAmenities.some(
            (ha) => ha.toLowerCase() === a.toLowerCase()
          )
        );
        if (!hasAll) return false;
      }

      return true;
    });
  }, [hostels, searchTerm, selectedCity, selectedGender, maxPrice, selectedAmenities]);

  // Build map markers from filtered hostels that have valid coordinates
  const mapMarkers = useMemo(() => {
    return filteredHostels
      .filter((h) => {
        const coords = h.location?.coordinates;
        return (
          coords &&
          Array.isArray(coords) &&
          coords.length === 2 &&
          !isNaN(coords[0]) &&
          !isNaN(coords[1]) &&
          // Exclude default 0,0 or check for non-trivial coordinates
          (coords[0] !== 0 || coords[1] !== 0)
        );
      })
      .map((h) => ({
        id: h._id,
        lat: h.location.coordinates[1], // GeoJSON is [lng, lat]
        lng: h.location.coordinates[0],
        name: h.name,
        address: h.address,
        city: h.city,
        rent: h.startingRent,
        link: `/student/hostels/${h._id}`,
      }));
  }, [filteredHostels]);

  // Compute map center from markers or use a sensible default
  const mapCenter = useMemo(() => {
    if (mapMarkers.length > 0) {
      const avgLat = mapMarkers.reduce((sum, m) => sum + m.lat, 0) / mapMarkers.length;
      const avgLng = mapMarkers.reduce((sum, m) => sum + m.lng, 0) / mapMarkers.length;
      return [avgLat, avgLng];
    }
    return [12.9716, 77.5946]; // Default: Bangalore
  }, [mapMarkers]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Explore Hostels
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Find and explore approved hostels that match your needs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!loading && !error && (
            <span className="text-xs font-semibold text-slate-400 bg-white/70 px-3 py-1.5 rounded-xl border border-white shrink-0">
              {filteredHostels.length} of {hostels.length} hostels
            </span>
          )}
        </div>
      </div>

      {/* Search + Filter Toggle Bar */}
      <div className="bg-white/50 backdrop-blur-xl border border-white p-2 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, city, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-rose-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/30 transition-all"
            />
          </div>

          {/* View Toggle: List / Map */}
          <div className="flex items-center bg-white border border-rose-100 rounded-xl overflow-hidden shrink-0">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1 px-3 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-violet-600 hover:bg-violet-50'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">List</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1 px-3 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'map'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-violet-600 hover:bg-violet-50'
              }`}
              title="Map View"
            >
              <MapIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Map</span>
            </button>
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`relative flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all shrink-0 cursor-pointer ${
              showFilters || activeFilterCount > 0
                ? 'bg-violet-600 text-white border-violet-600 shadow-lg shadow-violet-600/20'
                : 'bg-white text-slate-600 border-rose-100 hover:border-violet-300 hover:text-violet-600'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center text-[10px] font-bold bg-rose-500 text-white rounded-full shadow-lg">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Collapsible Filters Panel */}
      {showFilters && (
        <div className="bg-white/70 backdrop-blur-xl border border-white rounded-2xl p-5 sm:p-6 shadow-sm space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Filter Hostels</h3>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Clear All
              </button>
            )}
          </div>

          {/* Row 1: City, Gender, Price */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* City Dropdown */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                City
              </label>
              <div className="relative">
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full appearance-none px-3 py-2.5 pr-9 bg-rose-50/70 border border-white rounded-xl text-sm text-slate-700 focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400 transition-colors cursor-pointer"
                >
                  <option value="">All Cities</option>
                  {availableCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Gender Filter */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Gender / Type
              </label>
              <div className="flex gap-1.5">
                {GENDER_OPTIONS.map((g) => (
                  <button
                    key={g}
                    onClick={() =>
                      setSelectedGender(selectedGender === g ? '' : g)
                    }
                    className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      selectedGender === g
                        ? g === 'Boys'
                          ? 'bg-blue-500/15 text-blue-600 border-blue-300'
                          : g === 'Girls'
                          ? 'bg-pink-500/15 text-pink-600 border-pink-300'
                          : 'bg-emerald-500/15 text-emerald-600 border-emerald-300'
                        : 'bg-rose-50/70 text-slate-500 border-white hover:border-violet-200 hover:text-violet-600'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Max Price */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Max Rent (₹/month)
              </label>
              <input
                type="number"
                placeholder="e.g. 8000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                min="0"
                className="w-full px-3 py-2.5 bg-rose-50/70 border border-white rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400 transition-colors"
              />
            </div>
          </div>

          {/* Row 2: Amenities */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Amenities
            </label>
            <div className="flex flex-wrap gap-1.5">
              {availableAmenities.map((amenity) => {
                const isSelected = selectedAmenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    onClick={() => toggleAmenity(amenity)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-teal-500/15 text-teal-600 border-teal-500/30'
                        : 'bg-white/80 text-slate-400 border-rose-100/80 hover:bg-rose-100 hover:text-slate-700'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {amenity}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Summary Chips (visible when panel is closed but filters are active) */}
      {!showFilters && activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Active:</span>
          {selectedCity && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-violet-50 text-violet-600 border border-violet-200">
              {selectedCity}
              <button onClick={() => setSelectedCity('')} className="p-0.5 hover:bg-violet-100 rounded cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedGender && (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border ${
              selectedGender === 'Boys' ? 'bg-blue-50 text-blue-600 border-blue-200' :
              selectedGender === 'Girls' ? 'bg-pink-50 text-pink-600 border-pink-200' :
              'bg-emerald-50 text-emerald-600 border-emerald-200'
            }`}>
              {selectedGender}
              <button onClick={() => setSelectedGender('')} className="p-0.5 hover:bg-white/50 rounded cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {maxPrice && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-600 border border-amber-200">
              ≤ ₹{maxPrice}/mo
              <button onClick={() => setMaxPrice('')} className="p-0.5 hover:bg-amber-100 rounded cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedAmenities.map((a) => (
            <span
              key={a}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-teal-50 text-teal-600 border border-teal-200"
            >
              {a}
              <button onClick={() => toggleAmenity(a)} className="p-0.5 hover:bg-teal-100 rounded cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <button
            onClick={clearFilters}
            className="text-xs font-semibold text-rose-500 hover:text-rose-600 underline underline-offset-2 cursor-pointer"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" className="text-violet-500" />
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-center">
          <p className="font-semibold">{error}</p>
          <button
            onClick={fetchHostels}
            className="mt-3 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : filteredHostels.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white/50 border border-white rounded-2xl space-y-3">
          <p className="text-slate-500 font-medium">
            {activeFilterCount > 0 || searchTerm
              ? 'No hostels match your filters.'
              : 'No approved hostels found.'}
          </p>
          {(activeFilterCount > 0 || searchTerm) && (
            <button
              onClick={() => {
                clearFilters();
                setSearchTerm('');
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-violet-50 text-violet-600 rounded-xl text-xs font-semibold border border-violet-200 hover:bg-violet-100 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Filters
            </button>
          )}
        </div>
      ) : viewMode === 'map' ? (
        /* Map View */
        <div className="space-y-4">
          {mapMarkers.length === 0 ? (
            <div className="bg-white/70 backdrop-blur-xl border border-white rounded-2xl p-6 text-center space-y-2">
              <MapIcon className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm text-slate-500 font-medium">
                None of the matching hostels have location coordinates set.
              </p>
              <p className="text-xs text-slate-400">
                Switch to List view to browse all {filteredHostels.length} hostel(s).
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 px-1">
                <span className="text-xs font-semibold text-slate-400">
                  Showing {mapMarkers.length} hostel{mapMarkers.length !== 1 ? 's' : ''} on map
                </span>
                {mapMarkers.length < filteredHostels.length && (
                  <span className="text-xs text-slate-400">
                    ({filteredHostels.length - mapMarkers.length} without coordinates)
                  </span>
                )}
              </div>
              <HostelMap
                center={mapCenter}
                zoom={mapMarkers.length === 1 ? 15 : 12}
                markers={mapMarkers}
                height="500px"
              />
            </>
          )}
        </div>
      ) : (
        /* List View */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredHostels.map((hostel) => (
            <StudentHostelCard key={hostel._id} hostel={hostel} />
          ))}
        </div>
      )}
    </div>
  );
};

export default HostelsDiscoveryPage;
