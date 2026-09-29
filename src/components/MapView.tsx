import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import {
  getRoute,
  fetchNearbyTravelers,
  submitCrowdsourceCheckin,
  likeTraveler,
  waveToTraveler,
  sendCommunityChatMessage,
} from '../services/api';
import { RouteResult, NearbyHeritageItem, MemoryTrailStop, NearbyTraveler } from '../types';
import {
  Navigation,
  Car,
  Footprints,
  AlertTriangle,
  RefreshCw,
  Compass,
  MapPin,
  Users,
  Radio,
  ThumbsUp,
  X,
  CheckCircle2,
  Sparkles,
  Plus,
  ShieldCheck,
  Eye,
  EyeOff,
  Crosshair,
  MessageCircle,
  Send,
  Heart,
  Layers,
  LocateFixed,
  Camera,
  UserCheck,
} from 'lucide-react';

interface MapViewProps {
  destination: {
    placeName: string;
    lat: number;
    lon: number;
  };
  nearbyHeritage?: NearbyHeritageItem[];
  trailStops?: MemoryTrailStop[];
  onSelectPlace?: (name: string, lat: number, lon: number) => void;
  enableFellowTravelers?: boolean;
}

// Distance in meters via Haversine Formula
function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Format distance nicely: 85m or 1.4km
function formatDistance(meters?: number): string {
  if (meters === undefined) return 'Nearby';
  if (meters < 1000) return `${meters}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

// Role color scheme
function getRoleTheme(role: string): { border: string; bg: string; text: string; badgeBg: string } {
  switch (role) {
    case 'Verified Local Guide':
      return { border: '#10b981', bg: '#ecfdf5', text: '#065f46', badgeBg: 'bg-emerald-100 text-emerald-800' };
    case 'Heritage Photographer':
      return { border: '#a855f7', bg: '#faf5ff', text: '#6b21a8', badgeBg: 'bg-purple-100 text-purple-800' };
    case 'Family Traveler':
      return { border: '#f97316', bg: '#fff7ed', text: '#9a3412', badgeBg: 'bg-orange-100 text-orange-800' };
    case 'Pilgrim':
      return { border: '#eab308', bg: '#fefce8', text: '#854d0e', badgeBg: 'bg-yellow-100 text-yellow-800' };
    case 'Artisan Custodian':
      return { border: '#14b8a6', bg: '#f0fdfa', text: '#115e59', badgeBg: 'bg-teal-100 text-teal-800' };
    default:
      return { border: '#3b82f6', bg: '#eff6ff', text: '#1e40af', badgeBg: 'bg-blue-100 text-blue-800' };
  }
}

export const MapView: React.FC<MapViewProps> = ({
  destination,
  nearbyHeritage = [],
  trailStops = [],
  onSelectPlace,
  enableFellowTravelers = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const travelersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.LayerGroup | null>(null);
  const watchPositionIdRef = useRef<number | null>(null);

  // User Geolocation States
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [locatingUser, setLocatingUser] = useState(false);
  const [isLiveTracking, setIsLiveTracking] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Map Tile & View Mode
  const [mapLayerType, setMapLayerType] = useState<'streets' | 'satellite'>('streets');

  // Routing States
  const [routeMode, setRouteMode] = useState<'driving' | 'walking'>('walking');
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [routingToTraveler, setRoutingToTraveler] = useState<NearbyTraveler | null>(null);

  // Crowdsourced Fellow Travelers States
  const [fellowTravelers, setFellowTravelers] = useState<NearbyTraveler[]>([]);
  const [showTravelers, setShowTravelers] = useState(enableFellowTravelers);
  const [travelersLoading, setTravelersLoading] = useState(false);
  const [selectedTraveler, setSelectedTraveler] = useState<NearbyTraveler | null>(null);
  const [wavingIds, setWavingIds] = useState<Record<string, boolean>>({});
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({});
  const [waveToast, setWaveToast] = useState<{ message: string; travelerName: string } | null>(null);

  // Filters: Role & Max Distance Radius
  const [travelerRoleFilter, setTravelerRoleFilter] = useState<'all' | 'solo' | 'guide' | 'photo' | 'family' | 'pilgrim'>('all');
  const [distanceRadiusFilter, setDistanceRadiusFilter] = useState<number | 'all'>('all');

  // Self Check-in Modal States
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [checkinName, setCheckinName] = useState(() => localStorage.getItem('aarambh_traveler_name') || '');
  const [checkinRole, setCheckinRole] = useState<'Solo Explorer' | 'Family Traveler' | 'Heritage Photographer' | 'Verified Local Guide' | 'Pilgrim'>('Solo Explorer');
  const [checkinStatus, setCheckinStatus] = useState('');
  const [submittingCheckin, setSubmittingCheckin] = useState(false);
  const [checkinSuccessMsg, setCheckinSuccessMsg] = useState<string | null>(null);

  // Quick Message to Traveler / Community Channel Modal
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [messageTarget, setMessageTarget] = useState<NearbyTraveler | null>(null);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageSentSuccess, setMessageSentSuccess] = useState<string | null>(null);

  // 1. Fetch Real-time Nearby Travelers
  const loadNearbyTravelers = useCallback(
    async (centerLat?: number, centerLon?: number) => {
      if (!enableFellowTravelers) return;
      try {
        setTravelersLoading(true);
        const queryLat = centerLat ?? userLocation?.lat ?? destination.lat;
        const queryLon = centerLon ?? userLocation?.lon ?? destination.lon;
        const res = await fetchNearbyTravelers(destination.placeName, destination.placeName, queryLat, queryLon);

        if (res && res.activeTravelers) {
          // Calculate dynamic distance if userLocation or query coordinates are available
          const referenceLat = centerLat ?? userLocation?.lat;
          const referenceLon = centerLon ?? userLocation?.lon;

          const list = res.activeTravelers.map((t) => {
            const travelerName = t.name || (t as any).userName || 'Fellow Traveler';
            const travelerRole = t.role || (t as any).userRole || 'Solo Explorer';
            const statusMsg = t.statusMessage || 'Exploring nearby heritage.';
            const baseItem: NearbyTraveler = {
              ...t,
              name: travelerName,
              role: travelerRole as any,
              statusMessage: statusMsg,
            };

            if (referenceLat !== undefined && referenceLon !== undefined) {
              const dist = getDistanceMeters(referenceLat, referenceLon, t.lat, t.lon);
              return { ...baseItem, distanceMeters: dist };
            }
            return baseItem;
          });
          // Sort by nearest to user
          list.sort((a, b) => (a.distanceMeters ?? 9999) - (b.distanceMeters ?? 9999));
          setFellowTravelers(list);
        }
      } catch (err) {
        console.warn('Failed to load fellow travelers on map', err);
      } finally {
        setTravelersLoading(false);
      }
    },
    [destination.placeName, destination.lat, destination.lon, userLocation, enableFellowTravelers]
  );

  // 2. Browser Geolocation API: Request position on mount
  useEffect(() => {
    let isCancelled = false;

    if (navigator.geolocation) {
      setLocatingUser(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (isCancelled) return;
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const accuracy = Math.round(pos.coords.accuracy);

          setUserLocation({ lat, lon });
          setGpsAccuracy(accuracy);
          setLocatingUser(false);
          setGeoError(null);

          // Query real-time travelers around user's exact coordinates
          loadNearbyTravelers(lat, lon);

          // If map is initialized, smoothly fly to user position
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([lat, lon], 15, { duration: 1.2 });
          }
        },
        (err) => {
          if (isCancelled) return;
          console.info('Browser geolocation request declined or timed out:', err.message);
          setLocatingUser(false);
          // Gracefully fallback to destination coordinates
          loadNearbyTravelers();
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
      );
    } else {
      loadNearbyTravelers();
    }

    return () => {
      isCancelled = true;
    };
  }, []);

  // Periodic polling for real-time presence (every 20s)
  useEffect(() => {
    const timer = setInterval(() => {
      loadNearbyTravelers();
    }, 20000);
    return () => clearInterval(timer);
  }, [loadNearbyTravelers]);

  // 3. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialLat = userLocation?.lat ?? destination.lat;
      const initialLon = userLocation?.lon ?? destination.lon;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLon],
        zoom: 15,
        zoomControl: false, // Custom placed zoom or default
      });

      // Add zoom control to top-right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Default OpenStreetMap tile layer
      const streetLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; Esri, HERE, Garmin, Intermap, increment P Corp., GEBCO, USGS, FAO, NPS, NRCAN, GeoBase, IGN, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), (c) OpenStreetMap contributors | Aarambh Crowdsource',
        maxZoom: 19,
      }).addTo(map);

      tileLayerRef.current = streetLayer;
      markersLayerRef.current = L.layerGroup().addTo(map);
      travelersLayerRef.current = L.layerGroup().addTo(map);
      userMarkerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView([destination.lat, destination.lon], 15);
    }

    return () => {
      if (watchPositionIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchPositionIdRef.current);
        watchPositionIdRef.current = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [destination.lat, destination.lon]);

  // 4. Switch Tile Layer (Street vs Satellite)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    if (mapLayerType === 'satellite') {
      tileLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: '&copy; Esri, Maxar, Earthstar Geographics | Aarambh Live',
          maxZoom: 18,
        }
      ).addTo(map);
    } else {
      tileLayerRef.current = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; Esri, HERE, Garmin, Intermap, increment P Corp., GEBCO, USGS, FAO, NPS, NRCAN, GeoBase, IGN, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), (c) OpenStreetMap contributors | Aarambh Crowdsource',
        maxZoom: 19,
      }).addTo(map);
    }
  }, [mapLayerType]);

  // 5. Render Static Heritage & Destination Centerpiece Markers
  useEffect(() => {
    const markersGroup = markersLayerRef.current;
    if (!markersGroup) return;

    markersGroup.clearLayers();

    // Primary Cultural Centerpiece Marker
    const destIcon = L.divIcon({
      className: 'custom-dest-marker',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
          <div style="
            background: linear-gradient(135deg, #b45309, #d97706);
            color: white;
            border: 3px solid white;
            border-radius: 50%;
            width: 42px;
            height: 42px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 6px 18px rgba(180, 83, 9, 0.45);
            font-size: 20px;
          ">
            🏛️
          </div>
          <div style="
            margin-top: 3px;
            background: rgba(28, 25, 23, 0.95);
            color: #fde68a;
            font-size: 10px;
            font-weight: 700;
            padding: 2px 7px;
            border-radius: 9999px;
            border: 1px solid rgba(245, 158, 11, 0.4);
            white-space: nowrap;
            box-shadow: 0 2px 8px rgba(0,0,0,0.35);
          ">
            ${destination.placeName}
          </div>
        </div>
      `,
      iconSize: [42, 60],
      iconAnchor: [21, 30],
    });

    const destMarker = L.marker([destination.lat, destination.lon], { icon: destIcon }).addTo(markersGroup);
    destMarker.bindPopup(`
      <div style="font-family: sans-serif; padding: 6px; min-width: 170px;">
        <span style="font-size: 10px; font-weight: bold; color: #b45309; text-transform: uppercase; letter-spacing: 0.5px;">Monument Center</span>
        <h4 style="margin: 2px 0 4px; font-size: 14px; font-weight: bold; color: #1c1917;">${destination.placeName}</h4>
        <p style="margin: 0; font-size: 11px; color: #78716c;">Active epicenter of living memory & crowdsourced traveler presence.</p>
      </div>
    `);

    // Nearby Heritage Sites
    nearbyHeritage.forEach((site) => {
      const siteIcon = L.divIcon({
        className: 'custom-nearby-marker',
        html: `<div style="background-color: #44403c; color: white; border: 2px solid white; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.25); font-size: 13px; cursor: pointer;">📍</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([site.lat, site.lon], { icon: siteIcon }).addTo(markersGroup);
      marker.bindPopup(`
        <div style="font-family: sans-serif; padding: 5px;">
          <h5 style="margin: 0 0 2px; font-size: 13px; font-weight: bold;">${site.name}</h5>
          <p style="margin: 0; font-size: 11px; color: #78716c;">${site.note}</p>
          <span style="font-size: 10px; color: #d97706; font-weight: bold; display: inline-block; margin-top: 4px;">~${site.distanceKm} km away</span>
        </div>
      `);
      if (onSelectPlace) {
        marker.on('click', () => onSelectPlace(site.name, site.lat, site.lon));
      }
    });

    // Memory Trail Stops
    trailStops.forEach((stop) => {
      const stopIcon = L.divIcon({
        className: 'custom-trail-marker',
        html: `<div style="background-color: #ea580c; color: white; border: 2px solid white; border-radius: 50%; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(234, 88, 12, 0.4); font-size: 11px; font-weight: bold;">${stop.order}</div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      const marker = L.marker([stop.lat, stop.lon], { icon: stopIcon }).addTo(markersGroup);
      marker.bindPopup(`
        <div style="font-family: sans-serif; padding: 5px;">
          <span style="font-size: 9px; color: #ea580c; font-weight: bold; text-transform: uppercase;">Stop #${stop.order}</span>
          <h4 style="margin: 2px 0; font-size: 13px; font-weight: bold;">${stop.name}</h4>
          <p style="margin: 0; font-size: 11px; color: #78716c;">${stop.highlight}</p>
        </div>
      `);
    });
  }, [destination, nearbyHeritage, trailStops, onSelectPlace]);

  // 6. Render User Location with Live GPS Beacon & Accuracy Halo
  useEffect(() => {
    const userLayer = userMarkerRef.current;
    if (!userLayer) return;

    userLayer.clearLayers();

    if (userLocation) {
      // Accuracy Circle
      const radius = gpsAccuracy ? Math.min(Math.max(gpsAccuracy, 15), 100) : 35;
      L.circle([userLocation.lat, userLocation.lon], {
        radius,
        color: '#2563eb',
        fillColor: '#3b82f6',
        fillOpacity: 0.14,
        weight: 1.5,
      }).addTo(userLayer);

      // High-visibility animated pulse GPS Beacon
      const userIcon = L.divIcon({
        className: 'custom-user-beacon',
        html: `
          <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background-color: rgba(37, 99, 235, 0.35); animation: ping 1.4s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: absolute; width: 22px; height: 22px; border-radius: 50%; background-color: rgba(37, 99, 235, 0.5);"></div>
            <div style="width: 14px; height: 14px; border-radius: 50%; background-color: #2563eb; border: 2.5px solid #ffffff; box-shadow: 0 3px 10px rgba(37,99,235,0.6); z-index: 5;"></div>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      const uMarker = L.marker([userLocation.lat, userLocation.lon], { icon: userIcon, zIndexOffset: 1200 }).addTo(userLayer);
      uMarker.bindPopup(`
        <div style="font-family: sans-serif; padding: 4px 6px; text-align: center;">
          <div style="font-size: 11px; font-weight: 800; color: #1d4ed8; display: flex; align-items: center; justify-content: center; gap: 4px;">
            <span>📍</span> <span>You are Here</span>
          </div>
          <div style="font-size: 10px; color: #64748b; margin-top: 2px;">
            ${userLocation.lat.toFixed(4)}°, ${userLocation.lon.toFixed(4)}°
          </div>
          ${gpsAccuracy ? `<div style="font-size: 9px; color: #10b981; font-weight: 600; margin-top: 2px;">GPS Accuracy: ±${gpsAccuracy}m</div>` : ''}
        </div>
      `);
    }
  }, [userLocation, gpsAccuracy]);

  // 7. Render Fellow Travelers Markers (Real-Time Crowdsource)
  useEffect(() => {
    const travelersLayer = travelersLayerRef.current;
    if (!travelersLayer) return;

    travelersLayer.clearLayers();

    if (!showTravelers) return;

    // Apply role and distance filters
    const filtered = fellowTravelers.filter((t) => {
      // Role Filter
      if (travelerRoleFilter === 'solo' && t.role !== 'Solo Explorer') return false;
      if (travelerRoleFilter === 'guide' && t.role !== 'Verified Local Guide') return false;
      if (travelerRoleFilter === 'photo' && t.role !== 'Heritage Photographer') return false;
      if (travelerRoleFilter === 'family' && t.role !== 'Family Traveler') return false;
      if (travelerRoleFilter === 'pilgrim' && t.role !== 'Pilgrim') return false;

      // Distance Radius Filter
      if (typeof distanceRadiusFilter === 'number' && t.distanceMeters !== undefined) {
        if (t.distanceMeters > distanceRadiusFilter) return false;
      }

      return true;
    });

    filtered.forEach((traveler) => {
      const isSelected = selectedTraveler?.id === traveler.id;
      const travelerName = traveler.name || (traveler as any).userName || 'Traveler';
      const shortName = (travelerName || 'Traveler').split(' ')[0] || travelerName;
      const roleName = traveler.role || (traveler as any).userRole || 'Explorer';
      const theme = getRoleTheme(roleName as any);
      const statusText = traveler.statusMessage || 'Exploring nearby heritage.';

      // Dynamic distance label
      const distLabel = formatDistance(traveler.distanceMeters);

      // HTML custom divIcon with animated radar ping & avatar
      const travelerIcon = L.divIcon({
        className: `traveler-marker-${traveler.id}`,
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
            <!-- Outer Pulse Glow on Top Right -->
            <span style="position: absolute; top: -3px; right: -3px; width: 11px; height: 11px; border-radius: 50%; background-color: #10b981; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite; z-index: 10;"></span>
            <span style="position: absolute; top: -3px; right: -3px; width: 11px; height: 11px; border-radius: 50%; background-color: #10b981; border: 2px solid white; z-index: 11;"></span>

            <!-- Selected Ring Halo -->
            ${
              isSelected
                ? `<span style="position: absolute; top: -5px; left: -5px; right: -5px; bottom: 12px; border-radius: 50%; border: 3px solid #f59e0b; animation: pulse 1.2s infinite; pointer-events: none;"></span>`
                : ''
            }

            <!-- Avatar Disc -->
            <div style="
              width: ${isSelected ? '42px' : '34px'};
              height: ${isSelected ? '42px' : '34px'};
              border-radius: 50%;
              background: linear-gradient(135deg, #1c1917, #292524);
              border: 3px solid ${isSelected ? '#f59e0b' : theme.border};
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: ${isSelected ? '19px' : '16px'};
              box-shadow: 0 4px 14px rgba(0,0,0,0.35);
              transition: all 0.2s ease-in-out;
            ">
              ${traveler.avatar || '🎒'}
            </div>

            <!-- Mini Name & Distance Pill -->
            <div style="
              margin-top: 3px;
              background-color: rgba(28, 25, 23, 0.94);
              color: white;
              font-size: 9.5px;
              font-weight: 700;
              padding: 1.5px 6px;
              border-radius: 9999px;
              border: 1px solid rgba(255,255,255,0.2);
              white-space: nowrap;
              box-shadow: 0 2px 6px rgba(0,0,0,0.35);
              letter-spacing: 0.2px;
              display: flex;
              align-items: center;
              gap: 3px;
            ">
              <span>${shortName}</span>
              <span style="color: #34d399; font-weight: 800;">•</span>
              <span style="color: #cbd5e1; font-size: 8.5px;">${distLabel}</span>
            </div>
          </div>
        `,
        iconSize: [44, 52],
        iconAnchor: [22, 26],
      });

      const marker = L.marker([traveler.lat, traveler.lon], {
        icon: travelerIcon,
        zIndexOffset: isSelected ? 900 : 600,
      }).addTo(travelersLayer);

      // Tooltip on Hover
      marker.bindTooltip(
        `<strong>${travelerName}</strong> (${roleName})<br/><span style="color: #64748b; font-size: 11px;">"${statusText.slice(0, 45)}..."</span>`,
        { direction: 'top', offset: [0, -18], opacity: 0.92 }
      );

      // On Click: Select traveler and open interactive floating panel
      marker.on('click', () => {
        setSelectedTraveler(traveler);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.panTo([traveler.lat, traveler.lon], { animate: true });
        }
      });
    });
  }, [fellowTravelers, showTravelers, selectedTraveler, travelerRoleFilter, distanceRadiusFilter]);

  // 8. Locate Me Button Handler (Browser Geolocation API)
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setGeoError('Browser geolocation is not supported by your device.');
      return;
    }

    setLocatingUser(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const acc = Math.round(pos.coords.accuracy);

        setUserLocation({ lat, lon });
        setGpsAccuracy(acc);
        setLocatingUser(false);

        const map = mapInstanceRef.current;
        if (map) {
          map.flyTo([lat, lon], 16, { duration: 1.2 });
        }

        // Re-query fellow travelers around user's fresh GPS coordinates
        loadNearbyTravelers(lat, lon);
      },
      (err) => {
        setLocatingUser(false);
        setGeoError(`Location access needed: ${err.message}. Showing destination area.`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // 9. Continuous GPS Live Tracking Toggle via watchPosition
  const handleToggleLiveTracking = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    if (isLiveTracking) {
      // Turn off
      if (watchPositionIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchPositionIdRef.current);
        watchPositionIdRef.current = null;
      }
      setIsLiveTracking(false);
    } else {
      // Turn on
      setLocatingUser(true);
      setGeoError(null);
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const acc = Math.round(pos.coords.accuracy);

          setUserLocation({ lat, lon });
          setGpsAccuracy(acc);
          setLocatingUser(false);
          setIsLiveTracking(true);

          // Update fellow travelers distances dynamically
          setFellowTravelers((prev) =>
            prev.map((t) => ({
              ...t,
              distanceMeters: getDistanceMeters(lat, lon, t.lat, t.lon),
            }))
          );
        },
        (err) => {
          setLocatingUser(false);
          setIsLiveTracking(false);
          setGeoError(`GPS live tracking notice: ${err.message}`);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 2000 }
      );
      watchPositionIdRef.current = watchId;
    }
  };

  // 10. Direct Live Walking/Driving Route to Destination or Fellow Traveler
  const calculateLiveRoute = async (
    targetLat: number,
    targetLon: number,
    mode: 'driving' | 'walking',
    targetName?: string
  ) => {
    if (!userLocation) {
      handleLocateMe();
      return;
    }

    setRouteLoading(true);
    setRouteError(null);

    try {
      const res = await getRoute(userLocation.lat, userLocation.lon, targetLat, targetLon, mode);
      setRouteResult(res);

      const map = mapInstanceRef.current;
      if (!map) return;

      if (routeLayerRef.current) {
        map.removeLayer(routeLayerRef.current);
        routeLayerRef.current = null;
      }

      if (res.available && res.coordinates.length > 0) {
        const polyline = L.polyline(res.coordinates, {
          color: mode === 'walking' ? '#10b981' : '#2563eb',
          weight: 5,
          opacity: 0.85,
          dashArray: mode === 'walking' ? '6, 8' : undefined,
        }).addTo(map);

        routeLayerRef.current = polyline;
        map.fitBounds(polyline.getBounds(), { padding: [60, 60] });
      } else {
        // Fallback: draw straight dashed bearing line if OSRM is unavailable
        const directCoords: [number, number][] = [
          [userLocation.lat, userLocation.lon],
          [targetLat, targetLon],
        ];
        const polyline = L.polyline(directCoords, {
          color: '#10b981',
          weight: 4,
          opacity: 0.8,
          dashArray: '4, 8',
        }).addTo(map);

        routeLayerRef.current = polyline;
        map.fitBounds(polyline.getBounds(), { padding: [60, 60] });

        const distM = getDistanceMeters(userLocation.lat, userLocation.lon, targetLat, targetLon);
        setRouteResult({
          from: 'Your GPS Location',
          to: targetName || 'Target',
          mode: 'walking',
          distanceKm: parseFloat((distM / 1000).toFixed(2)),
          durationMinutes: Math.max(1, Math.round(distM / 75)), // ~4.5 km/h walking
          coordinates: directCoords,
          available: true,
          source: 'GPS Geodesic Vector',
          message: `Direct walking vector (~${distM}m).`,
        });
      }
    } catch (err: any) {
      setRouteError('Route service temporarily busy. Direct bearing displayed.');
    } finally {
      setRouteLoading(false);
    }
  };

  // 11. Interact: Wave to Fellow Traveler (Say Hi)
  const handleWave = async (traveler: NearbyTraveler) => {
    setWavingIds((prev) => ({ ...prev, [traveler.id]: true }));
    const tName = traveler.name || (traveler as any).userName || 'Traveler';
    const shortTName = tName.split(' ')[0] || tName;
    setWaveToast({
      message: `You waved to ${shortTName}! 👋`,
      travelerName: tName,
    });

    try {
      await waveToTraveler(traveler.id, checkinName || 'Fellow Traveler');
    } catch (err) {
      console.warn('Wave notice:', err);
    }

    setTimeout(() => {
      setWavingIds((prev) => ({ ...prev, [traveler.id]: false }));
      setWaveToast(null);
    }, 3000);
  };

  // 12. Interact: Like / Give Kudos to Fellow Traveler
  const handleLike = async (traveler: NearbyTraveler) => {
    if (likedIds[traveler.id]) return;
    setLikedIds((prev) => ({ ...prev, [traveler.id]: true }));

    // Optimistically update likes
    setFellowTravelers((prev) =>
      prev.map((t) => (t.id === traveler.id ? { ...t, likes: (t.likes || 0) + 1 } : t))
    );
    if (selectedTraveler?.id === traveler.id) {
      setSelectedTraveler((prev) => (prev ? { ...prev, likes: (prev.likes || 0) + 1 } : null));
    }

    try {
      await likeTraveler(traveler.id);
    } catch (err) {
      console.warn('Like notice:', err);
    }
  };

  // 13. Interact: Send Quick Message to Fellow Traveler / Community Stream
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !messageTarget) return;

    setSendingMessage(true);
    setMessageSentSuccess(null);

    const targetName = messageTarget.name || (messageTarget as any).userName || 'Traveler';
    const shortTarget = targetName.split(' ')[0] || targetName;

    try {
      const sender = checkinName.trim() || 'Aarambh Explorer';
      await sendCommunityChatMessage({
        userName: sender,
        userRole: 'Traveler',
        channel: destination.placeName.toLowerCase().replace(/\s+/g, '-'),
        locationTag: `${destination.placeName} • Ping to ${targetName}`,
        text: `@${targetName}: ${messageText.trim()}`,
        badge: 'Live Meetup Ping 📍',
      });

      setMessageSentSuccess(`Message sent to ${shortTarget} and broadcasted to local channel!`);
      setTimeout(() => {
        setMessageModalOpen(false);
        setMessageText('');
        setMessageSentSuccess(null);
      }, 1800);
    } catch (err: any) {
      setGeoError('Could not send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  // 14. Self Check-In: Broadcast current presence on map with Geolocation
  const handleSelfCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkinName.trim()) return;

    setSubmittingCheckin(true);
    setCheckinSuccessMsg(null);

    // Use exact user GPS coordinates if locked, or slight jitter around center
    const lat = userLocation?.lat || destination.lat + (Math.random() - 0.5) * 0.002;
    const lon = userLocation?.lon || destination.lon + (Math.random() - 0.5) * 0.002;

    try {
      localStorage.setItem('aarambh_traveler_name', checkinName.trim());
      const res = await submitCrowdsourceCheckin({
        userName: checkinName.trim(),
        userRole: checkinRole,
        place: destination.placeName,
        monument: destination.placeName,
        locationName: `${destination.placeName} Perimeter`,
        statusMessage: checkinStatus.trim() || `Exploring ${destination.placeName} right now!`,
        lat,
        lon,
      });

      if (res && res.traveler) {
        setFellowTravelers((prev) => [res.traveler, ...prev]);
        setSelectedTraveler(res.traveler);
        setCheckinSuccessMsg('You are now live on the map! Fellow travelers can see your avatar.');

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lon], 16, { duration: 1 });
        }

        setTimeout(() => {
          setCheckinOpen(false);
          setCheckinSuccessMsg(null);
        }, 1500);
      }
    } catch (err: any) {
      setGeoError('Could not broadcast check-in. Please try again.');
    } finally {
      setSubmittingCheckin(false);
    }
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-stone-200/90 bg-stone-100 shadow-md">
      {/* ------------------------------------------------------------- */}
      {/* MAP HEADER TOOLBAR                                            */}
      {/* ------------------------------------------------------------- */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left: Destination & Live Fellow Travelers Badge */}
        <div className="flex items-center gap-2 pointer-events-auto flex-wrap">
          <div className="flex items-center gap-1.5 bg-stone-950/90 text-amber-300 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-lg border border-amber-500/30 text-xs font-bold">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>{destination.placeName}</span>
          </div>

          {/* Fellow Travelers Toggle Pill with Live Pulse */}
          {enableFellowTravelers && (
            <button
              onClick={() => setShowTravelers(!showTravelers)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md text-xs font-bold shadow-md border transition-all cursor-pointer ${
                showTravelers
                  ? 'bg-emerald-950/95 text-emerald-300 border-emerald-500/50 ring-1 ring-emerald-400/30'
                  : 'bg-white/95 text-stone-700 hover:bg-stone-100 border-stone-300'
              }`}
              title="Toggle Live Fellow Travelers"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {travelersLoading
                  ? 'Scanning...'
                  : `${fellowTravelers.length} Travelers Nearby`}
              </span>
              {showTravelers ? <Eye className="w-3 h-3 ml-0.5 text-emerald-400" /> : <EyeOff className="w-3 h-3 ml-0.5 text-stone-400" />}
            </button>
          )}
        </div>

        {/* Right: GPS Locate, Live Track, Tile Mode & Broadcast */}
        <div className="flex items-center gap-1.5 pointer-events-auto flex-wrap">
          {/* Join Map / Check-in CTA */}
          <button
            onClick={() => setCheckinOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold shadow-md transition-all cursor-pointer active:scale-95"
            title="Broadcast your live presence to fellow travelers"
          >
            <Plus className="w-3.5 h-3.5 text-stone-950" />
            <span className="hidden sm:inline">Join Map</span>
            <span className="sm:hidden">Check-In</span>
          </button>

          {/* Browser Geolocation Button */}
          <button
            onClick={handleLocateMe}
            disabled={locatingUser}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md text-xs font-semibold shadow-md border transition-all cursor-pointer ${
              userLocation
                ? 'bg-blue-600 text-white border-blue-500'
                : 'bg-white/95 text-stone-800 hover:bg-stone-100 border-stone-300'
            }`}
            title="Locate my position using Browser Geolocation API"
          >
            {locatingUser ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
            ) : userLocation ? (
              <LocateFixed className="w-3.5 h-3.5 text-white" />
            ) : (
              <Crosshair className="w-3.5 h-3.5 text-blue-600" />
            )}
            <span className="hidden sm:inline">
              {userLocation
                ? gpsAccuracy
                  ? `GPS (±${gpsAccuracy}m)`
                  : 'GPS Locked'
                : 'Locate Me'}
            </span>
          </button>

          {/* Continuous Live Walk Tracking Toggle */}
          <button
            onClick={handleToggleLiveTracking}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full backdrop-blur-md text-xs font-semibold shadow-md border transition-all cursor-pointer ${
              isLiveTracking
                ? 'bg-emerald-600 text-white border-emerald-500 animate-pulse'
                : 'bg-white/95 text-stone-600 hover:bg-stone-100 border-stone-300'
            }`}
            title={isLiveTracking ? 'Continuous GPS Tracking is ON' : 'Turn on Continuous GPS Walk Tracking'}
          >
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">{isLiveTracking ? 'Live Walk' : 'Track Walk'}</span>
          </button>

          {/* Tile Layer Switcher: Street vs Satellite */}
          <button
            onClick={() => setMapLayerType(mapLayerType === 'streets' ? 'satellite' : 'streets')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full backdrop-blur-md text-xs font-semibold shadow-md border transition-all cursor-pointer ${
              mapLayerType === 'satellite'
                ? 'bg-stone-900 text-amber-300 border-amber-500/40'
                : 'bg-white/95 text-stone-700 hover:bg-stone-100 border-stone-300'
            }`}
            title={`Switch to ${mapLayerType === 'streets' ? 'Satellite World Imagery' : 'Street Map'}`}
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden lg:inline">{mapLayerType === 'streets' ? 'Satellite' : 'Street'}</span>
          </button>

          {/* Route Mode Switcher (Walk / Drive) */}
          <div className="bg-white/95 backdrop-blur-md p-0.5 rounded-full shadow-md border border-stone-200 flex items-center text-xs">
            <button
              onClick={() => {
                setRouteMode('walking');
                if (routingToTraveler) {
                  calculateLiveRoute(routingToTraveler.lat, routingToTraveler.lon, 'walking', routingToTraveler.name);
                } else if (userLocation) {
                  calculateLiveRoute(destination.lat, destination.lon, 'walking');
                }
              }}
              className={`px-2 py-1 rounded-full transition-colors cursor-pointer flex items-center gap-1 ${
                routeMode === 'walking' ? 'bg-amber-600 text-white font-bold' : 'text-stone-600 hover:text-stone-900'
              }`}
              title="Walking Route"
            >
              <Footprints className="w-3 h-3" />
              <span className="hidden lg:inline">Walk</span>
            </button>
            <button
              onClick={() => {
                setRouteMode('driving');
                if (routingToTraveler) {
                  calculateLiveRoute(routingToTraveler.lat, routingToTraveler.lon, 'driving', routingToTraveler.name);
                } else if (userLocation) {
                  calculateLiveRoute(destination.lat, destination.lon, 'driving');
                }
              }}
              className={`px-2 py-1 rounded-full transition-colors cursor-pointer flex items-center gap-1 ${
                routeMode === 'driving' ? 'bg-amber-600 text-white font-bold' : 'text-stone-600 hover:text-stone-900'
              }`}
              title="Driving Route"
            >
              <Car className="w-3 h-3" />
              <span className="hidden lg:inline">Drive</span>
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* FILTER CHIPS (Role & Radius Filters)                          */}
      {/* ------------------------------------------------------------- */}
      {showTravelers && fellowTravelers.length > 0 && (
        <div className="absolute top-14 left-3 z-[1000] flex items-center gap-1.5 pointer-events-auto overflow-x-auto max-w-[90vw] pb-1 scrollbar-none">
          {/* Role Filters */}
          {(['all', 'solo', 'guide', 'photo', 'family', 'pilgrim'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setTravelerRoleFilter(filter)}
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-md transition-all shadow-xs border cursor-pointer shrink-0 ${
                travelerRoleFilter === filter
                  ? 'bg-stone-900 text-amber-300 border-amber-500/50 shadow-sm'
                  : 'bg-white/95 text-stone-700 hover:bg-stone-100 border-stone-200'
              }`}
            >
              {filter === 'all' && `All Roles (${fellowTravelers.length})`}
              {filter === 'solo' && `🎒 Solo`}
              {filter === 'guide' && `🧭 Guides`}
              {filter === 'photo' && `📸 Photographers`}
              {filter === 'family' && `👨‍👩‍👧 Families`}
              {filter === 'pilgrim' && `🪔 Pilgrims`}
            </button>
          ))}

          {/* Distance Filter Divider */}
          <div className="h-4 w-px bg-stone-300 shrink-0 mx-1" />

          {/* Radius Filter */}
          {([ 'all', 200, 500, 1500 ] as const).map((rad) => (
            <button
              key={rad.toString()}
              onClick={() => setDistanceRadiusFilter(rad)}
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-md transition-all shadow-xs border cursor-pointer shrink-0 ${
                distanceRadiusFilter === rad
                  ? 'bg-emerald-900 text-emerald-200 border-emerald-500'
                  : 'bg-white/90 text-stone-600 hover:bg-stone-100 border-stone-200'
              }`}
            >
              {rad === 'all' ? 'Any Distance' : `< ${rad}m`}
            </button>
          ))}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* FLOATING INTERACTIVE CARD: SELECTED FELLOW TRAVELER           */}
      {/* ------------------------------------------------------------- */}
      {selectedTraveler && (
        <div className="absolute bottom-4 left-3 right-3 sm:left-4 sm:right-auto sm:max-w-md z-[1000] bg-white/98 backdrop-blur-md p-4 rounded-3xl shadow-2xl border border-stone-200 animate-fade-in text-stone-900">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-stone-900 border-2 border-amber-500 text-2xl flex items-center justify-center shadow-md shrink-0">
                {selectedTraveler.avatar || '🎒'}
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="font-bold text-sm sm:text-base text-stone-950 font-serif leading-tight">
                    {selectedTraveler.name}
                  </h4>
                  {selectedTraveler.verifiedTourist && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                      <ShieldCheck className="w-2.5 h-2.5" />
                      Verified
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5 flex-wrap">
                  <span className={`font-semibold px-1.5 py-0.2 rounded-md text-[10px] ${getRoleTheme(selectedTraveler.role).badgeBg}`}>
                    {selectedTraveler.role}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-mono text-[11px] text-emerald-700 font-bold">
                    <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-500" />
                    {selectedTraveler.distanceMeters !== undefined
                      ? `${selectedTraveler.distanceMeters}m away`
                      : 'Nearby'}
                  </span>
                  <span>•</span>
                  <span>{selectedTraveler.checkedInAgo}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedTraveler(null)}
              className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center cursor-pointer shrink-0"
              title="Close card"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Traveler Status Message */}
          <div className="mt-2.5 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs text-stone-800 italic leading-relaxed">
            "{selectedTraveler.statusMessage}"
          </div>

          {/* Action Buttons: Wave, Like, Message, Meetup Route */}
          <div className="mt-3 flex items-center gap-2 pt-2 border-t border-stone-100 flex-wrap sm:flex-nowrap">
            {/* Wave / Say Hi */}
            <button
              onClick={() => handleWave(selectedTraveler)}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                wavingIds[selectedTraveler.id]
                  ? 'bg-amber-500 text-stone-950 scale-105'
                  : 'bg-stone-900 hover:bg-stone-800 text-amber-300'
              }`}
              title="Send a friendly wave to this traveler"
            >
              <span>👋</span>
              <span>{wavingIds[selectedTraveler.id] ? 'Waved! ✨' : 'Say Hi'}</span>
            </button>

            {/* Like Kudos */}
            <button
              onClick={() => handleLike(selectedTraveler)}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                likedIds[selectedTraveler.id]
                  ? 'bg-rose-50 text-rose-600 border-rose-300'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-200'
              }`}
              title="Give kudos"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>{selectedTraveler.likes || 0}</span>
            </button>

            {/* Quick Message / Chat Ping */}
            <button
              onClick={() => {
                setMessageTarget(selectedTraveler);
                setMessageModalOpen(true);
              }}
              className="py-1.5 px-3 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Send a quick note or question to this traveler"
            >
              <MessageCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>Ping</span>
            </button>

            {/* Meet Up / Route to Traveler */}
            <button
              onClick={() => {
                setRoutingToTraveler(selectedTraveler);
                calculateLiveRoute(selectedTraveler.lat, selectedTraveler.lon, 'walking', selectedTraveler.name);
              }}
              className="py-1.5 px-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Calculate walking directions to meet up with this traveler"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Meet Up</span>
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* WAVE CONFIRMATION POPUP TOAST                                 */}
      {/* ------------------------------------------------------------- */}
      {waveToast && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[1100] bg-stone-900/95 text-amber-300 px-4 py-2 rounded-full shadow-2xl border border-amber-500/50 flex items-center gap-2 text-xs font-bold animate-bounce">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{waveToast.message}</span>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* ROUTE INFO OVERLAY BANNER                                     */}
      {/* ------------------------------------------------------------- */}
      {routeResult && routeResult.available && (
        <div className="absolute top-20 left-3 sm:left-4 z-[1000] bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-stone-200 text-xs text-stone-800 max-w-xs">
          <div className="flex items-center justify-between font-semibold mb-1">
            <span className="flex items-center gap-1 text-emerald-800 font-bold">
              {routeResult.mode === 'walking' ? <Footprints className="w-3.5 h-3.5" /> : <Car className="w-3.5 h-3.5" />}
              {routingToTraveler
                ? `Meetup Route to ${(routingToTraveler.name || (routingToTraveler as any).userName || 'Traveler').split(' ')[0]}`
                : `Route to ${destination.placeName}`}
            </span>
            <button
              onClick={() => {
                setRouteResult(null);
                setRoutingToTraveler(null);
                if (routeLayerRef.current && mapInstanceRef.current) {
                  mapInstanceRef.current.removeLayer(routeLayerRef.current);
                  routeLayerRef.current = null;
                }
              }}
              className="text-stone-400 hover:text-stone-700 cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="flex items-center gap-3 text-sm font-bold text-stone-900 mt-1">
            <div>
              <span className="text-lg text-emerald-700">
                {routeResult.distanceKm < 1 ? `${Math.round(routeResult.distanceKm * 1000)}m` : `${routeResult.distanceKm}km`}
              </span>
            </div>
            <div className="w-px h-5 bg-stone-200" />
            <div>
              <span className="text-lg text-emerald-700">{routeResult.durationMinutes}</span>{' '}
              <span className="text-[11px] font-normal text-stone-500">mins ({routeResult.mode})</span>
            </div>
          </div>
          {routeResult.message && (
            <div className="text-[10px] text-stone-500 mt-1 leading-snug">{routeResult.message}</div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* ERROR / NOTICE BANNER                                         */}
      {/* ------------------------------------------------------------- */}
      {(routeError || geoError) && (
        <div className="absolute bottom-4 left-3 right-3 sm:max-w-md z-[1000] bg-amber-50/95 border border-amber-200 p-2.5 rounded-2xl shadow-lg text-xs text-amber-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>{routeError || geoError}</span>
          </div>
          <button
            onClick={() => {
              setRouteError(null);
              setGeoError(null);
            }}
            className="text-stone-500 hover:text-stone-800 font-bold ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SEND QUICK MESSAGE MODAL                                      */}
      {/* ------------------------------------------------------------- */}
      {messageModalOpen && messageTarget && (
        <div className="absolute inset-0 z-[1200] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 max-w-sm w-full p-5 space-y-4 animate-scale-in text-stone-900">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2 font-serif font-bold text-base text-stone-900">
                <MessageCircle className="w-4 h-4 text-blue-600" />
                <span>Message {messageTarget.name}</span>
              </div>
              <button
                onClick={() => setMessageModalOpen(false)}
                className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {messageSentSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="text-xs font-bold">{messageSentSuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="space-y-3 text-xs">
                <div>
                  <label className="block text-stone-600 font-medium mb-1">
                    Quick inquiries to fellow traveler around {destination.placeName}:
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {[
                      'How long is the ticket queue right now? ⏱️',
                      'Want to team up & explore together? 🚶',
                      'Are photography bags allowed inside? 📸',
                      'Any good authentic food spots nearby? 🍛',
                    ].map((preset) => (
                      <button
                        type="button"
                        key={preset}
                        onClick={() => setMessageText(preset)}
                        className="px-2 py-1 bg-stone-100 hover:bg-amber-50 text-stone-700 hover:text-amber-900 rounded-lg text-[10.5px] border border-stone-200 transition-colors text-left"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>

                  <textarea
                    rows={3}
                    required
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder={`Type your live question or meetup note for ${messageTarget.name}...`}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                  />
                </div>

                <div className="text-[11px] text-stone-500">
                  Broadcasts directly to the live Aarambh traveler chat stream for {destination.placeName}.
                </div>

                <button
                  type="submit"
                  disabled={sendingMessage || !messageText.trim()}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {sendingMessage ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <Send className="w-4 h-4 text-white" />
                  )}
                  <span>Send Traveler Ping</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SELF CHECK-IN MODAL                                           */}
      {/* ------------------------------------------------------------- */}
      {checkinOpen && (
        <div className="absolute inset-0 z-[1200] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 max-w-sm w-full p-5 space-y-4 animate-scale-in text-stone-900">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2 text-stone-900 font-serif font-bold text-base">
                <span>📍</span>
                <span>Join the Live Crowd Map</span>
              </div>
              <button
                onClick={() => setCheckinOpen(false)}
                className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {checkinSuccessMsg ? (
              <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="text-xs font-bold">{checkinSuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleSelfCheckin} className="space-y-3 text-xs">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Your Name / Traveler Handle</label>
                  <input
                    type="text"
                    required
                    value={checkinName}
                    onChange={(e) => setCheckinName(e.target.value)}
                    placeholder="e.g. Ankit Sharma"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">Your Traveler Role</label>
                  <select
                    value={checkinRole}
                    onChange={(e: any) => setCheckinRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  >
                    <option value="Solo Explorer">Solo Explorer 🎒</option>
                    <option value="Heritage Photographer">Heritage Photographer 📸</option>
                    <option value="Family Traveler">Family Traveler 👨‍👩‍👧</option>
                    <option value="Verified Local Guide">Verified Local Guide 🧭</option>
                    <option value="Pilgrim">Pilgrim / Spiritual Seeker 🪔</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">Status Message / Live Tip</label>
                  <textarea
                    rows={2}
                    value={checkinStatus}
                    onChange={(e) => setCheckinStatus(e.target.value)}
                    placeholder={`e.g. Just reached ${destination.placeName}! Light is beautiful, queue moving fast.`}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                  />
                </div>

                <div className="text-[11px] text-stone-500 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-blue-500" />
                  <span>
                    Location:{' '}
                    {userLocation
                      ? `GPS Locked (${userLocation.lat.toFixed(3)}°, ${userLocation.lon.toFixed(3)}°)`
                      : `${destination.placeName} Perimeter`}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={submittingCheckin}
                  className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-300 font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {submittingCheckin ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                  ) : (
                    <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                  )}
                  <span>Broadcast My Marker to Map</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* LEAFLET DOM CONTAINER                                         */}
      {/* ------------------------------------------------------------- */}
      <div ref={mapContainerRef} className="w-full h-80 sm:h-[440px] z-0" />
    </div>
  );
};
