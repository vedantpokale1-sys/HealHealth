import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Star,
  MapPin,
  Calendar,
  Video,
  Building,
  ArrowRight,
  Stethoscope,
  Globe,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const DoctorDiscoveryPage: React.FC = () => {
  const { doctors } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialQuery = searchParams.get('query') || '';
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [selectedType, setSelectedType] = useState<'All' | 'video' | 'in-person'>('All');
  const [sortBy, setSortBy] = useState<'rating' | 'experience' | 'fee'>('rating');

  const specialties = ['All', 'Cardiologist', 'Neurologist', 'Endocrinologist', 'Orthopedic Surgeon', 'Pulmonologist', 'General Physician'];
  const languagesList = ['All', 'English', 'Hindi', 'Marathi'];

  const filteredDoctors = useMemo(() => {
    return doctors
      .filter((doc) => {
        const matchesSearch =
          searchTerm === '' ||
          doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.clinic.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.location.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesSpecialty = selectedSpecialty === 'All' || doc.specialty === selectedSpecialty;
        const matchesLanguage = selectedLanguage === 'All' || doc.languages.includes(selectedLanguage);
        const matchesType = selectedType === 'All' || doc.consultationTypes.includes(selectedType);

        return matchesSearch && matchesSpecialty && matchesLanguage && matchesType;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'experience') return b.experienceYears - a.experienceYears;
        if (sortBy === 'fee') return a.consultationFee - b.consultationFee;
        return 0;
      });
  }, [doctors, searchTerm, selectedSpecialty, selectedLanguage, selectedType, sortBy]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSpecialty('All');
    setSelectedLanguage('All');
    setSelectedType('All');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Doctor Discovery & Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Search verified clinical specialists, filter by language or consultation format, and book instantly.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="teal">Demo Healthcare Directory</Badge>
        </div>
      </div>

      {/* Filter and Search Bar Container */}
      <Card className="p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Main search input */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by doctor name, specialty, or hospital..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
            />
          </div>

          {/* Specialty Dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            >
              {specialties.map((s) => (
                <option key={s} value={s}>{s === 'All' ? 'All Specialties' : s}</option>
              ))}
            </select>
          </div>

          {/* Language Dropdown */}
          <div className="md:col-span-2">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            >
              {languagesList.map((l) => (
                <option key={l} value={l}>{l === 'All' ? 'All Languages' : l}</option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            >
              <option value="rating">Top Rated</option>
              <option value="experience">Experience</option>
              <option value="fee">Lowest Fee</option>
            </select>
          </div>
        </div>

        {/* Quick pill filters for consultation type */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500">Visit Type:</span>
            {(['All', 'video', 'in-person'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setSelectedType(t)}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  selectedType === t
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t === 'All' ? 'All Types' : t === 'video' ? 'Video Consult' : 'Clinic Visit'}
              </button>
            ))}
          </div>

          {(searchTerm || selectedSpecialty !== 'All' || selectedLanguage !== 'All' || selectedType !== 'All') && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 text-slate-500 hover:text-rose-600 font-medium"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </Card>

      {/* Doctor Cards Grid */}
      {filteredDoctors.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
          <Stethoscope className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No doctors match your criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search terms or clearing selected specialty and language filters.
          </p>
          <Button variant="outline" size="sm" onClick={clearFilters}>
            Clear all filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doc) => (
            <Card key={doc.id} hoverEffect className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start gap-3.5 mb-4">
                  <img
                    src={doc.avatarUrl}
                    alt={doc.name}
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="text-base font-bold text-slate-900 truncate">{doc.name}</h3>
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-600 shrink-0 bg-amber-50 px-1.5 py-0.5 rounded">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>{doc.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs font-semibold text-teal-600 mt-0.5">{doc.specialty}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">{doc.qualifications}</p>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {doc.experienceYears} Years Exp • ₹{doc.consultationFee}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">{doc.about}</p>

                <div className="p-3 bg-slate-50 rounded-xl space-y-2 text-xs border border-slate-100 mb-4">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{doc.clinic}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{doc.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{doc.languages.join(', ')}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-[11px]">
                    <span className="text-slate-500">Earliest opening:</span>
                    <span className="font-bold text-emerald-700">{doc.nextAvailable}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => navigate(`/doctors/${doc.id}`)}
                >
                  Doctor Details
                </Button>
                <Button
                  variant="teal"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => navigate(`/booking/${doc.id}`)}
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Book Slot
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
