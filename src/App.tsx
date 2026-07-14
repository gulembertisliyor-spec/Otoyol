import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import { 
  Navigation, 
  MapPin, 
  Car, 
  Search, 
  Truck, 
  BusFront, 
  Flame, 
  Calculator, 
  DollarSign, 
  Route as RouteIcon, 
  Clock, 
  Compass, 
  Sparkles, 
  CreditCard, 
  Info, 
  AlertTriangle, 
  RefreshCw, 
  Map as MapIcon,
  HelpCircle,
  TrendingUp,
  FileText,
  History,
  Trash2,
  Bookmark
} from "lucide-react";
import { VEHICLE_CLASSES, VEHICLE_CLASSES as vehicleClasses } from "./tollData";

interface LocationInfo {
  name: string;
  lat: number;
  lng: number;
}

interface CrossedBridge {
  id: string;
  name: string;
  toll: number;
  operator: string;
  description: string;
  timeSavedMinutes: number;
}

interface CrossedHighway {
  code: string;
  name: string;
  distanceKm: number;
  toll: number;
  operator: string;
  description: string;
}

interface TollCalculationResult {
  routeGeometry: [number, number][];
  totalDistanceKm: number;
  totalDurationMinutes: number;
  crossedBridges: CrossedBridge[];
  crossedHighways: CrossedHighway[];
  totalToll: number;
  vehicleClassInfo: {
    id: number;
    name: string;
    description: string;
    example: string;
  };
  usedFallback: boolean;
}

const VEHICLE_BRANDS = [
  "Fiat", "Renault", "Volkswagen", "Toyota", "Ford", "Hyundai", "Peugeot", "Opel", "Honda", "BMW", "Mercedes-Benz", "TOGG", "Tesla", "Chery", "Diger"
];

const VEHICLE_YEARS = [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2012, 2010, 2008, 2005, 2000, 1995];

const ENGINE_OPTIONS = [
  { id: "1.0_1.2_benzin", label: "1.0 - 1.2 Litre Benzinli", baseConsumption: 5.6, defaultFuelPrice: 45.20 },
  { id: "1.4_1.6_benzin", label: "1.4 - 1.6 Litre Benzinli", baseConsumption: 6.8, defaultFuelPrice: 45.20 },
  { id: "1.3_1.6_dizel", label: "1.3 - 1.6 Litre Dizel", baseConsumption: 4.9, defaultFuelPrice: 44.80 },
  { id: "1.8_2.0_hybrid", label: "1.8 - 2.0 Litre Hibrit", baseConsumption: 4.2, defaultFuelPrice: 45.20 },
  { id: "electric", label: "Tam Elektrikli (EV)", baseConsumption: 17.5, defaultFuelPrice: 8.50, isElectric: true },
  { id: "large_motor", label: "2.0+ Litre Büyük Motor", baseConsumption: 9.8, defaultFuelPrice: 45.20 },
];

const getEstimatedConsumption = (brand: string, year: number, engineId: string) => {
  const engine = ENGINE_OPTIONS.find(e => e.id === engineId) || ENGINE_OPTIONS[1];
  let consumption = engine.baseConsumption;
  const isElectric = !!engine.isElectric;

  if (isElectric) {
    let factor = 1.0;
    if (year >= 2024) factor *= 0.95;
    else if (year <= 2018) factor *= 1.10;
    if (brand === "Tesla" || brand === "TOGG") factor *= 0.98;
    else if (brand === "BMW" || brand === "Mercedes-Benz") factor *= 1.05;
    return { consumption: parseFloat((consumption * factor).toFixed(1)), isElectric };
  }

  let yearMultiplier = 1.0;
  if (year >= 2023) yearMultiplier = 0.92;
  else if (year >= 2018) yearMultiplier = 0.98;
  else if (year >= 2010) yearMultiplier = 1.10;
  else yearMultiplier = 1.25;

  let brandMultiplier = 1.0;
  if (brand === "Toyota" || brand === "Honda") brandMultiplier = 0.94;
  if (brand === "Fiat" || brand === "Renault" || brand === "Hyundai") brandMultiplier = 0.98;
  if (brand === "BMW" || brand === "Mercedes-Benz") brandMultiplier = 1.08;

  consumption = consumption * yearMultiplier * brandMultiplier;
  return { consumption: parseFloat(consumption.toFixed(1)), isElectric };
};

export default function App() {
  // Input states
  const [startQuery, setStartQuery] = useState("");
  const [endQuery, setEndQuery] = useState("");
  const [startLocation, setStartLocation] = useState<LocationInfo | null>(null);
  const [endLocation, setEndLocation] = useState<LocationInfo | null>(null);
  const [vehicleClass, setVehicleClass] = useState<number>(1);
  
  // Search suggestion states
  const [startSuggestions, setStartSuggestions] = useState<any[]>([]);
  const [endSuggestions, setEndSuggestions] = useState<any[]>([]);
  const [isSearchingStart, setIsSearchingStart] = useState(false);
  const [isSearchingEnd, setIsSearchingEnd] = useState(false);
  const [showStartDropdown, setShowStartDropdown] = useState(false);
  const [showEndDropdown, setShowEndDropdown] = useState(false);

  // Map clicking state for choosing point from map
  const [selectingPointMode, setSelectingPointMode] = useState<"start" | "end" | null>(null);

  // Vehicle Details state
  const [vehicleBrand, setVehicleBrand] = useState<string>("Volkswagen");
  const [vehicleYear, setVehicleYear] = useState<number>(2022);
  const [vehicleEngine, setVehicleEngine] = useState<string>("1.4_1.6_benzin");

  // Fuel calculation states
  const [avgFuelConsumption, setAvgFuelConsumption] = useState<number>(6.8); // Liters / 100km or kWh/100km
  const [fuelPrice, setFuelPrice] = useState<number>(45.20); // TL per liter or TL per kWh
  
  // Trip History state
  const [tripHistory, setTripHistory] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("yolucreti_trip_history");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Track if current route was loaded from history
  const isLoadedFromHistoryRef = useRef<boolean>(false);

  // Auto-estimate consumption when vehicle specs change
  useEffect(() => {
    const { consumption } = getEstimatedConsumption(vehicleBrand, vehicleYear, vehicleEngine);
    setAvgFuelConsumption(consumption);
    
    const selectedEngine = ENGINE_OPTIONS.find(e => e.id === vehicleEngine);
    if (selectedEngine) {
      setFuelPrice(selectedEngine.defaultFuelPrice);
    }
  }, [vehicleBrand, vehicleYear, vehicleEngine]);
  
  // Calculation result states
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TollCalculationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // AI insights states
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);

  // Leaflet map refs
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const startMarkerRef = useRef<L.Marker | null>(null);
  const endMarkerRef = useRef<L.Marker | null>(null);

  // Popular routes for quick click testing
  const POPULAR_ROUTES = [
    {
      name: "İstanbul ➔ İzmir (Osmangazi Köprüsü Üzerinden)",
      start: { name: "İstanbul", lat: 41.0082, lng: 28.9784 },
      end: { name: "İzmir", lat: 38.4192, lng: 27.1287 }
    },
    {
      name: "İstanbul ➔ Ankara (Anadolu Otoyolu)",
      start: { name: "İstanbul", lat: 41.0082, lng: 28.9784 },
      end: { name: "Ankara", lat: 39.9334, lng: 32.8597 }
    },
    {
      name: "Ankara ➔ Niğde (O-21 Akıllı Otoyolu)",
      start: { name: "Ankara", lat: 39.9334, lng: 32.8597 },
      end: { name: "Niğde", lat: 37.9698, lng: 34.6766 }
    },
    {
      name: "İzmir ➔ Çeşme",
      start: { name: "İzmir", lat: 38.4192, lng: 27.1287 },
      end: { name: "Çeşme", lat: 38.3246, lng: 26.3031 }
    }
  ];

  // Initialize Leaflet map
  useEffect(() => {
    if (mapContainerRef.current && !mapInstanceRef.current) {
      // Create map centered on Turkey
      const map = L.map(mapContainerRef.current, {
        center: [38.9637, 35.2433],
        zoom: 6,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
      }).addTo(map);

      mapInstanceRef.current = map;

      // Handle map clicks for selecting coordinates
      map.on("click", (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        // Check if we are in point selection mode
        setSelectingPointMode((currentMode) => {
          if (currentMode === "start") {
            const formattedName = `${lat.toFixed(4)}, ${lng.toFixed(4)} (Haritadan Seçildi)`;
            setStartLocation({ name: formattedName, lat, lng });
            setStartQuery(formattedName);
            return null; // reset mode
          } else if (currentMode === "end") {
            const formattedName = `${lat.toFixed(4)}, ${lng.toFixed(4)} (Haritadan Seçildi)`;
            setEndLocation({ name: formattedName, lat, lng });
            setEndQuery(formattedName);
            return null; // reset mode
          }
          return currentMode;
        });
      });
    }

    return () => {
      // Clean up map instance on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map markers when start/end locations change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Bulletproof custom div icons
    const createMarkerIcon = (color: string, label: string) => {
      return L.divIcon({
        html: `
          <div class="relative flex items-center justify-center">
            <span class="absolute inline-flex h-6 w-6 animate-ping rounded-full opacity-75" style="background-color: ${color};"></span>
            <div class="relative flex h-8 w-8 items-center justify-center rounded-full text-white font-bold shadow-lg text-xs" style="background-color: ${color}; border: 2px solid white;">
              ${label}
            </div>
          </div>
        `,
        className: "custom-div-icon",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
    };

    // Handle Start Marker
    if (startLocation) {
      if (startMarkerRef.current) {
        startMarkerRef.current.setLatLng([startLocation.lat, startLocation.lng]);
      } else {
        startMarkerRef.current = L.marker([startLocation.lat, startLocation.lng], {
          icon: createMarkerIcon("#22c55e", "B"), // B for Başlangıç (Start)
        }).addTo(map);
      }
      startMarkerRef.current.bindPopup(`<b>Başlangıç:</b><br/>${startLocation.name}`).openPopup();
    } else {
      if (startMarkerRef.current) {
        startMarkerRef.current.remove();
        startMarkerRef.current = null;
      }
    }

    // Handle End Marker
    if (endLocation) {
      if (endMarkerRef.current) {
        endMarkerRef.current.setLatLng([endLocation.lat, endLocation.lng]);
      } else {
        endMarkerRef.current = L.marker([endLocation.lat, endLocation.lng], {
          icon: createMarkerIcon("#ef4444", "A"), // A for Atış / Bitiş (End)
        }).addTo(map);
      }
      endMarkerRef.current.bindPopup(`<b>Bitiş:</b><br/>${endLocation.name}`);
    } else {
      if (endMarkerRef.current) {
        endMarkerRef.current.remove();
        endMarkerRef.current = null;
      }
    }

    // Adjust view to fit markers if both exist
    if (startLocation && endLocation) {
      const bounds = L.latLngBounds(
        [startLocation.lat, startLocation.lng],
        [endLocation.lat, endLocation.lng]
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (startLocation) {
      map.setView([startLocation.lat, startLocation.lng], 10);
    } else if (endLocation) {
      map.setView([endLocation.lat, endLocation.lng], 10);
    }
  }, [startLocation, endLocation]);

  // Handle drawing the route polyline
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (routePolylineRef.current) {
      routePolylineRef.current.remove();
      routePolylineRef.current = null;
    }

    if (result && result.routeGeometry && result.routeGeometry.length > 0) {
      const polyline = L.polyline(result.routeGeometry, {
        color: "#f97316",
        weight: 6,
        opacity: 0.8,
        dashArray: result.usedFallback ? "5, 10" : undefined, // dashed line if fallback simulated route
      }).addTo(map);

      routePolylineRef.current = polyline;

      // Fit bounds to show entire polyline
      const bounds = polyline.getBounds();
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [result]);

  // Geocoding search via Nominatim
  const searchLocation = async (query: string, type: "start" | "end") => {
    if (!query || query.trim().length < 3) return;

    if (type === "start") {
      setIsSearchingStart(true);
      setShowStartDropdown(true);
    } else {
      setIsSearchingEnd(true);
      setShowEndDropdown(true);
    }

    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ", Turkey")}&format=json&limit=5&addressdetails=1`;
      const response = await fetch(url, {
        headers: {
          "Accept-Language": "tr-TR,tr;q=0.9"
        }
      });
      if (response.ok) {
        const data = await response.json();
        
        // Format names nicely for Turkish display
        const formattedResults = data.map((item: any) => {
          const displayName = item.display_name;
          // Extract specific city/state labels for cleaner look
          const address = item.address;
          const labelParts = [];
          if (address.road) labelParts.push(address.road);
          if (address.suburb) labelParts.push(address.suburb);
          if (address.town) labelParts.push(address.town);
          if (address.city || address.province) labelParts.push(address.city || address.province);
          if (address.state) labelParts.push(address.state);

          const cleanerName = labelParts.length > 0 
            ? labelParts.join(", ") 
            : displayName.split(",").slice(0, 3).join(",");

          return {
            name: cleanerName,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon)
          };
        });

        if (type === "start") {
          setStartSuggestions(formattedResults);
        } else {
          setEndSuggestions(formattedResults);
        }
      }
    } catch (err) {
      console.error("Geocoding failed:", err);
    } finally {
      if (type === "start") {
        setIsSearchingStart(false);
      } else {
        setIsSearchingEnd(false);
      }
    }
  };

  // Save current trip to local storage history list
  const saveTripToHistory = (calcResult: TollCalculationResult, insightsText: string | null) => {
    if (isLoadedFromHistoryRef.current) return;
    if (!startLocation || !endLocation) return;

    const newTrip = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString("tr-TR"),
      startQuery: startQuery || startLocation.name,
      endQuery: endQuery || endLocation.name,
      startLocation: startLocation,
      endLocation: endLocation,
      vehicleClass: vehicleClass,
      vehicleBrand: vehicleBrand,
      vehicleYear: vehicleYear,
      vehicleEngine: vehicleEngine,
      avgFuelConsumption: avgFuelConsumption,
      fuelPrice: fuelPrice,
      result: calcResult,
      aiInsights: insightsText,
    };

    setTripHistory(prev => {
      // Check if the previous trip was already the exact same route to avoid redundant entries
      if (prev.length > 0) {
        const last = prev[0];
        if (
          last.startLocation.lat === startLocation.lat &&
          last.startLocation.lng === startLocation.lng &&
          last.endLocation.lat === endLocation.lat &&
          last.endLocation.lng === endLocation.lng &&
          last.vehicleClass === vehicleClass &&
          Math.abs(last.result.totalToll - calcResult.totalToll) < 1
        ) {
          // Just update the insights if they got loaded now
          const updated = [...prev];
          updated[0] = { ...last, aiInsights: insightsText, avgFuelConsumption, fuelPrice };
          try {
            localStorage.setItem("yolucreti_trip_history", JSON.stringify(updated));
          } catch (e) {
            console.error(e);
          }
          return updated;
        }
      }

      const updated = [newTrip, ...prev].slice(0, 15);
      try {
        localStorage.setItem("yolucreti_trip_history", JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  // Load a saved trip back into the state
  const loadTripFromHistory = (trip: any) => {
    isLoadedFromHistoryRef.current = true;
    setStartLocation(trip.startLocation);
    setStartQuery(trip.startQuery || trip.startLocation.name);
    setEndLocation(trip.endLocation);
    setEndQuery(trip.endQuery || trip.endLocation.name);
    setVehicleClass(trip.vehicleClass || 1);
    
    if (trip.vehicleBrand) setVehicleBrand(trip.vehicleBrand);
    if (trip.vehicleYear) setVehicleYear(trip.vehicleYear);
    if (trip.vehicleEngine) setVehicleEngine(trip.vehicleEngine);
    if (trip.avgFuelConsumption) setAvgFuelConsumption(trip.avgFuelConsumption);
    if (trip.fuelPrice) setFuelPrice(trip.fuelPrice);
    
    setResult(trip.result);
    setAiInsights(trip.aiInsights);
    setErrorMsg(null);
  };

  // Delete an individual trip from history
  const deleteTripFromHistory = (tripId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent loading the trip
    setTripHistory(prev => {
      const updated = prev.filter(t => t.id !== tripId);
      try {
        localStorage.setItem("yolucreti_trip_history", JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
      return updated;
    });
  };

  // Clear all history
  const clearTripHistory = () => {
    setTripHistory([]);
    try {
      localStorage.removeItem("yolucreti_trip_history");
    } catch (err) {
      console.error(err);
    }
  };

  // Submit main toll fee calculation
  const calculateTolls = async () => {
    if (!startLocation || !endLocation) {
      setErrorMsg("Lütfen başlangıç ve bitiş konumlarını arayarak veya popüler rotalardan seçerek belirleyin.");
      return;
    }

    isLoadedFromHistoryRef.current = false;
    setIsLoading(true);
    setErrorMsg(null);
    setResult(null);
    setAiInsights(null);

    try {
      const response = await fetch("/api/calculate-toll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          start: startLocation,
          end: endLocation,
          vehicleClass: vehicleClass
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setResult(data);
          
          // Trigger AI seyahat tavsiyeleri (insights) automatically
          fetchAiInsights(data);
        } else {
          setErrorMsg(data.error || "Hesaplama yapılamadı.");
        }
      } else {
        const errData = await response.json().catch(() => ({}));
        setErrorMsg(errData.error || "Sunucuyla iletişim kurulurken bir hata meydana geldi.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Sistemsel bir hata oluştu. Lütfen bağlantınızı kontrol edip tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Gemini AI personalized insights
  const fetchAiInsights = async (calcResult: TollCalculationResult) => {
    setIsLoadingInsights(true);
    let finalInsights = null;
    try {
      const crossedItems = [
        ...calcResult.crossedBridges.map(b => b.name),
        ...calcResult.crossedHighways.map(h => `${h.code} ${h.name}`)
      ];

      const response = await fetch("/api/route-insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          startName: startLocation?.name || "Başlangıç",
          endName: endLocation?.name || "Bitiş",
          totalToll: calcResult.totalToll,
          crossedItems: crossedItems,
          vehicleClassName: calcResult.vehicleClassInfo.name
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAiInsights(data.insights);
        finalInsights = data.insights;
      } else {
        finalInsights = "Yapay zeka ipuçları yüklenemedi, ancak yukarıdaki geçiş özetini inceleyebilir, HGS bakiyenizi PTT veya mobil bankacılık üzerinden kontrol edebilirsiniz.";
        setAiInsights(finalInsights);
      }
    } catch (err) {
      console.error("AI insights generation failed:", err);
      finalInsights = "Yapay zeka asistanı şu anda çevrimdışı. HGS ödemelerinizi yolculuktan önce yapmayı unutmayın!";
      setAiInsights(finalInsights);
    } finally {
      setIsLoadingInsights(false);
      // Auto-save trip in history
      saveTripToHistory(calcResult, finalInsights);
    }
  };

  // Trigger quick selection of popular route
  const handlePopularRouteClick = (route: typeof POPULAR_ROUTES[0]) => {
    isLoadedFromHistoryRef.current = false;
    setStartLocation(route.start);
    setStartQuery(route.start.name);
    setEndLocation(route.end);
    setEndQuery(route.end.name);
    setResult(null);
    setAiInsights(null);
    setErrorMsg(null);
    setStartSuggestions([]);
    setEndSuggestions([]);
  };

  // Fuel Cost calculations based on average consumption and total distance
  const getFuelCost = () => {
    if (!result) return 0;
    const litersNeeded = (result.totalDistanceKm / 100) * avgFuelConsumption;
    return Math.round(litersNeeded * fuelPrice);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a] text-zinc-100 font-sans selection:bg-orange-500/30 selection:text-orange-200">
      
      {/* Header */}
      <header className="bg-[#121212]/90 backdrop-blur-md border-b border-white/5 sticky top-0 z-50 py-4 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(249,115,22,0.3)]">
              <RouteIcon className="w-5 h-5 text-black stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-1">
                Oto<span className="text-orange-500 font-light">Matik</span>
              </h1>
              <p className="text-xs text-zinc-500 font-medium">
                Yol masrafını otomatik hesapla
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs bg-white/5 border border-white/10 hover:bg-white/10 transition-colors py-1.5 px-3 rounded-full text-zinc-400 font-semibold cursor-pointer">
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.6)]"></div>
            KGM 2026 Aktif Veri Seti
          </div>
        </div>
      </header>

      {/* Main Content (Bento Grid) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Inputs & Results (Col 1-5) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Section 1: Route Setup */}
          <section className="bg-[#121212] rounded-2xl p-5 border border-white/5 flex flex-col gap-5 relative">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-zinc-100 flex items-center gap-2">
                <Compass className="w-5 h-5 text-orange-500" />
                Güzergah Belirleyin
              </h2>
              {selectingPointMode && (
                <span className="text-xs font-semibold px-2.5 py-1 bg-orange-500/10 text-orange-400 rounded-lg animate-pulse flex items-center gap-1 border border-orange-500/20">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Haritaya Tıklayın
                </span>
              )}
            </div>

            {/* Popular route rapid testing buttons */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mb-2">
                Hızlı Rota Seçenekleri
              </label>
              <div className="flex flex-wrap gap-2">
                {POPULAR_ROUTES.map((route, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePopularRouteClick(route)}
                    className="text-xs py-1.5 px-3 bg-[#1a1a1a] hover:bg-white/5 text-zinc-300 border border-white/5 rounded-lg transition-all font-medium text-left hover:border-orange-500/40 hover:text-orange-400"
                  >
                    {route.name}
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-white/5" />

            <div className="flex flex-col gap-4 relative">
              {/* Departure Input */}
              <div className="relative">
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mb-1.5 flex justify-between">
                  <span>BAŞLANGIÇ NOKTASI (NEREDEN?)</span>
                  <button
                    onClick={() => setSelectingPointMode(selectingPointMode === "start" ? null : "start")}
                    className={`text-[10px] px-2 py-0.5 rounded-sm transition ${
                      selectingPointMode === "start" ? "bg-orange-500 text-black font-bold" : "bg-white/5 hover:bg-white/10 text-zinc-300"
                    }`}
                  >
                    {selectingPointMode === "start" ? "Haritadan Seçiliyor..." : "Haritadan Seç"}
                  </button>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={startQuery}
                    onChange={(e) => {
                      setStartQuery(e.target.value);
                      setShowStartDropdown(true);
                    }}
                    placeholder="Şehir veya ilçe adı yazıp arayın..."
                    className="w-full text-sm pl-9 pr-12 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-orange-500/50 transition-colors"
                  />
                  <MapPin className="absolute left-3 top-3 w-4.5 h-4.5 text-emerald-500" />
                  <button
                    onClick={() => searchLocation(startQuery, "start")}
                    disabled={isSearchingStart}
                    className="absolute right-2 top-2 p-1 text-zinc-400 hover:text-orange-500 rounded-md transition"
                    title="Ara"
                  >
                    {isSearchingStart ? (
                      <RefreshCw className="w-4.5 h-4.5 animate-spin" />
                    ) : (
                      <Search className="w-4.5 h-4.5" />
                    )}
                  </button>
                </div>

                {/* Suggestions Dropdown for Start */}
                {showStartDropdown && startSuggestions.length > 0 && (
                  <div className="absolute z-40 w-full mt-1 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl max-h-52 overflow-y-auto">
                    {startSuggestions.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setStartLocation(item);
                          setStartQuery(item.name);
                          setShowStartDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs hover:bg-white/5 text-zinc-200 transition flex items-center gap-2 border-b border-white/5 last:border-0"
                      >
                        <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        <span className="truncate">{item.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Destination Input */}
              <div className="relative">
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mb-1.5 flex justify-between">
                  <span>BİTİŞ NOKTASI (NEREYE?)</span>
                  <button
                    onClick={() => setSelectingPointMode(selectingPointMode === "end" ? null : "end")}
                    className={`text-[10px] px-2 py-0.5 rounded-sm transition ${
                      selectingPointMode === "end" ? "bg-orange-500 text-black font-bold" : "bg-white/5 hover:bg-white/10 text-zinc-300"
                    }`}
                  >
                    {selectingPointMode === "end" ? "Haritadan Seçiliyor..." : "Haritadan Seç"}
                  </button>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={endQuery}
                    onChange={(e) => {
                      setEndQuery(e.target.value);
                      setShowEndDropdown(true);
                    }}
                    placeholder="Gideceğiniz şehir/ilçe adını yazın..."
                    className="w-full text-sm pl-9 pr-12 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-orange-500/50 transition-colors"
                  />
                  <MapPin className="absolute left-3 top-3 w-4.5 h-4.5 text-rose-500" />
                  <button
                    onClick={() => searchLocation(endQuery, "end")}
                    disabled={isSearchingEnd}
                    className="absolute right-2 top-2 p-1 text-zinc-400 hover:text-orange-500 rounded-md transition"
                    title="Ara"
                  >
                    {isSearchingEnd ? (
                      <RefreshCw className="w-4.5 h-4.5 animate-spin" />
                    ) : (
                      <Search className="w-4.5 h-4.5" />
                    )}
                  </button>
                </div>

                {/* Suggestions Dropdown for End */}
                {showEndDropdown && endSuggestions.length > 0 && (
                  <div className="absolute z-40 w-full mt-1 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl max-h-52 overflow-y-auto">
                    {endSuggestions.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setEndLocation(item);
                          setEndQuery(item.name);
                          setShowEndDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs hover:bg-white/5 text-zinc-200 transition flex items-center gap-2 border-b border-white/5 last:border-0"
                      >
                        <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        <span className="truncate">{item.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Vehicle Class Selector */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mb-2">
                ARAÇ SINIFI
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {vehicleClasses.map((vClass) => {
                  const isSelected = vehicleClass === vClass.id;
                  return (
                    <button
                      key={vClass.id}
                      type="button"
                      onClick={() => setVehicleClass(vClass.id)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        isSelected 
                          ? "bg-orange-500 border-orange-500 text-black font-bold shadow-[0_0_12px_rgba(249,115,22,0.3)]" 
                          : "bg-[#1a1a1a] border-white/10 text-zinc-300 hover:bg-white/5 hover:border-white/20"
                      }`}
                      title={`${vClass.description} - Örnek: ${vClass.example}`}
                    >
                      {vClass.id === 1 && <Car className="w-5 h-5 mb-1" />}
                      {vClass.id === 2 && <Car className="w-5 h-5 mb-1 rotate-12" />} {/* Light commercial / larger */}
                      {vClass.id === 3 && <BusFront className="w-5 h-5 mb-1" />}
                      {vClass.id === 4 && <Truck className="w-5 h-5 mb-1" />}
                      {vClass.id === 5 && <Truck className="w-5 h-5 mb-1 scale-105" />}
                      {vClass.id === 6 && <Flame className="w-5 h-5 mb-1" />} {/* Moto */}
                      
                      <span className="text-[11px] font-bold">Sınıf {vClass.id}</span>
                      <span className="text-[9px] opacity-80 truncate max-w-full">{vClass.description.split(" ")[0]}</span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-2 text-[10px] text-zinc-400 italic bg-[#1a1a1a] p-2 rounded-lg border border-white/5">
                Seçilen Sınıf {vehicleClass}: <span className="font-semibold text-orange-400">{vehicleClasses.find(v => v.id === vehicleClass)?.example}</span>
              </div>
            </div>

            {/* Fuel Consumption Settings */}
            <div className="bg-[#1a1a1a] p-4 rounded-xl border border-white/5 flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <Calculator className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wide">DETAYLI ARAÇ & YAKIT AYARLARI</span>
              </div>
              
              {/* Vehicle Brand, Year, Engine selects */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] text-zinc-500 font-bold uppercase mb-1">Araç Markası</label>
                  <select
                    value={vehicleBrand}
                    onChange={(e) => setVehicleBrand(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 bg-[#121212] border border-white/10 rounded-lg text-zinc-100 focus:outline-none focus:border-orange-500/50 cursor-pointer"
                  >
                    {VEHICLE_BRANDS.map(brand => (
                      <option key={brand} value={brand} className="bg-[#121212] text-zinc-100">{brand}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-500 font-bold uppercase mb-1">Model Yılı</label>
                  <select
                    value={vehicleYear}
                    onChange={(e) => setVehicleYear(parseInt(e.target.value))}
                    className="w-full text-xs px-2.5 py-1.5 bg-[#121212] border border-white/10 rounded-lg text-zinc-100 focus:outline-none focus:border-orange-500/50 cursor-pointer"
                  >
                    {VEHICLE_YEARS.map(year => (
                      <option key={year} value={year} className="bg-[#121212] text-zinc-100">{year}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-500 font-bold uppercase mb-1">Motor & Yakıt Türü</label>
                  <select
                    value={vehicleEngine}
                    onChange={(e) => setVehicleEngine(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 bg-[#121212] border border-white/10 rounded-lg text-zinc-100 focus:outline-none focus:border-orange-500/50 cursor-pointer"
                  >
                    {ENGINE_OPTIONS.map(opt => (
                      <option key={opt.id} value={opt.id} className="bg-[#121212] text-zinc-100">{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Automatic outputs with manual fine tuning option */}
              <div className="p-2.5 bg-[#121212] rounded-lg border border-white/5 text-[10px] text-zinc-400 flex flex-col sm:flex-row justify-between items-center gap-2">
                <span>⚡ <b>Araç Bilgilerine Göre Öneri:</b> {avgFuelConsumption} {ENGINE_OPTIONS.find(e => e.id === vehicleEngine)?.isElectric ? "kWh" : "Lt"}/100km</span>
                <span className="text-[9px] bg-orange-500/15 text-orange-400 px-2 py-0.5 rounded-full font-semibold">Tüketimi aşağıdan el ile de değiştirebilirsiniz</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-zinc-500 font-bold uppercase mb-1">
                    {ENGINE_OPTIONS.find(e => e.id === vehicleEngine)?.isElectric ? "Ort. Tüketim (kWh/100km)" : "Ort. Tüketim (Lt/100km)"}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={avgFuelConsumption}
                    onChange={(e) => setAvgFuelConsumption(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs px-2.5 py-1.5 bg-[#121212] border border-white/10 rounded-lg text-zinc-100 focus:outline-none focus:border-orange-500/50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-500 font-bold uppercase mb-1">
                    {ENGINE_OPTIONS.find(e => e.id === vehicleEngine)?.isElectric ? "Elektrik Tarifesi (TL/kWh)" : "Yakıt Litre Fiyatı (TL)"}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={fuelPrice}
                    onChange={(e) => setFuelPrice(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs px-2.5 py-1.5 bg-[#121212] border border-white/10 rounded-lg text-zinc-100 focus:outline-none focus:border-orange-500/50"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={calculateTolls}
              disabled={isLoading || !startLocation || !endLocation}
              className="w-full bg-zinc-100 hover:bg-white text-black font-bold py-3 px-4 rounded-xl transition-colors shadow-lg shadow-black/50 flex items-center justify-center gap-2 cursor-pointer disabled:bg-[#1a1a1a] disabled:text-zinc-600 disabled:border disabled:border-white/5"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin text-black" />
                  Rotanız Hesaplanıyor...
                </>
              ) : (
                <>
                  <Navigation className="w-5 h-5 fill-current" />
                  ROTA HESAPLA
                </>
              )}
            </button>

            {errorMsg && (
              <div className="p-3 bg-red-950/20 border border-red-500/30 text-red-400 text-xs rounded-xl flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}
          </section>

          {/* Trip History Section */}
          <section className="bg-[#121212] rounded-2xl p-5 border border-white/5 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h2 className="font-semibold text-zinc-100 flex items-center gap-2 text-xs uppercase tracking-wider">
                <History className="w-4 h-4 text-orange-500" />
                YOLCULUK GEÇMİŞİ ({tripHistory.length})
              </h2>
              {tripHistory.length > 0 && (
                <button
                  onClick={clearTripHistory}
                  className="text-[10px] text-zinc-500 hover:text-red-400 transition font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  Temizle
                </button>
              )}
            </div>

            {tripHistory.length === 0 ? (
              <div className="text-center py-6 px-4 bg-[#1a1a1a]/50 rounded-xl border border-dashed border-white/5">
                <Bookmark className="w-6 h-6 text-zinc-600 mx-auto mb-2 opacity-40" />
                <p className="text-xs text-zinc-500 font-medium">Henüz kaydedilmiş yolculuk bulunmuyor.</p>
                <p className="text-[10px] text-zinc-600 mt-1">Hesaplanan rotalarınız otomatik olarak buraya kaydedilir.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {tripHistory.map((trip) => {
                  const isActive = result && 
                    result.crossedBridges.length === trip.result.crossedBridges.length &&
                    result.crossedHighways.length === trip.result.crossedHighways.length &&
                    Math.abs(result.totalToll - trip.result.totalToll) < 0.1 &&
                    startLocation?.lat === trip.startLocation.lat &&
                    endLocation?.lat === trip.endLocation.lat;

                  return (
                    <div
                      key={trip.id}
                      onClick={() => loadTripFromHistory(trip)}
                      className={`group w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-2 ${
                        isActive
                          ? "bg-orange-500/10 border-orange-500/40 text-orange-200"
                          : "bg-[#1a1a1a]/80 border-white/5 text-zinc-300 hover:bg-white/5 hover:border-white/10"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-xs font-semibold mb-1">
                          <span className="truncate max-w-[100px] sm:max-w-[130px] block text-zinc-100 group-hover:text-orange-400 transition-colors">
                            {trip.startQuery.split(",")[0]}
                          </span>
                          <span className="text-zinc-600 text-[10px]">➔</span>
                          <span className="truncate max-w-[100px] sm:max-w-[130px] block text-zinc-100 group-hover:text-orange-400 transition-colors">
                            {trip.endQuery.split(",")[0]}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-zinc-500 font-medium">
                          <span>{trip.result.totalDistanceKm} km</span>
                          <span>•</span>
                          <span>Sınıf {trip.vehicleClass}</span>
                          {trip.vehicleBrand && (
                            <>
                              <span>•</span>
                              <span className="text-zinc-400">{trip.vehicleBrand}</span>
                            </>
                          )}
                        </div>
                        
                        <span className="text-[9px] text-zinc-600 block mt-1.5">{trip.timestamp}</span>
                      </div>

                      <div className="flex flex-col items-end shrink-0 gap-2">
                        <div className="text-right">
                          <div className="text-xs font-bold font-mono text-orange-400">
                            {trip.result.totalToll} <span className="text-[9px] font-normal">TL</span>
                          </div>
                          <div className="text-[9px] text-zinc-500 font-medium">
                            Geçiş Ücreti
                          </div>
                        </div>

                        <button
                          onClick={(e) => deleteTripFromHistory(trip.id, e)}
                          className="p-1 text-zinc-600 hover:text-red-400 rounded transition opacity-0 group-hover:opacity-100 self-end cursor-pointer"
                          title="Sil"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Section 2: Core Cost Breakdown (Only shown if results available) */}
          {result && (
            <div className="flex flex-col gap-6">
              
              {/* Cost Summary Widget */}
              <section className="bg-[#121212] text-zinc-100 rounded-2xl p-6 border border-white/5 shadow-xl relative overflow-hidden">
                {/* Background decorative path elements */}
                <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none transform translate-x-10 translate-y-10 scale-150 text-orange-500">
                  <RouteIcon className="w-64 h-64" />
                </div>

                <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">
                  SEYAHAT MALİYET ÖZETİ
                </h3>

                <div className="grid grid-cols-3 gap-4 border-b border-white/5 pb-5 mb-5">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase mb-1 flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5" /> Otoyol/Köprü
                    </span>
                    <span className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-orange-400">
                      {result.totalToll.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} <span className="text-xs">TL</span>
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase mb-1 flex items-center gap-1">
                      {ENGINE_OPTIONS.find(e => e.id === vehicleEngine)?.isElectric ? (
                        <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                      ) : (
                        <Flame className="w-3.5 h-3.5 text-zinc-400" />
                      )}
                      {ENGINE_OPTIONS.find(e => e.id === vehicleEngine)?.isElectric ? "Şarj Maliyeti" : "Yakıt Maliyeti"}
                    </span>
                    <span className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-zinc-300">
                      {getFuelCost().toLocaleString("tr-TR")} <span className="text-xs">TL</span>
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-orange-500 font-bold uppercase mb-1 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-orange-500" /> Toplam Tutar
                    </span>
                    <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-orange-500">
                      {(result.totalToll + getFuelCost()).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} <span className="text-sm">TL</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <div className="flex items-center gap-1">
                    <RouteIcon className="w-4 h-4 text-orange-500" />
                    <span>Mesafe: <b className="text-zinc-200">{result.totalDistanceKm} km</b></span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span>Süre: <b className="text-zinc-200">{Math.floor(result.totalDurationMinutes / 60)} sa {result.totalDurationMinutes % 60} dk</b></span>
                  </div>
                </div>

                {result.usedFallback && (
                  <div className="mt-4 p-2 bg-[#1a1a1a] rounded-lg text-[10px] text-zinc-400 flex items-center gap-1.5 border border-white/5">
                    <Info className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                    <span>Gerçek zamanlı harita verisi kullanılarak simüle edilmiş akıllı tahmin.</span>
                  </div>
                )}
              </section>

              {/* Toll Detail Breakdown Card */}
              <section className="bg-[#121212] rounded-2xl p-5 border border-white/5 flex flex-col gap-4">
                <h3 className="font-semibold text-zinc-100 flex items-center gap-2 border-b border-white/5 pb-3">
                  <FileText className="w-5 h-5 text-orange-500" />
                  Geçiş Ücreti Detayları
                </h3>

                {result.crossedBridges.length === 0 && result.crossedHighways.length === 0 ? (
                  <div className="py-6 text-center">
                    <div className="mx-auto w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mb-3">
                      <Sparkles className="w-6 h-6 text-emerald-400" />
                    </div>
                    <p className="text-sm font-semibold text-zinc-100">Harika! Ücretsiz Rota</p>
                    <p className="text-xs text-zinc-400 px-4 mt-1">
                      Belirlenen rota üzerinde herhangi bir ücretli otoyol veya köprü bulunmamaktadır. Tamamen ücretsiz devlet yollarını kullanmaktasınız.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    
                    {/* Bridges and Tunnels list */}
                    {result.crossedBridges.length > 0 && (
                      <div>
                        <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                          KÖPRÜ VE TÜNELLER ({result.crossedBridges.length})
                        </h4>
                        <div className="flex flex-col gap-2">
                          {result.crossedBridges.map((bridge, idx) => (
                            <div key={idx} className="flex items-start justify-between p-3 bg-[#1a1a1a] rounded-xl border border-white/5 hover:bg-white/[0.03] transition-colors">
                              <div className="flex-1 pr-3">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-semibold text-xs text-zinc-100">{bridge.name}</span>
                                  <span className={`text-[9px] px-1.5 py-0.5 font-bold rounded-sm ${
                                    bridge.operator === "KGM" ? "bg-white/5 text-zinc-300" : "bg-orange-500/10 text-orange-400"
                                  }`}>
                                    {bridge.operator}
                                  </span>
                                </div>
                                <p className="text-[10px] text-zinc-400 mt-0.5 line-clamp-2">{bridge.description}</p>
                                {bridge.timeSavedMinutes > 0 && (
                                  <div className="flex items-center gap-1 mt-1 text-[9px] text-emerald-400 font-bold">
                                    <Clock className="w-3 h-3" />
                                    <span>~{bridge.timeSavedMinutes} dakika tasarruf sağlar</span>
                                  </div>
                                )}
                              </div>
                              <span className="text-xs font-bold font-mono text-zinc-100 shrink-0">
                                {bridge.toll.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Highways list */}
                    {result.crossedHighways.length > 0 && (
                      <div>
                        <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                          OTOTOYOL KESİMLERİ ({result.crossedHighways.length})
                        </h4>
                        <div className="flex flex-col gap-2">
                          {result.crossedHighways.map((hw, idx) => (
                            <div key={idx} className="flex items-start justify-between p-3 bg-[#1a1a1a] rounded-xl border border-white/5 hover:bg-white/[0.03] transition-colors">
                              <div className="flex-1 pr-3">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-semibold text-xs text-zinc-100">{hw.code} - {hw.name}</span>
                                  <span className={`text-[9px] px-1.5 py-0.5 font-bold rounded-sm ${
                                    hw.operator === "KGM" ? "bg-white/5 text-zinc-300" : "bg-orange-500/10 text-orange-400"
                                  }`}>
                                    {hw.operator}
                                  </span>
                                </div>
                                <p className="text-[10px] text-zinc-400 mt-0.5">{hw.description}</p>
                                <p className="text-[9px] text-zinc-400 font-bold mt-1">
                                  Kullanılan Mesafe: <span className="text-orange-400 font-mono font-extrabold">{hw.distanceKm} km</span>
                                </p>
                              </div>
                              <span className="text-xs font-bold font-mono text-zinc-100 shrink-0">
                                {hw.toll.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </section>

            </div>
          )}

        </div>

        {/* Right Side: Map & AI Insights (Col 6-12) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Section 3: Interactive OpenStreetMap with Leaflet */}
          <section className="bg-[#121212] rounded-2xl border border-white/5 p-3 flex flex-col gap-3">
            <div className="flex items-center justify-between px-2 pt-1">
              <h3 className="font-semibold text-zinc-100 flex items-center gap-2 text-sm sm:text-base">
                <MapIcon className="w-5 h-5 text-orange-500 animate-pulse" />
                İnteraktif Rota Haritası
              </h3>
              <div className="text-xs text-zinc-400 font-medium hidden sm:block">
                Sürükleyin, yakınlaştırın ve güzergahı detaylı görün
              </div>
            </div>

            {/* Selection instructions */}
            {selectingPointMode && (
              <div className="bg-orange-500 text-black text-xs px-3 py-2 rounded-xl text-center font-bold animate-pulse">
                {selectingPointMode === "start" ? "Başlangıç noktası için lütfen haritada bir yere tıklayın!" : "Bitiş noktası için lütfen haritada bir yere tıklayın!"}
              </div>
            )}

            {/* Map Frame */}
            <div className="relative w-full h-[320px] sm:h-[450px] bg-[#1a1a1a] rounded-xl overflow-hidden border border-white/5 z-10">
              <div ref={mapContainerRef} className="w-full h-full z-10" />
              
              {/* Map Floating Tools */}
              <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-2">
                <div className="bg-[#1a1a1a]/95 backdrop-blur-md px-3 py-2 rounded-lg border border-white/10 shadow-lg text-[10px] text-zinc-300 font-semibold flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 border border-white"></div>
                    <span>Yeşil Pin: Başlangıç (B)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 rounded-full bg-rose-500 border border-white"></div>
                    <span>Kırmızı Pin: Bitiş (A)</span>
                  </div>
                  {result && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-1.5 bg-orange-500 rounded-sm"></div>
                      <span>Turuncu Çizgi: Seyahat Güzergahı</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: AI Intelligent Travel Insights from Gemini */}
          <section className="bg-[#121212] rounded-2xl border border-white/5 p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="font-semibold text-zinc-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-500" />
                Yapay Zeka Rota Asistanı (Seyahat Tüyoları)
              </h3>
              <div className="bg-orange-500/10 text-orange-400 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 border border-orange-500/20">
                Gemini Destekli
              </div>
            </div>

            {isLoadingInsights ? (
              <div className="py-10 flex flex-col items-center justify-center gap-3">
                <div className="relative w-10 h-10 flex items-center justify-center">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-20 animate-ping"></span>
                  <Sparkles className="w-6 h-6 text-orange-500 animate-pulse" />
                </div>
                <p className="text-xs text-zinc-400 font-semibold animate-pulse text-center">
                  Gemini rotanızı inceliyor, süre-yakıt analizi yapıyor ve size özel akıllı seyahat ipuçları hazırlıyor...
                </p>
              </div>
            ) : aiInsights ? (
              <div className="text-xs text-zinc-300 leading-relaxed space-y-3 prose max-w-none">
                {/* Parse simple markdown tags dynamically */}
                {aiInsights.split("\n").map((line, idx) => {
                  if (line.startsWith("###")) {
                    return <h4 key={idx} className="text-sm font-bold text-zinc-100 mt-4 mb-1.5">{line.replace("###", "").trim()}</h4>;
                  } else if (line.startsWith("##")) {
                    return <h3 key={idx} className="text-base font-bold text-zinc-100 mt-4 mb-1.5 border-b border-white/5 pb-1">{line.replace("##", "").trim()}</h3>;
                  } else if (line.startsWith("#")) {
                    return <h2 key={idx} className="text-lg font-bold text-zinc-100 mt-4 mb-2">{line.replace("#", "").trim()}</h2>;
                  } else if (line.startsWith("-") || line.startsWith("*")) {
                    return (
                      <div key={idx} className="flex items-start gap-2 pl-2">
                        <span className="text-orange-500 mt-1">•</span>
                        <span>{line.replace(/^[-*]\s*/, "")}</span>
                      </div>
                    );
                  } else if (line.trim().length === 0) {
                    return <div key={idx} className="h-2"></div>;
                  } else {
                    // Check for bold notation **
                    const parts = line.split(/\*\*(.*?)\*\*/g);
                    return (
                      <p key={idx}>
                        {parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="text-orange-400 font-semibold">{part}</strong> : part)}
                      </p>
                    );
                  }
                })}
              </div>
            ) : (
              <div className="py-10 text-center bg-[#1a1a1a] rounded-xl border border-dashed border-white/10">
                <Info className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
                <p className="text-xs text-zinc-300 font-semibold">Yapay Zeka Rehberi Hazır Değil</p>
                <p className="text-[11px] text-zinc-500 px-6 mt-1 max-w-md mx-auto">
                  Güzergahınızı seçip "Hesapla" butonuna tıkladığınızda, Gemini rotadaki HGS kuralları, geçiş cezaları, feribot alternatifleri ve yolculuk tasarruf analizleri hakkında akıllı rapor sunacaktır.
                </p>
              </div>
            )}
          </section>

        </div>

      </main>

      {/* Footer */}
      <footer className="bg-[#121212] border-t border-white/5 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div>
            &copy; 2026 Türkiye Otoyol Geçiş Ücreti Hesaplayıcı. Tüm Hakları Saklıdır.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-orange-500 transition cursor-pointer">Kullanım Koşulları</span>
            <span className="hover:text-orange-500 transition cursor-pointer">Veri Kaynağı: Karayolları Genel Müdürlüğü (KGM)</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
