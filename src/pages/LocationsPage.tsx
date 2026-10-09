import React, { useState, useMemo } from 'react';
import {
  Search,
  MapPin,
  Building2,
  Stethoscope,
  User,
  Filter,
  Navigation,
  Phone,
  Clock,
  Star,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  ArrowRight,
  SlidersHorizontal,
  ChevronRight,
  Compass,
  CheckCircle2,
  CalendarCheck,
  RotateCcw,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { MOCK_FACILITIES, MOCK_DOCTORS } from '../data/mockData';
import { HealthcareFacility } from '../types';
import { HealthcareMap } from '../components/map/HealthcareMap';

// Haversine formula for distance calculation in kilometers
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export const LocationsPage: React.FC = () => {
  // Default coordinates: Bandra West, Mumbai
  const [userLocation, setUserLocation] = useState<[number, number]>([19.0596, 72.8295]);
  const [selectedFacility, setSelectedFacility] = useState<HealthcareFacility | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'hospital' | 'clinic' | 'doctor'>('all');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [maxDistanceKm, setMaxDistanceKm] = useState<number>(50);
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'reviews'>('distance');
  const [isLocating, setIsLocating] = useState(false);
  const [viewMode, setViewMode] = useState<'split' | 'map' | 'list'>('split');

  // Handle Geolocation request
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
        setIsLocating(false);
      },
      () => {
        // Fallback or permission denied: keep default Mumbai location
        alert('Could not fetch exact GPS location. Showing Mumbai central healthcare zone.');
        setIsLocating(false);
      },
      { timeout: 8000 }
    );
  };

  // Extract all unique specialties for filters
  const allSpecialties = useMemo(() => {
    const set = new Set<string>();
    MOCK_FACILITIES.forEach((f) => {
      f.specialties.forEach((s) => set.add(s));
    });
    return Array.from(set).sort();
  }, []);

  // Filter and sort facilities
  const filteredFacilities = useMemo(() => {
    return MOCK_FACILITIES.map((facility) => {
      const distance = calculateDistanceKm(
        userLocation[0],
        userLocation[1],
        facility.coordinates[0],
        facility.coordinates[1]
      );
      return {
        ...facility,
        distanceKm: distance,
      };
    })
      .filter((facility) => {
        // Type filter
        if (selectedType !== 'all' && facility.type !== selectedType) {
          return false;
        }

        // Emergency only filter
        if (emergencyOnly && !facility.isEmergency24x7) {
          return false;
        }

        // Rating filter
        if (minRating > 0 && facility.rating < minRating) {
          return false;
        }

        // Distance filter
        if (facility.distanceKm > maxDistanceKm) {
          return false;
        }

        // Specialty filter
        if (selectedSpecialty !== 'all') {
          const hasSpec = facility.specialties.some(
            (s) => s.toLowerCase() === selectedSpecialty.toLowerCase()
          );
          if (!hasSpec) return false;
        }

        // Search Query
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase().trim();
          const matchName = facility.name.toLowerCase().includes(query);
          const matchLocality = facility.locality.toLowerCase().includes(query);
          const matchCity = facility.city.toLowerCase().includes(query);
          const matchPin = facility.pinCode.toLowerCase().includes(query);
          const matchDoctor = facility.doctorName?.toLowerCase().includes(query);
          const matchSpecialty = facility.specialties.some((s) =>
            s.toLowerCase().includes(query)
          );

          if (!matchName && !matchLocality && !matchCity && !matchPin && !matchDoctor && !matchSpecialty) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'distance') {
          return a.distanceKm - b.distanceKm;
        }
        if (sortBy === 'rating') {
          return b.rating - a.rating;
        }
        if (sortBy === 'reviews') {
          return b.reviewCount - a.reviewCount;
        }
        return 0;
      });
  }, [
    userLocation,
    searchQuery,
    selectedType,
    selectedSpecialty,
    emergencyOnly,
    minRating,
    maxDistanceKm,
    sortBy,
  ]);

  const handleCardClick = (facility: HealthcareFacility) => {
    setSelectedFacility(facility);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedSpecialty('all');
    setEmergencyOnly(false);
    setMinRating(0);
    setMaxDistanceKm(50);
    setSortBy('distance');
    setSelectedFacility(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 p-6 md:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs font-semibold backdrop-blur-sm">
            <Compass className="w-3.5 h-3.5 text-teal-400" />
            <span>Interactive Healthcare Geospatial Navigation</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
            Find Healthcare Near You
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Locate multi-speciality tertiary hospitals, accredited diagnostic clinics, and verified doctors with real-time operational status, emergency trauma response, and direct slot booking.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={handleLocateMe}
              disabled={isLocating}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition shadow-md shadow-teal-500/20 active:scale-95 disabled:opacity-50"
            >
              <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Locating...' : 'Use My Current Location'}</span>
            </button>

            <button
              onClick={() => {
                setEmergencyOnly(true);
                setSelectedType('hospital');
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-semibold text-xs sm:text-sm rounded-xl transition"
            >
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>Find 24/7 Emergency ER</span>
            </button>
          </div>
        </div>
      </div>

      {/* Controls, Search and Filter Section */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-6 space-y-4">
        {/* Search Input Bar */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by hospital, clinic, doctor name, locality, PIN code, or specialty..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-200/60 rounded-full w-5 h-5 flex items-center justify-center"
              >
                ×
              </button>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
            >
              <option value="distance">Nearest Distance</option>
              <option value="rating">Highest Rating</option>
              <option value="reviews">Most Reviewed</option>
            </select>

            {/* Mobile View Toggle */}
            <div className="flex items-center lg:hidden bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  viewMode === 'list'
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                List
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  viewMode === 'map'
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Map
              </button>
            </div>
          </div>
        </div>

        {/* Filter Pills / Toggles */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          {/* Facility Type Filter */}
          <div className="flex flex-wrap gap-1.5 items-center mr-2">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                selectedType === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setSelectedType('hospital')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                selectedType === 'hospital'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Hospitals</span>
            </button>
            <button
              onClick={() => setSelectedType('clinic')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                selectedType === 'clinic'
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Clinics</span>
            </button>
            <button
              onClick={() => setSelectedType('doctor')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                selectedType === 'doctor'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Doctors</span>
            </button>
          </div>

          {/* 24/7 Emergency Toggle */}
          <button
            onClick={() => setEmergencyOnly(!emergencyOnly)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              emergencyOnly
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>24/7 ER Only</span>
          </button>

          {/* Radius Selector */}
          <div className="flex items-center gap-1 text-xs text-slate-600 bg-slate-100 px-2.5 py-1.5 rounded-lg">
            <span>Radius:</span>
            <select
              value={maxDistanceKm}
              onChange={(e) => setMaxDistanceKm(Number(e.target.value))}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value={5}>Within 5 km</option>
              <option value={10}>Within 10 km</option>
              <option value={20}>Within 20 km</option>
              <option value={50}>All Regional (50 km)</option>
            </select>
          </div>

          {/* Specialty Selector */}
          <div className="flex items-center gap-1 text-xs text-slate-600 bg-slate-100 px-2.5 py-1.5 rounded-lg">
            <span>Specialty:</span>
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="all">All Specialties</option>
              {allSpecialties.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>

          {/* Minimum Rating Selector */}
          <div className="flex items-center gap-1 text-xs text-slate-600 bg-slate-100 px-2.5 py-1.5 rounded-lg">
            <span>Rating:</span>
            <select
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value={0}>Any Rating</option>
              <option value={4.5}>4.5+ Stars</option>
              <option value={4.8}>4.8+ Stars</option>
            </select>
          </div>

          {/* Reset button */}
          {(searchQuery ||
            selectedType !== 'all' ||
            selectedSpecialty !== 'all' ||
            emergencyOnly ||
            minRating > 0 ||
            maxDistanceKm !== 50) && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 underline ml-auto"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Split Layout: Facility Cards + Leaflet Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Facility Cards List (6 cols on lg) */}
        <div
          className={`space-y-4 lg:col-span-6 order-2 lg:order-1 ${
            viewMode === 'map' ? 'hidden lg:block' : 'block'
          }`}
        >
          {/* Results Summary header */}
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {filteredFacilities.length} healthcare facilities found
            </span>
            <span className="text-xs text-teal-700 font-medium">
              Click any card to pinpoint on map
            </span>
          </div>

          {filteredFacilities.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">No facilities match your search</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try loosening your filters, selecting a larger radius, or searching with broader keywords.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl transition"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="space-y-3.5 max-h-[820px] overflow-y-auto pr-1">
              {filteredFacilities.map((facility) => {
                const isSelected = selectedFacility?.id === facility.id;

                return (
                  <div
                    key={facility.id}
                    onClick={() => handleCardClick(facility)}
                    className={`bg-white rounded-2xl border transition-all duration-200 p-4 sm:p-5 cursor-pointer relative group ${
                      isSelected
                        ? 'border-teal-500 ring-2 ring-teal-500/20 shadow-md bg-teal-50/10'
                        : 'border-slate-200/90 hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    {/* Top Row: Type Badge + Distance + Rating */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                            facility.type === 'hospital'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : facility.type === 'clinic'
                              ? 'bg-teal-50 text-teal-700 border border-teal-200'
                              : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}
                        >
                          {facility.type === 'hospital' ? (
                            <Building2 className="w-3 h-3" />
                          ) : facility.type === 'clinic' ? (
                            <Stethoscope className="w-3 h-3" />
                          ) : (
                            <User className="w-3 h-3" />
                          )}
                          <span>{facility.type}</span>
                        </span>

                        {facility.isEmergency24x7 && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                            24/7 ER
                          </span>
                        )}

                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Open Now</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                          <Navigation className="w-3 h-3 text-teal-600" />
                          <span>{facility.distanceKm} km</span>
                        </span>
                      </div>
                    </div>

                    {/* Facility Title & Rating */}
                    <div className="mb-2">
                      <h3 className="font-bold text-slate-900 text-base sm:text-lg group-hover:text-teal-600 transition leading-snug">
                        {facility.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <div className="flex items-center text-amber-500 font-bold gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{facility.rating}</span>
                        </div>
                        <span>•</span>
                        <span>{facility.reviewCount} patient reviews</span>
                        {facility.bedsCount && (
                          <>
                            <span>•</span>
                            <span className="text-slate-600 font-medium">
                              {facility.bedsCount} Beds
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Address & Timings */}
                    <div className="text-xs text-slate-600 space-y-1 mb-3">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>
                          {facility.address}, {facility.locality}, {facility.city} - {facility.pinCode}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{facility.openingHours}</span>
                      </div>
                    </div>

                    {/* Specialties Chips */}
                    <div className="flex flex-wrap gap-1.5 mb-3.5">
                      {facility.specialties.map((spec) => (
                        <span
                          key={spec}
                          className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>

                    {/* Connected Doctor Card if linked */}
                    {facility.doctorId && facility.doctorName && (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 mb-3.5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          {facility.doctorAvatar && (
                            <img
                              src={facility.doctorAvatar}
                              alt={facility.doctorName}
                              className="w-10 h-10 rounded-full object-cover border border-slate-300"
                            />
                          )}
                          <div>
                            <div className="text-xs font-bold text-slate-900 leading-tight">
                              {facility.doctorName}
                            </div>
                            <div className="text-[11px] text-teal-700 font-medium">
                              {facility.doctorSpecialty}
                            </div>
                            {facility.consultationFee && (
                              <div className="text-[10px] text-slate-500">
                                Fee: ₹{facility.consultationFee}
                              </div>
                            )}
                          </div>
                        </div>

                        <Link
                          to={`/booking/${facility.doctorId}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg transition shadow-xs shrink-0"
                        >
                          <CalendarCheck className="w-3.5 h-3.5" />
                          <span>Book Slot</span>
                        </Link>
                      </div>
                    )}

                    {/* Action buttons footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${facility.emergencyPhone || facility.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-slate-700 hover:text-slate-900 font-semibold px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 transition"
                        >
                          <Phone className="w-3 h-3 text-slate-500" />
                          <span>{facility.phone}</span>
                        </a>

                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${facility.coordinates[0]},${facility.coordinates[1]}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-sky-700 hover:text-sky-800 font-medium hover:underline"
                        >
                          <Navigation className="w-3 h-3 text-sky-600" />
                          <span>Directions</span>
                        </a>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFacility(facility);
                        }}
                        className="inline-flex items-center gap-1 text-teal-600 hover:text-teal-700 font-bold group-hover:translate-x-0.5 transition"
                      >
                        <span>Focus on Map</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Sticky Interactive Leaflet Map (6 cols on lg) */}
        <div
          className={`lg:col-span-6 sticky top-24 order-1 lg:order-2 ${
            viewMode === 'list' ? 'hidden lg:block' : 'block'
          }`}
        >
          <div className="h-[650px] lg:h-[780px] w-full">
            <HealthcareMap
              facilities={filteredFacilities}
              selectedFacility={selectedFacility}
              onSelectFacility={setSelectedFacility}
              userLocation={userLocation}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
