 'use client';

import React, { useEffect, useRef, useState } from 'react';
import RouteNetworkPreview from './RouteNetworkPreview';

interface Station {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

interface Leg {
  mode: 'metro' | 'bus' | 'walk';
  fromStationName?: string;
  toStationName?: string;
}

interface MapPanelProps {
  stations: Station[];
  selectedStation: Station | null;
  onSelectStationId: (id: string) => void;
  activeLegs?: Leg[];
}

export default function MapPanel({
  stations,
  selectedStation,
  onSelectStationId,
  activeLegs,
}: MapPanelProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const mapRef = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);
  
  const [mapStatus, setMapStatus] = useState<'loading' | 'ready' | 'fallback'>('loading');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [routeRenderVersion, setRouteRenderVersion] = useState(0);

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const hasRoute = activeLegs && activeLegs.length > 0;
  const isInteracting = hasRoute || selectedStation !== null;

  // Dynamic Leaflet asset injector - only trigger when user begins interacting
  useEffect(() => {
    if (typeof window === 'undefined' || !isInteracting) return;
    if (mapStatus !== 'loading') return;

    let isMounted = true;

    const loadLeafletAssets = async () => {
      try {
        if ((window as any).L) {
          return (window as any).L;
        }

        // 1. Inject CSS Link (only if not already present)
        let link = document.querySelector('link[data-leaflet="true"]') as HTMLLinkElement;
        if (!link) {
          link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          link.setAttribute('data-leaflet', 'true');
          document.head.appendChild(link);
        }

        // 2. Inject JS Script (only if not already present)
        let script = document.querySelector('script[data-leaflet="true"]') as HTMLScriptElement;
        if (script) {
          return new Promise((resolve, reject) => {
            if ((window as any).L) {
              resolve((window as any).L);
              return;
            }
            const handleLoad = () => {
              if ((window as any).L) {
                resolve((window as any).L);
              } else {
                reject(new Error('Leaflet object L is missing after existing script loaded.'));
              }
            };
            const handleError = () => reject(new Error('Failed to load existing Leaflet script.'));
            script.addEventListener('load', handleLoad);
            script.addEventListener('error', handleError);
          });
        }

        script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.setAttribute('data-leaflet', 'true');
        
        const loadPromise = new Promise((resolve, reject) => {
          script.onload = () => {
            if ((window as any).L) {
              resolve((window as any).L);
            } else {
              reject(new Error('Leaflet object L is missing.'));
            }
          };
          script.onerror = () => reject(new Error('Failed to load Leaflet script.'));
        });

        document.body.appendChild(script);
        return await loadPromise;
      } catch (err: any) {
        console.warn('MapPanel: Leaflet CDN resource load blocked or failed.', err);
        throw err;
      }
    };

    loadLeafletAssets()
      .then((L) => {
        if (!isMounted) return;
        setMapStatus('ready');
      })
      .catch((err) => {
        if (!isMounted) return;
        setLoadError(err.message);
        setMapStatus('fallback');
      });

    return () => {
      isMounted = false;
    };
  }, [isInteracting, mapStatus]);

  // Map initialization effect - only trigger when mapStatus is ready and container DOM element is mounted
  useEffect(() => {
    if (mapStatus !== 'ready' || !isInteracting) {
      return;
    }

    const L = (window as any).L;
    if (L && !mapRef.current) {
      initializeMap(L);
    }

    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (err) {
          // Leaflet's remove() method may throw a TypeError if the container element has already been detached
          // from the DOM by React before the cleanup function executes. This is safe to ignore as the DOM is already clean.
          console.warn('MapPanel: Safe catch of Leaflet map remove error during unmount:', err);
        }
        mapRef.current = null;
        if (isMountedRef.current) {
          setMapInstance(null);
        }
      }
    };
  }, [mapStatus, isInteracting]);

  const initializeMap = (L: any) => {
    if (!mapContainerRef.current || mapRef.current) return;

    const defaultCenter = [10.7715, 106.6980];
    const defaultZoom = 13;

    try {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
      }).setView(defaultCenter, defaultZoom);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>',
      }).addTo(map);

      markersGroupRef.current = L.featureGroup().addTo(map);
      mapRef.current = map;
      setMapInstance(map);
    } catch (err) {
      console.error('Leaflet initialization failed:', err);
      setMapStatus('fallback');
    }
  };

  const renderMarkers = (L: any, map: any) => {
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    stations.forEach((st) => {
      const isSelected = selectedStation?.id === st.id;
      
      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div class="flex flex-col items-center select-none" style="transform: translate(-50%, -50%);">
            <div class="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-lg border-2 transition-all duration-300 ${
              isSelected 
                ? 'bg-eco-accentGreen border-white text-eco-ink scale-125 ring-4 ring-eco-primary/30 animate-pulse-glow' 
                : 'bg-eco-primary border-white text-white hover:bg-eco-primaryDeep'
            }">
              🚉
            </div>
            <div class="mt-1 px-2 py-0.5 rounded-lg bg-eco-ink text-white font-extrabold text-[9px] tracking-tight whitespace-nowrap shadow border border-white/20 select-none">
              ${st.name}
            </div>
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const marker = L.marker([st.lat, st.lng], { icon: customIcon });
      marker.on('click', () => {
        onSelectStationId(st.id);
      });
      markersGroup.addLayer(marker);
    });

    if (stations.length > 0 && !polylineRef.current) {
      map.fitBounds(markersGroup.getBounds(), { padding: [30, 30] });
    }
  };

  // Render markers reactive effect
  useEffect(() => {
    const L = (window as any).L;
    if (!L || !mapInstance) return;
    renderMarkers(L, mapInstance);
  }, [stations, selectedStation, mapInstance]);

  // Redraw polyline path route whenever active legs update
  useEffect(() => {
    const L = (window as any).L;
    if (!L || !mapInstance) return;

    // Remove existing polyline if any
    if (polylineRef.current) {
      mapInstance.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }

    if (!activeLegs || activeLegs.length === 0) return;

    const polylinesGroup = L.featureGroup().addTo(mapInstance);

    activeLegs.forEach((leg) => {
      const fromSt = stations.find((s) => s.name === leg.fromStationName);
      const toSt = stations.find((s) => s.name === leg.toStationName);
      
      if (fromSt && toSt) {
        const coords: [number, number][] = [
          [fromSt.lat, fromSt.lng],
          [toSt.lat, toSt.lng]
        ];

        let color = '#9CA3AF'; // default walk
        let dashArray: string | undefined = '6, 6';
        let weight = 4;

        if (leg.mode === 'metro') {
          color = '#0066FF';
          dashArray = undefined;
          weight = 6;
          // Add a glow backing polyline for metro
          L.polyline(coords, {
            color: '#0066FF',
            weight: 12,
            opacity: 0.25,
            lineCap: 'round',
            lineJoin: 'round',
            className: 'route-polyline',
          }).addTo(polylinesGroup);
        } else if (leg.mode === 'bus') {
          color = '#9FCE1A';
          dashArray = undefined;
          weight = 5;
          // Add a glow backing polyline for bus
          L.polyline(coords, {
            color: '#9FCE1A',
            weight: 10,
            opacity: 0.2,
            lineCap: 'round',
            lineJoin: 'round',
            className: 'route-polyline',
          }).addTo(polylinesGroup);
        }

        L.polyline(coords, {
          color,
          weight,
          dashArray,
          opacity: 0.95,
          lineCap: 'round',
          lineJoin: 'round',
          className: 'route-polyline',
        }).addTo(polylinesGroup);
      }
    });

    polylineRef.current = polylinesGroup;

    if (activeLegs.length > 0) {
      try {
        mapInstance.fitBounds(polylinesGroup.getBounds(), { padding: [40, 40] });
      } catch (err) {
        console.warn('Error fitting bounds:', err);
      }
    }

    setRouteRenderVersion(v => v + 1);
  }, [activeLegs, stations, mapInstance]);

  // Center maps on selected station when clicked
  useEffect(() => {
    if (!mapInstance || !selectedStation) return;

    mapInstance.setView([selectedStation.lat, selectedStation.lng], 15, {
      animate: true,
      duration: 1.0,
    });
  }, [selectedStation, mapInstance]);

  // If no search or selection, show the premium network schematic overlay
  if (!isInteracting) {
    return <RouteNetworkPreview />;
  }

  if (mapStatus === 'loading') {
    return (
      <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-eco-soft border border-eco-mint rounded-3xl relative">
        <div className="flex flex-col items-center space-y-3">
          <svg className="animate-spin h-9 w-9 text-eco-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-xs text-eco-muted font-bold tracking-tight">Đang tải bản đồ địa lý thực...</span>
        </div>
      </div>
    );
  }

  if (mapStatus === 'fallback') {
    return (
      <div className="w-full p-6 text-center border border-dashed border-eco-primary/30 rounded-3xl bg-amber-50/70 text-amber-900 shadow-inner flex flex-col justify-center items-center space-y-3">
        <span className="text-3xl">📴</span>
        <h4 className="text-xs font-black uppercase tracking-wider text-amber-800">Chế độ Bản đồ Ngoại tuyến</h4>
        <p className="text-[11px] leading-relaxed max-w-xs text-amber-700">
          Không thể tải bản đồ địa lý trực tuyến. EcoTransit đã chuyển đổi sang chế độ danh sách hành trình chi tiết.
        </p>
        <span className="text-[9px] text-eco-muted select-none">© OpenStreetMap contributors</span>
      </div>
    );
  }

  return (
    <div
      className="w-full h-full relative rounded-3xl overflow-hidden border border-eco-mint shadow-inner"
      data-testid={mapInstance ? "route-map-ready" : undefined}
      data-route-render-version={routeRenderVersion}
    >
      <div ref={mapContainerRef} className="w-full h-full min-h-[300px] z-0" />
      <div className="absolute top-2 left-2 z-10 bg-white/85 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[8px] text-eco-muted border border-eco-mint font-extrabold shadow-xs select-none">
        © OpenStreetMap contributors
      </div>
    </div>
  );
}
