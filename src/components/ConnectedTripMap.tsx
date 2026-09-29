import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { ConnectedTripPlan } from '../types';
import { Train, MapPin, Compass, Navigation, Maximize2 } from 'lucide-react';

interface ConnectedTripMapProps {
  tripPlan: ConnectedTripPlan;
  activeDayIndex: number;
  onSelectPlace?: (placeName: string) => void;
}

export const ConnectedTripMap: React.FC<ConnectedTripMapProps> = ({
  tripPlan,
  activeDayIndex,
  onSelectPlace,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [tripPlan.toLocation.lat, tripPlan.toLocation.lon],
        zoom: 7,
        zoomControl: true,
      });

      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution:
          '&copy; Esri, HERE, Garmin, Intermap, increment P Corp., GEBCO, USGS, FAO, NPS, NRCAN, GeoBase, IGN, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), (c) OpenStreetMap contributors | Aarambh Cultural Engine',
        maxZoom: 18,
      }).addTo(map);

      const layersGroup = L.layerGroup().addTo(map);
      layersGroupRef.current = layersGroup;
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const layers = layersGroupRef.current;
    if (!map || !layers) return;

    layers.clearLayers();

    const boundsPoints: [number, number][] = [];

    // Helper: custom icon creator
    const createMarkerIcon = (bgClass: string, textOrEmoji: string) =>
      L.divIcon({
        className: 'custom-trip-marker',
        html: `<div style="
          background: ${bgClass};
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: bold;
          box-shadow: 0 4px 12px rgba(0,0,0,0.35);
          border: 2px solid white;
        ">${textOrEmoji}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
      });

    // 1. Origin Marker
    const originLat = tripPlan.fromLocation.lat;
    const originLon = tripPlan.fromLocation.lon;
    boundsPoints.push([originLat, originLon]);

    L.marker([originLat, originLon], {
      icon: createMarkerIcon('#0f766e', '📍'),
    })
      .bindPopup(
        `<div style="font-family: inherit; font-size: 13px;">
          <strong style="color: #0f766e;">Journey Origin</strong><br/>
          <b>${tripPlan.fromLocation.placeName}</b><br/>
          <span style="color: #666; font-size: 11px;">Starting threshold</span>
        </div>`
      )
      .addTo(layers);

    // 2. Nearest Origin Station
    const origStation = tripPlan.nearestOriginStation;
    boundsPoints.push([origStation.lat, origStation.lon]);

    L.marker([origStation.lat, origStation.lon], {
      icon: createMarkerIcon('#1e293b', '🚆'),
    })
      .bindPopup(
        `<div style="font-family: inherit; font-size: 13px;">
          <strong style="color: #d97706;">Departure Station</strong><br/>
          <b>${origStation.name} (${origStation.code})</b><br/>
          <span style="color: #666; font-size: 11px;">${origStation.distanceFromLocationKm} km from origin (${origStation.driveMinutes} min)</span>
        </div>`
      )
      .addTo(layers);

    // Polyline: Origin -> Origin Station
    L.polyline(
      [
        [originLat, originLon],
        [origStation.lat, origStation.lon],
      ],
      {
        color: '#0f766e',
        weight: 3,
        opacity: 0.85,
        dashArray: '4, 6',
      }
    ).addTo(layers);

    // 3. Nearest Destination Station
    const destStation = tripPlan.nearestDestStation;
    boundsPoints.push([destStation.lat, destStation.lon]);

    L.marker([destStation.lat, destStation.lon], {
      icon: createMarkerIcon('#d97706', '🚆'),
    })
      .bindPopup(
        `<div style="font-family: inherit; font-size: 13px;">
          <strong style="color: #d97706;">Arrival Railway Station</strong><br/>
          <b>${destStation.name} (${destStation.code})</b><br/>
          <span style="color: #666; font-size: 11px;">${destStation.distanceFromLocationKm} km to heritage core</span>
        </div>`
      )
      .addTo(layers);

    // Railway Corridor Polyline (Rail Track style: Dotted amber line)
    L.polyline(
      [
        [origStation.lat, origStation.lon],
        [destStation.lat, destStation.lon],
      ],
      {
        color: '#b45309',
        weight: 4,
        opacity: 0.9,
        dashArray: '8, 8',
      }
    )
      .bindPopup(
        `<div style="font-family: inherit; font-size: 13px;">
          <strong style="color: #b45309;">Indian Railways Corridor</strong><br/>
          ${tripPlan.selectedTrain ? `<b>${tripPlan.selectedTrain.trainName} (#${tripPlan.selectedTrain.trainNumber})</b><br/>` : ''}
          ${origStation.code} ➔ ${destStation.code}
        </div>`
      )
      .addTo(layers);

    // 4. Cultural Destination Core
    const destLat = tripPlan.toLocation.lat;
    const destLon = tripPlan.toLocation.lon;
    boundsPoints.push([destLat, destLon]);

    L.marker([destLat, destLon], {
      icon: createMarkerIcon('#991b1b', '🏛️'),
    })
      .bindPopup(
        `<div style="font-family: inherit; font-size: 13px;">
          <strong style="color: #991b1b;">Cultural Destination</strong><br/>
          <b>${tripPlan.toLocation.placeName}</b><br/>
          <span style="color: #666; font-size: 11px;">Historic Core & Heritage Quarter</span>
        </div>`
      )
      .addTo(layers);

    // Polyline: Destination Station -> Heritage Core
    L.polyline(
      [
        [destStation.lat, destStation.lon],
        [destLat, destLon],
      ],
      {
        color: '#d97706',
        weight: 3.5,
        opacity: 0.85,
      }
    ).addTo(layers);

    // 5. Active Day Activities Markers & Local Trail
    const activeDay = tripPlan.days[activeDayIndex];
    if (activeDay && activeDay.activities) {
      const actCoords: [number, number][] = [];

      activeDay.activities.forEach((act, actIdx) => {
        if (act.lat && act.lon) {
          boundsPoints.push([act.lat, act.lon]);
          actCoords.push([act.lat, act.lon]);

          L.marker([act.lat, act.lon], {
            icon: createMarkerIcon(
              act.indoor ? '#4338ca' : '#d97706',
              (actIdx + 1).toString()
            ),
          })
            .bindPopup(
              `<div style="font-family: inherit; font-size: 13px;">
                <div style="font-size: 10px; font-weight: bold; color: #b45309; text-transform: uppercase;">
                  Day ${activeDay.dayNumber} • ${act.time}
                </div>
                <b>${act.placeTitle}</b><br/>
                <span style="font-size: 11px; color: #444;">${act.culturalCategory}</span><br/>
                <p style="margin: 4px 0 0 0; font-size: 11px; color: #666;">${act.description}</p>
                ${act.indoor ? '<span style="display:inline-block; margin-top:4px; padding:2px 6px; background:#e0e7ff; color:#3730a3; border-radius:4px; font-size:10px; font-weight:bold;">Covered / Indoor Experience</span>' : ''}
              </div>`
            )
            .addTo(layers);
        }
      });

      // Connect activities with walking trail line
      if (actCoords.length > 1) {
        L.polyline(actCoords, {
          color: '#4338ca',
          weight: 3,
          opacity: 0.75,
          dashArray: '3, 6',
        }).addTo(layers);
      }
    }

    // Auto-fit bounds
    if (boundsPoints.length > 1) {
      map.fitBounds(boundsPoints, { padding: [45, 45], maxZoom: 14 });
    }
  }, [tripPlan, activeDayIndex]);

  const fitFullOverview = () => {
    if (!mapInstanceRef.current) return;
    const pts: [number, number][] = [
      [tripPlan.fromLocation.lat, tripPlan.fromLocation.lon],
      [tripPlan.nearestOriginStation.lat, tripPlan.nearestOriginStation.lon],
      [tripPlan.nearestDestStation.lat, tripPlan.nearestDestStation.lon],
      [tripPlan.toLocation.lat, tripPlan.toLocation.lon],
    ];
    mapInstanceRef.current.fitBounds(pts, { padding: [50, 50] });
  };

  const focusDestination = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView(
      [tripPlan.toLocation.lat, tripPlan.toLocation.lon],
      13
    );
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-stone-200/90 shadow-sm bg-stone-100">
      {/* Top Map Control Bar */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto bg-stone-900/85 backdrop-blur-md text-stone-100 px-3.5 py-1.5 rounded-full border border-stone-700/80 shadow-md text-xs flex items-center gap-2">
          <Navigation className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-semibold">
            {tripPlan.fromLocation.placeName} ➔ {tripPlan.toLocation.placeName}
          </span>
          <span className="text-stone-400 hidden sm:inline">
            ({tripPlan.selectedTrain?.trainName || 'Rail & Local Multimodal Route'})
          </span>
        </div>

        <div className="pointer-events-auto flex items-center gap-1.5">
          <button
            onClick={fitFullOverview}
            className="px-2.5 py-1.5 rounded-xl bg-white/90 hover:bg-white text-stone-800 text-xs font-semibold shadow-md border border-stone-200 transition-colors flex items-center gap-1 cursor-pointer"
            title="Fit Entire National Voyage"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Full Route</span>
          </button>
          <button
            onClick={focusDestination}
            className="px-2.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold shadow-md transition-colors flex items-center gap-1 cursor-pointer"
            title="Focus on Destination Heritage Core"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{tripPlan.toLocation.placeName} Core</span>
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-80 sm:h-96 z-0" />

      {/* Bottom Map Legend */}
      <div className="p-3 bg-white border-t border-stone-200 text-xs flex flex-wrap items-center justify-between gap-3 text-stone-600">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-teal-700 inline-block" />
            <span>Origin</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-1 border-t-2 border-dashed border-amber-700 inline-block" />
            <span>Indian Railways Corridor</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-600 inline-block" />
            <span>Destination Station & Core</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-indigo-700 inline-block" />
            <span>Day {tripPlan.days[activeDayIndex]?.dayNumber} Cultural Trail</span>
          </span>
        </div>

        <span className="text-[11px] text-stone-400 font-mono">
          Cartography: OpenStreetMap • Routing: OSRM
        </span>
      </div>
    </div>
  );
};
