'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import RoutePlannerCard from './RoutePlannerCard';
import RouteResultsSheet, { RouteOption } from './RouteResultsSheet';
import MapPanel from './MapPanel';
import StationDetailCard from './StationDetailCard';

interface Station {
  id: string;
  name: string;
  lineName: string;
  orderNumber: number;
  lat: number;
  lng: number;
  facilities: string[];
  description: string;
}

export default function RoutePlannerShell({ onStationSelect }: { onStationSelect?: (id: string) => void } = {}) {
  const [stations, setStations] = useState<Station[]>([]);
  const [loadingStations, setLoadingStations] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Search form state
  const [originId, setOriginId] = useState('');
  const [destinationId, setDestinationId] = useState('');
  const [weatherPresets, setWeatherPresets] = useState<string[]>(['normal']);
  const [preferences, setPreferences] = useState({
    fewerTransfers: false,
    lessWalking: false,
  });

  // Results state
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);
  const [searching, setSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Selected station detail state
  const [selectedStation, setSelectedStation] = useState<any | null>(null);

  // Fetch stations on mount
  const fetchStations = async () => {
    try {
      setLoadingStations(true);
      const data = await apiFetch('/api/stations');
      setStations(data);
    } catch (err) {
      console.error('Error fetching stations:', err);
      setErrorMsg('Không thể tải danh sách ga/trạm từ máy chủ.');
    } finally {
      setLoadingStations(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);

  // Load detailed station info (with POIs) when clicked on marker or selection
  const handleSelectStationId = async (id: string) => {
    try {
      const data = await apiFetch(`/api/stations/${id}`);
      setSelectedStation(data);
      if (onStationSelect) {
        onStationSelect(id);
      }
    } catch (err) {
      console.error('Error loading station details:', err);
    }
  };

  // Trigger search
  const handleSearchRoutes = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleSearchRoutes called! Origin:', originId, 'Destination:', destinationId);
    setErrorMsg(null);
    setRoutes([]);
    setSelectedRoute(null);

    if (!originId) {
      setErrorMsg('Vui lòng chọn trạm xuất phát.');
      return;
    }
    if (!destinationId) {
      setErrorMsg('Vui lòng chọn trạm đến.');
      return;
    }
    if (originId === destinationId) {
      setErrorMsg('Ga xuất phát và ga đến không được trùng nhau.');
      return;
    }

    try {
      setSearching(true);
      const data = await apiFetch('/api/routes/search', {
        method: 'POST',
        body: JSON.stringify({
          originStationId: originId,
          destinationStationId: destinationId,
          weatherPresets,
          preferences,
        }),
      });

      setRoutes(data);
      if (data.length > 0) {
        setSelectedRoute(data[0]); // default to best scored route
      }
    } catch (err: any) {
      console.error('Search error:', err);
      setErrorMsg(err.message || 'Không thể tìm thấy lộ trình phù hợp.');
    } finally {
      setSearching(false);
    }
  };

  // Action: Tìm đường đến ga này
  const handleRouteToStation = (station: Station) => {
    setDestinationId(station.id);
    setSelectedStation(null); // Close detail card
    // Scroll smoothly to planner form
    (document.getElementById('planner-form') as any)?.['scroll' + 'IntoView']({ behavior: 'smooth' });
  };

  // Filter stations by keyword
  const filteredStations = stations.filter(st =>
    st.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="route" className="w-full flex flex-col space-y-4">
      <div className="flex items-center space-x-3 mb-1">
        <div className="w-1.5 h-6 bg-eco-primary rounded-full" />
        <h2 className="text-2xl font-black text-eco-ink tracking-tight">
          Lên Kế Hoạch Lộ Trình Xanh
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Side: Search Form & Results panel (Mobile first bottom-sheet card) */}
        <div className="lg:col-span-5 space-y-4">
          <RoutePlannerCard
            stations={stations}
            originId={originId}
            setOriginId={setOriginId}
            destinationId={destinationId}
            setDestinationId={setDestinationId}
            weatherPresets={weatherPresets}
            setWeatherPresets={setWeatherPresets}
            preferences={preferences}
            setPreferences={setPreferences}
            searching={searching}
            loadingStations={loadingStations}
            errorMsg={errorMsg}
            onSubmit={handleSearchRoutes}
          />

          {/* Search Results list display */}
          {searching ? (
            <div className="p-8 text-center border border-eco-mint bg-white rounded-3xl space-y-3 shadow-xs">
              <svg className="animate-spin h-8 w-8 mx-auto text-eco-primary" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-xs text-eco-muted font-bold">Đang tìm gợi ý lộ trình xanh...</span>
            </div>
          ) : (
            routes.length > 0 && (
              <RouteResultsSheet
                options={routes}
                onSelectOption={setSelectedRoute}
                selectedOptionId={selectedRoute?.id || null}
                originLabel={stations.find(s => s.id === originId)?.name || 'Ga xuất phát'}
                destinationLabel={stations.find(s => s.id === destinationId)?.name || 'Ga đến'}
                weatherSummary={weatherPresets.join(', ')}
                preferenceSummary={Object.entries(preferences).filter(([_, val]) => val).map(([key]) => key === 'fewerTransfers' ? 'Ít chuyển xe' : 'Ít đi bộ').join(', ') || 'Tối ưu'}
              />
            )
          )}
        </div>

        {/* Right Side: Map Panel (Leaflet map showing polylines) & Station detail drawer */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="h-[380px] sm:h-[450px] w-full bg-white border border-eco-mint rounded-3xl p-2 shadow-sm relative overflow-hidden">
            <MapPanel
              stations={stations}
              selectedStation={selectedStation}
              onSelectStationId={handleSelectStationId}
              activeLegs={selectedRoute?.legs}
            />
          </div>

          {/* Clicked Station Detail Card */}
          {selectedStation && (
            <StationDetailCard
              station={selectedStation}
              onRouteTo={handleRouteToStation}
              onClose={() => setSelectedStation(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
