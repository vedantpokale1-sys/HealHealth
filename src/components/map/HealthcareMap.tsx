import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { HealthcareFacility } from '../../types';
import { Building2, Stethoscope, User, Phone, Navigation, Clock, Star, ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HealthcareMapProps {
  facilities: HealthcareFacility[];
  selectedFacility: HealthcareFacility | null;
  onSelectFacility: (facility: HealthcareFacility) => void;
  userLocation: [number, number];
  zoom?: number;
}

// Controller component to smoothly fly to selected facility or user location
const MapController: React.FC<{
  targetCoords: [number, number] | null;
  zoom?: number;
}> = ({ targetCoords, zoom = 14 }) => {
  const map = useMap();

  useEffect(() => {
    if (targetCoords) {
      map.flyTo(targetCoords, zoom, {
        duration: 1.2,
        easeLinearity: 0.25,
      });
    }
  }, [targetCoords, zoom, map]);

  return null;
};

// Custom Marker Creator using L.divIcon
const createCustomIcon = (type: 'hospital' | 'clinic' | 'doctor', isSelected: boolean) => {
  let bgColor = 'bg-blue-600';
  let ringColor = 'ring-blue-400/40';
  let badgeIcon = '🏥';
  let label = 'Hospital';

  if (type === 'clinic') {
    bgColor = 'bg-teal-600';
    ringColor = 'ring-teal-400/40';
    badgeIcon = '🩺';
    label = 'Clinic';
  } else if (type === 'doctor') {
    bgColor = 'bg-purple-600';
    ringColor = 'ring-purple-400/40';
    badgeIcon = '👨‍⚕️';
    label = 'Doctor';
  }

  const selectedClasses = isSelected
    ? 'scale-125 ring-4 ring-offset-2 ring-amber-400 shadow-2xl z-50'
    : 'hover:scale-110 shadow-lg';

  const html = `
    <div class="relative flex items-center justify-center transition-transform duration-200 ${selectedClasses}">
      <div class="w-10 h-10 rounded-2xl ${bgColor} text-white flex items-center justify-center border-2 border-white shadow-md">
        <span class="text-base select-none">${badgeIcon}</span>
      </div>
      <div class="absolute -bottom-1 w-2.5 h-2.5 ${bgColor} rotate-45 border-r-2 border-b-2 border-white"></div>
      ${isSelected ? '<span class="absolute -top-1 -right-1 flex h-3 w-3"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span><span class="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span></span>' : ''}
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-map-pin',
    iconSize: [40, 44],
    iconAnchor: [20, 42],
    popupAnchor: [0, -42],
  });
};

// User Location Icon
const createUserLocationIcon = () => {
  const html = `
    <div class="relative flex items-center justify-center">
      <span class="absolute inline-flex h-8 w-8 rounded-full bg-teal-400/40 animate-ping"></span>
      <div class="w-5 h-5 rounded-full bg-teal-500 border-2 border-white shadow-lg flex items-center justify-center text-white">
        <div class="w-2 h-2 rounded-full bg-white"></div>
      </div>
    </div>
  `;
  return L.divIcon({
    html,
    className: 'custom-user-pin',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

const TILE_PROVIDERS = {
  osm: {
    name: 'OpenStreetMap Live',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
  esri: {
    name: 'Esri World Street',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, HERE, Garmin, USGS, Intermap, INCREMENT P, NRCAN, Esri Japan, METI',
    maxZoom: 18,
  },
  humanitarian: {
    name: 'Humanitarian OSM',
    url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
};

export const HealthcareMap: React.FC<HealthcareMapProps> = ({
  facilities,
  selectedFacility,
  onSelectFacility,
  userLocation,
}) => {
  const [providerKey, setProviderKey] = React.useState<'osm' | 'esri' | 'humanitarian'>('osm');
  const activeProvider = TILE_PROVIDERS[providerKey];

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm bg-slate-900">
      <MapContainer
        center={selectedFacility ? selectedFacility.coordinates : userLocation}
        zoom={13}
        scrollWheelZoom={true}
        zoomControl={false}
        className="w-full h-full z-10"
        style={{ height: '100%', minHeight: '520px', width: '100%' }}
      >
        <ZoomControl position="topright" />

        {/* 100% Free Live Map Tiles - NO API KEY REQUIRED */}
        <TileLayer
          key={providerKey}
          attribution={activeProvider.attribution}
          url={activeProvider.url}
          maxZoom={activeProvider.maxZoom}
        />

        {/* Map Controller for FlyTo animations */}
        <MapController
          targetCoords={selectedFacility ? selectedFacility.coordinates : userLocation}
          zoom={selectedFacility ? 15 : 13}
        />

        {/* User Location Marker */}
        <Marker position={userLocation} icon={createUserLocationIcon()}>
          <Popup>
            <div className="p-3 text-xs text-slate-100 min-w-[180px]">
              <div className="font-bold text-teal-300 text-sm flex items-center gap-1.5 mb-1">
                <Navigation className="w-4 h-4" />
                <span>Your Location</span>
              </div>
              <p className="text-slate-300">Searching healthcare facilities within your vicinity.</p>
            </div>
          </Popup>
        </Marker>

        {/* Facility Markers */}
        {facilities.map((facility) => {
          const isSelected = selectedFacility?.id === facility.id;
          const customIcon = createCustomIcon(facility.type, isSelected);

          return (
            <Marker
              key={facility.id}
              position={facility.coordinates}
              icon={customIcon}
              eventHandlers={{
                click: () => {
                  onSelectFacility(facility);
                },
              }}
            >
              <Popup>
                <div className="p-4 text-slate-100 max-w-sm min-w-[280px]">
                  {/* Header Badge */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        facility.type === 'hospital'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : facility.type === 'clinic'
                          ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                          : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      }`}
                    >
                      {facility.type === 'hospital' ? <Building2 className="w-3 h-3" /> : facility.type === 'clinic' ? <Stethoscope className="w-3 h-3" /> : <User className="w-3 h-3" />}
                      {facility.type}
                    </span>

                    {facility.isEmergency24x7 && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        24/7 ER
                      </span>
                    )}
                  </div>

                  {/* Title & Rating */}
                  <h4 className="font-bold text-white text-base leading-snug mb-1">
                    {facility.name}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate-300 mb-2">
                    <div className="flex items-center text-amber-400 font-semibold gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{facility.rating}</span>
                    </div>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">({facility.reviewCount} reviews)</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-emerald-400 font-medium">Open Now</span>
                  </div>

                  {/* Address & Hours */}
                  <p className="text-xs text-slate-300 mb-2 line-clamp-2">
                    {facility.address}, {facility.locality}, {facility.city} - {facility.pinCode}
                  </p>

                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
                    <Clock className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span>{facility.openingHours}</span>
                  </div>

                  {/* Specialties Pills */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {facility.specialties.slice(0, 3).map((spec) => (
                      <span
                        key={spec}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-medium"
                      >
                        {spec}
                      </span>
                    ))}
                    {facility.specialties.length > 3 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        +{facility.specialties.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Connected Doctor preview if available */}
                  {facility.doctorId && facility.doctorName && (
                    <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {facility.doctorAvatar && (
                          <img
                            src={facility.doctorAvatar}
                            alt={facility.doctorName}
                            className="w-8 h-8 rounded-full object-cover border border-teal-500/40"
                          />
                        )}
                        <div>
                          <p className="text-xs font-semibold text-white leading-tight">
                            {facility.doctorName}
                          </p>
                          <p className="text-[10px] text-teal-300">
                            {facility.doctorSpecialty}
                          </p>
                        </div>
                      </div>
                      <Link
                        to={`/booking/${facility.doctorId}`}
                        className="text-[11px] font-bold text-teal-300 hover:text-teal-200 bg-teal-500/20 px-2 py-1 rounded-lg border border-teal-500/30 transition flex items-center gap-0.5"
                      >
                        Book <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${facility.coordinates[0]},${facility.coordinates[1]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition"
                    >
                      <Navigation className="w-3.5 h-3.5 text-sky-400" />
                      <span>Directions</span>
                    </a>

                    <a
                      href={`tel:${facility.emergencyPhone || facility.phone}`}
                      className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold transition shadow-sm"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Now</span>
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Top Map Controls: Live Free Map Indicator & Style Switcher */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl px-3 py-1.5 shadow-md flex items-center gap-2 text-xs text-slate-200">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-emerald-400">Live Free Map</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300 hidden sm:inline">No API Key Needed</span>
        </div>

        {/* Map Style Switcher Chips */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-1 shadow-md flex items-center gap-1 text-xs">
          <button
            type="button"
            onClick={() => setProviderKey('osm')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              providerKey === 'osm'
                ? 'bg-teal-500 text-slate-950 font-bold shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            OpenStreetMap
          </button>
          <button
            type="button"
            onClick={() => setProviderKey('esri')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              providerKey === 'esri'
                ? 'bg-teal-500 text-slate-950 font-bold shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Esri Streets
          </button>
          <button
            type="button"
            onClick={() => setProviderKey('humanitarian')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              providerKey === 'humanitarian'
                ? 'bg-teal-500 text-slate-950 font-bold shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Humanitarian
          </button>
        </div>
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-20 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 shadow-lg text-xs text-slate-300 hidden sm:flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-blue-600 inline-block"></span>
          <span>Hospital (24/7)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-teal-600 inline-block"></span>
          <span>Specialized Clinic</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-purple-600 inline-block"></span>
          <span>Doctor Practice</span>
        </div>
      </div>
    </div>
  );
};
