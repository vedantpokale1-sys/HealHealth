import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  Star,
  MapPin,
  Video,
  Building,
  ArrowRight,
  Stethoscope,
  Globe,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

/**
 * Maps a broad specialty category (used across the site) to the specific
 * specialist titles present in the doctor directory.
 */
const SPECIALTY_MATCHERS: Record<string, (specialty: string) => boolean> = {
  Cardiology: (s) => /cardio/i.test(s),
  Dermatology: (s) => /derma|skin/i.test(s),
  Neurology: (s) => /neuro/i.test(s),
  Orthopedics: (s) => /ortho/i.test(s),
  Pediatrics: (s) => /pedia/i.test(s),
  Ophthalmology: (s) => /ophthal/i.test(s),
  Gynecology: (s) => /gynec|obstetric/i.test(s),
  'General Medicine': (s) => /general|family|physician/i.test(s),
  Casualty: (s) => /casualty|acute|emergency|fever|general/i.test(s),
};

export const DoctorDiscoveryPage: React.FC = () => {
  const { doctors } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialQuery = searchParams.get('query') || '';
  const initialCategory = searchParams.get('specialty') || '';
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [selectedType, setSelectedType] = useState<'All' | 'video' | 'in-person'>('All');
  const [sortBy, setSortBy] = useState<'rating' | 'experience' | 'fee'>('rating');

  const specialtyList = useMemo(
    () => ['All', ...Array.from(new Set(doctors.map((d) => d.specialty))).sort()],
    [doctors]
  );
  const languagesList = useMemo(
    () => ['All', ...Array.from(new Set(doctors.flatMap((d) => d.languages))).sort()],
    [doctors]
  );

  const filteredDoctors = useMemo(() => {
    const categoryMatcher = categoryFilter ? SPECIALTY_MATCHERS[categoryFilter] : undefined;
    return doctors
      .filter((doc) => {
        const q = searchTerm.toLowerCase();
        const matchesSearch =
          searchTerm === '' ||
          doc.name.toLowerCase().includes(q) ||
          doc.specialty.toLowerCase().includes(q) ||
          doc.clinic.toLowerCase().includes(q) ||
          doc.location.toLowerCase().includes(q) ||
          (doc.about && doc.about.toLowerCase().includes(q));

        const matchesCategory = !categoryMatcher || categoryMatcher(doc.specialty);
        const matchesSpecialty = selectedSpecialty === 'All' || doc.specialty === selectedSpecialty;
        const matchesLanguage = selectedLanguage === 'All' || doc.languages.includes(selectedLanguage);
        const matchesType = selectedType === 'All' || doc.consultationTypes.includes(selectedType);

        return matchesSearch && matchesCategory && matchesSpecialty && matchesLanguage && matchesType;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'experience') return b.experienceYears - a.experienceYears;
        if (sortBy === 'fee') return a.consultationFee - b.consultationFee;
        return 0;
      });
  }, [doctors, searchTerm, categoryFilter, selectedSpecialty, selectedLanguage, selectedType, sortBy]);

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setSelectedSpecialty('All');
    setSelectedLanguage('All');
    setSelectedType('All');
  };

  const hasActiveFilters =
    searchTerm !== '' ||
    categoryFilter !== '' ||
    selectedSpecialty !== 'All' ||
    selectedLanguage !== 'All' ||
    selectedType !== 'All';

  return (
    <div className="space-y-7 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-hairline">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">Find Doctors</h1>
          <p className="text-xs sm:text-sm text-ink-soft mt-1">
            Search verified specialists, filter by language or consultation type, and book instantly.
          </p>
        </div>

        <Badge variant="teal">Demo Healthcare Directory</Badge>
      </div>

      {/* Category chip when arriving from a specialty link */}
      {categoryFilter && (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">Showing:</span>
          <span className="inline-flex items-center gap-1.5 bg-brand-50 text-brand-800 border border-brand-200 px-3 py-1.5 rounded-full font-semibold">
            {categoryFilter}
            <button
              type="button"
              onClick={() => setCategoryFilter('')}
              className="hover:text-ink"
              aria-label="Clear specialty filter"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        </div>
      )}

      {/* Search and filters */}
      <Card className="p-5 shadow-soft space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by doctor name, specialty, or hospital..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-hairline rounded-lg text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-500 focus:bg-white transition"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-hairline rounded-lg text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-500"
              aria-label="Filter by specialty"
            >
              {specialtyList.map((s) => (
                <option key={s} value={s}>{s === 'All' ? 'All Specialties' : s}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-hairline rounded-lg text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-500"
              aria-label="Filter by language"
            >
              {languagesList.map((l) => (
                <option key={l} value={l}>{l === 'All' ? 'All Languages' : l}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-hairline rounded-lg text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-500"
              aria-label="Sort doctors"
            >
              <option value="rating">Top Rated</option>
              <option value="experience">Experience</option>
              <option value="fee">Lowest Fee</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-hairline text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500">Visit type:</span>
            {(['All', 'video', 'in-person'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setSelectedType(t)}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  selectedType === t
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t === 'All' ? 'All Types' : t === 'video' ? 'Video Consult' : 'Clinic Visit'}
              </button>
            ))}
          </div>

          {hasActiveFilters && (
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

      {/* Results */}
      {filteredDoctors.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-hairline p-8 space-y-3">
          <Stethoscope className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-ink">No doctors match your criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search terms or clearing selected specialty and language filters.
          </p>
          <Button variant="outline" size="sm" onClick={clearFilters}>
            Clear all filters
          </Button>
        </div>
      ) : (
        <>
          <p className="text-xs text-slate-500 font-medium">
            {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 's' : ''} found
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doc) => (
              <Card key={doc.id} hoverEffect className="p-5 flex flex-col">
                <div className="flex items-start gap-3.5 mb-4">
                  <img
                    src={doc.avatarUrl}
                    alt={doc.name}
                    className="w-16 h-16 rounded-xl object-cover border border-hairline shrink-0"
                    loading="lazy"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="text-base font-bold text-ink truncate">{doc.name}</h3>
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-700 shrink-0 bg-amber-50 px-1.5 py-0.5 rounded">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>{doc.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs font-semibold text-brand-700 mt-0.5">{doc.specialty}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">{doc.qualifications}</p>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {doc.experienceYears} yrs exp · ₹{doc.consultationFee}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-ivory rounded-lg space-y-2 text-xs border border-hairline mb-4">
                  <div className="flex items-center gap-2 text-ink-soft">
                    <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{doc.clinic}</span>
                  </div>
                  <div className="flex items-center gap-2 text-ink-soft">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{doc.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-ink-soft">
                    <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{doc.languages.join(', ')}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-hairline text-[11px]">
                    <span className="text-slate-500">Earliest opening:</span>
                    <span className="font-bold text-emerald-700">{doc.nextAvailable}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-auto pt-3 border-t border-hairline">
                  <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => navigate(`/doctors/${doc.id}`)}>
                    View Profile
                  </Button>
                  <Button
                    variant="teal"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => navigate(`/booking/${doc.id}`)}
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    Book
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
