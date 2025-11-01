import { useEffect, useMemo, useState } from "react";
import {
    MapContainer,
    TileLayer,
    GeoJSON,
} from "react-leaflet";
import { Button } from "../../components/ui/button";
import { Map as MapIcon, Layers, X } from "lucide-react";
import "leaflet/dist/leaflet.css";

function ClusterDashboard() {
    const [geoData, setGeoData] = useState<any>(null);
    const [isOpen, setIsOpen] = useState<boolean>(true);
    const [baseLayer, setBaseLayer] = useState<string>("street");

    useEffect(() => {
        const fetchCluster = async () => {
            try {
                const res = await fetch("http://127.0.0.1:8000/latest_cluster");
                const data = await res.json();
                if (data.type === "FeatureCollection") {
                    setGeoData(data);
                    console.log("✅ Cluster data loaded");
                } else {
                    console.warn("No valid cluster data found.");
                }
            } catch (err) {
                console.error("Error fetching latest cluster:", err);
            }
        };

        fetchCluster();

        // Listen for cluster updates from admin page
        const handleClusterUpdate = () => {
            console.log("🔄 Cluster updated, reloading data...");
            fetchCluster();
        };

        window.addEventListener('clusterUpdated', handleClusterUpdate);

        return () => {
            window.removeEventListener('clusterUpdated', handleClusterUpdate);
        };
    }, []);

    // Styling functions for GeoJSON
    const getColor = (cluster: number) => {
        switch (cluster) {
            case 1:
                return "#ff595e";
            case 2:
                return "#1982c4";
            case 3:
                return "#8ac926";
            case 4:
                return "#ffca3a";
            case 5:
                return "#6a4c93";
            default:
                return "#ccc";
        }
    };

    const onEachFeature = (feature: any, layer: any) => {
        const name = feature.properties?.NAME_2 || "Unknown";
        const cluster = feature.properties?.cluster || "No Cluster";
        layer.bindPopup(`<b>${name}</b><br/>Cluster: ${cluster}`);
    };

    const style = (feature: any) => ({
        fillColor: getColor(feature.properties?.cluster),
        weight: 1,
        opacity: 1,
        color: "#fff",
        fillOpacity: 0.7,
    });

    // Tile layers based on selection
    const { tileUrl, attribution } = useMemo(() => {
        switch (baseLayer) {
            case "satellite":
                return {
                    tileUrl:
                        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
                    attribution:
                        '&copy; <a href="https://www.esri.com/">Esri</a>, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
                };
            case "terrain":
                return {
                    tileUrl: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
                    attribution:
                        'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors, <a href="https://opentopomap.org">OpenTopoMap</a>',
                };
            case "street":
            default:
                return {
                    tileUrl: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                    attribution:
                        '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
                };
        }
    }, [baseLayer]);

    // Sidebar actions
    const handleBaseLayerChange = (layer: string) => setBaseLayer(layer);

    return (
        <div className="flex flex-col h-[100vh] font-sans">
            {/* Header */}
            <header className="px-6 py-3 bg-gradient-to-r from-blue-700 to-blue-500 text-white shadow">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg sm:text-xl font-semibold tracking-tight flex items-center gap-2">
                        <MapIcon className="w-5 h-5" /> Peta Risiko — Jawa Barat
                    </h1>
                    <div className="hidden sm:flex text-xs text-white/85">
                        K-Means • BMKG • BPS
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="relative flex-1 overflow-hidden">
                {/* Map Area */}
                <main className="absolute inset-0">
                    <MapContainer center={[-7.0909, 107.6689] as [number, number]} zoom={8} className="h-full w-full">
                        <TileLayer url={tileUrl} attribution={attribution} />
                        {geoData && (
                            <GeoJSON
                                data={geoData}
                                // @ts-ignore
                                style={style}
                                // @ts-ignore
                                onEachFeature={onEachFeature}
                            />
                        )}
                    </MapContainer>

                    {/* Map legend/attribution */}
                    <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur rounded-lg shadow p-3 text-xs text-gray-700">
                        🗺️ Data: OSM • Esri • OpenTopoMap | Visualisasi Cluster
                    </div>

                    {/* Toggle Sidebar Button */}
                    {!isOpen && (
                        <div className="absolute top-4 left-4 z-[1000]">
                            <Button variant="secondary" onClick={() => setIsOpen(true)} className="shadow">
                                Panel
                            </Button>
                        </div>
                    )}
                </main>

                {/* Sidebar overlay */}
                <div
                    className={`absolute top-0 left-0 h-full bg-white shadow-lg transition-transform duration-300 z-[1000] ${isOpen ? "translate-x-0" : "-translate-x-full"
                        } w-[320px]`}
                >
                    <div className="flex flex-col h-full">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b">
                            <div className="flex items-center gap-2">
                                <MapIcon className="w-5 h-5 text-blue-600" />
                                <h2 className="font-medium">GIS Control Panel</h2>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            {/* Base Layers */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Layers className="w-4 h-4 text-gray-600" />
                                    <h3 className="text-sm font-medium">Base Layers</h3>
                                </div>
                                <div className="space-y-2 text-sm">
                                    {[
                                        { id: "street", label: "Street Map" },
                                        { id: "satellite", label: "Satellite" },
                                        { id: "terrain", label: "Terrain" },
                                    ].map((l) => (
                                        <label key={l.id} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="base-layer"
                                                value={l.id}
                                                checked={baseLayer === l.id}
                                                onChange={() => handleBaseLayerChange(l.id)}
                                            />
                                            <span>{l.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="border-t" />

                            {/* Legend */}
                            <div>
                                <h3 className="text-sm font-medium mb-2">Legend</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="inline-block w-4 h-4 bg-red-500" />
                                        <span>Cluster 1</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="inline-block w-4 h-4 bg-blue-500" />
                                        <span>Cluster 2</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="inline-block w-4 h-4 bg-green-500" />
                                        <span>Cluster 3</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

}

export default ClusterDashboard;
