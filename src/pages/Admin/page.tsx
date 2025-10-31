import { useMemo, useState } from "react";
import {
  Database,
  Download,
  Upload,
  TrendingUp,
  AlertCircle,
  MapPin,
  Calendar,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { useClusters } from "../../hooks/useCluster";
import type { DataItem } from "../../types/cluster";

type EarthquakeData = {
  date?: string;
  time?: string;
  latitude?: string;
  longitude?: string;
  magnitude?: string;
  depth?: string;
  location?: string;
  [key: string]: string | undefined;
};

type Message = { type: "success" | "error" | "info"; text: string; description?: string } | null;

function parseCSV(content: string): EarthquakeData[] {
  const lines = content.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return [];
  const headers = lines[0].split(",").map((h) => h.trim());
  const rows = lines.slice(1);
  const data: EarthquakeData[] = rows.map((line) => {
    // naive CSV split, does not handle quoted commas
    const cols = line.split(",");
    const obj: EarthquakeData = {};
    headers.forEach((h, i) => {
      obj[h] = (cols[i] ?? "").trim();
    });
    return obj;
  });
  return data;
}

export default function AdminPage() {
  const [earthquakeData, setEarthquakeData] = useState<EarthquakeData[]>([]);
  const [activeTab, setActiveTab] = useState<"upload" | "data" | "recent">("upload");
  const [message, setMessage] = useState<Message>(null);
  // Clustering dataset states
  const [clusterData, setClusterData] = useState<DataItem[]>([]);
  const [clusterK, setClusterK] = useState<number>(3);

  const statistics = useMemo(() => {
    const total = earthquakeData.length;
    const magnitudes = earthquakeData
      .map((d) => parseFloat(d.magnitude || "0"))
      .filter((n) => !Number.isNaN(n));
    const avg = magnitudes.length > 0
      ? (magnitudes.reduce((a, b) => a + b, 0) / magnitudes.length).toFixed(2)
      : "0.00";
    const max = magnitudes.length > 0 ? Math.max(...magnitudes).toFixed(2) : "0.00";
    const recent = earthquakeData.slice(0, 5);
    return { totalRecords: total, avgMagnitude: avg, highestMagnitude: max, recentEvents: recent };
  }, [earthquakeData]);

  const showMessage = (m: Message, timeout = 2500) => {
    setMessage(m);
    if (m) {
      setTimeout(() => setMessage(null), timeout);
    }
  };

  const handleDownloadTemplate = () => {
    const template =
      "date,time,latitude,longitude,magnitude,depth,location\n" +
      "2025-01-15,14:30:00,-6.2088,106.8456,5.2,10,Jakarta\n" +
      "2025-01-14,09:15:00,-7.7956,110.3695,4.8,15,Yogyakarta";
    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "earthquake_data_template.csv";
    a.click();
    URL.revokeObjectURL(url);
    showMessage({ type: "success", text: "Template downloaded" });
  };

  const handleFileUpload = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = parseCSV(text);
      setEarthquakeData(parsed);
      setActiveTab("data");
      showMessage({ type: "success", text: "Data uploaded successfully", description: `${parsed.length} records imported` });
    } catch (e) {
      showMessage({ type: "error", text: "Failed to read file" });
    }
  };

  const handleClusterFileUpload = async (file: File) => {
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter(Boolean);
      if (lines.length === 0) return;
      const headers = lines[0].split(",").map((h) => h.trim());
      const required = [
        "Kabupaten",
        "Freq_Total",
        "Max_MMI",
        "Avg_MMI",
        "pop_density",
        "sex_ratio",
        "vulnerable_age_ratio",
        "poverty_ratio",
        "disability_ratio",
      ];
      const missing = required.filter((r) => !headers.includes(r));
      if (missing.length) {
        showMessage({ type: "error", text: "Invalid clustering CSV headers", description: `Missing: ${missing.join(", ")}` }, 4000);
        return;
      }
      const rows = lines.slice(1);
      const parsed: DataItem[] = rows.map((line) => {
        const cols = line.split(",");
        return {
          Kabupaten: (cols[headers.indexOf("Kabupaten")] ?? "").trim(),
          Freq_Total: parseFloat(cols[headers.indexOf("Freq_Total")] ?? "0"),
          Max_MMI: parseFloat(cols[headers.indexOf("Max_MMI")] ?? "0"),
          Avg_MMI: parseFloat(cols[headers.indexOf("Avg_MMI")] ?? "0"),
          pop_density: parseFloat(cols[headers.indexOf("pop_density")] ?? "0"),
          sex_ratio: parseFloat(cols[headers.indexOf("sex_ratio")] ?? "0"),
          vulnerable_age_ratio: parseFloat(cols[headers.indexOf("vulnerable_age_ratio")] ?? "0"),
          poverty_ratio: parseFloat(cols[headers.indexOf("poverty_ratio")] ?? "0"),
          disability_ratio: parseFloat(cols[headers.indexOf("disability_ratio")] ?? "0"),
        } as DataItem;
      });
      setClusterData(parsed);
      showMessage({ type: "success", text: "Clustering dataset loaded", description: `${parsed.length} rows` });
    } catch (e) {
      showMessage({ type: "error", text: "Failed to read clustering CSV" });
    }
  };

  const handleRunClustering = async () => {
    if (clusterData.length === 0) {
      showMessage({ type: "error", text: "No clustering data to process" });
      return;
    }
    try {
      const res = await useClusters({ k: clusterK, data: clusterData });
      if ((res as any).type === "FeatureCollection") {
        localStorage.setItem("clusterGeoJSON", JSON.stringify(res));
        showMessage({ type: "success", text: "Clustering updated", description: "Map data has been refreshed" });
      } else {
        showMessage({ type: "info", text: "Cluster response received", description: "But no FeatureCollection found" });
      }
    } catch (e) {
      showMessage({ type: "error", text: "Failed to run clustering" });
    }
  };

  const handleDeleteRecord = (index: number) => {
    setEarthquakeData((prev) => prev.filter((_, i) => i !== index));
    showMessage({ type: "success", text: "Record deleted" });
  };

  const handleExportData = () => {
    if (earthquakeData.length === 0) {
      showMessage({ type: "error", text: "No data to export" });
      return;
    }
    const headers = Object.keys(earthquakeData[0]);
    const csv = [
      headers.join(","),
      ...earthquakeData.map((row) => headers.map((h) => row[h] ?? "").join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `earthquake_data_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showMessage({ type: "success", text: "Data exported successfully" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Alerts */}
        {message && (
          <div
            className={`mb-4 rounded-lg border px-4 py-3 text-sm ${message.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : message.type === "error"
                ? "bg-red-50 border-red-200 text-red-800"
                : "bg-blue-50 border-blue-200 text-blue-800"
              }`}
          >
            <div className="font-medium">{message.text}</div>
            {message.description && <div className="text-xs opacity-80">{message.description}</div>}
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-3 rounded-lg">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-blue-900 font-semibold">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Manage earthquake data and records</p>
              </div>
            </div>
            <span className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 text-sm">Admin Access</span>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="p-6 rounded-xl bg-white border border-gray-100 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Records</p>
                <p className="text-gray-900 text-xl font-semibold">{statistics.totalRecords}</p>
              </div>
              <div className="bg-blue-100 p-2 rounded-lg">
                <Database className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-white border border-gray-100 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Avg Magnitude</p>
                <p className="text-gray-900 text-xl font-semibold">{statistics.avgMagnitude} SR</p>
              </div>
              <div className="bg-green-100 p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-white border border-gray-100 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Highest Magnitude</p>
                <p className="text-gray-900 text-xl font-semibold">{statistics.highestMagnitude} SR</p>
              </div>
              <div className="bg-red-100 p-2 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-white border border-gray-100 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Data Source</p>
                <p className="text-gray-900 text-xl font-semibold">CSV</p>
              </div>
              <div className="bg-purple-100 p-2 rounded-lg">
                <Upload className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div>
          <div className="mb-6 inline-flex rounded-lg border bg-white p-1">
            {([
              { id: "upload", label: "Upload Data", icon: Upload },
              { id: "data", label: "View Data", icon: Database },
              { id: "recent", label: "Recent Events", icon: Calendar },
            ] as const).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${activeTab === tab.id ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-50"
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Upload Tab */}
          {activeTab === "upload" && (
            <div className="space-y-6">
              <div className="p-6 rounded-xl bg-white border border-gray-100 shadow-sm">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-gray-900 font-semibold mb-2">Upload Earthquake Data</h2>
                    <p className="text-sm text-gray-600">
                      Upload CSV file with earthquake records. Make sure your file follows the template format.
                    </p>
                  </div>
                  <Button variant="outline" onClick={handleDownloadTemplate} className="gap-2">
                    <Download className="w-4 h-4" />
                    Download Template
                  </Button>
                </div>

                <div className="rounded-lg border border-dashed p-6 text-center">
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-2">CSV only for now</p>
                </div>

                {/* Format Info */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="text-blue-900 font-medium mb-2">Required Format</h3>
                  <p className="text-sm text-blue-800 mb-3">
                    Your CSV should contain the following columns:
                  </p>
                  <div className="grid md:grid-cols-2 gap-2 text-sm">
                    {[
                      ["date", "YYYY-MM-DD"],
                      ["time", "HH:MM:SS"],
                      ["latitude", "Decimal degrees"],
                      ["longitude", "Decimal degrees"],
                      ["magnitude", "Richter scale"],
                      ["depth", "Kilometers"],
                      ["location", "Place name"],
                    ].map(([col, desc]) => (
                      <div key={col} className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded border text-xs">{col}</span>
                        <span className="text-blue-700">{desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Clustering dataset uploader */}
              <div className="p-6 rounded-xl bg-white border border-gray-100 shadow-sm">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-gray-900 font-semibold mb-2">Upload Clustering Dataset</h2>
                    <p className="text-sm text-gray-600">CSV with aggregated indicators per Kabupaten to feed K-Means.</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const template =
                        "Kabupaten,Freq_Total,Max_MMI,Avg_MMI,pop_density,sex_ratio,vulnerable_age_ratio,poverty_ratio,disability_ratio\n" +
                        "Kabupaten Bandung,73,4,3.03,6.45,105.4,79.89,10.36,11.9\n" +
                        "Kabupaten Garut,108,4,3.06,8.41,105.1,80.34,9.98,8.76";
                      const blob = new Blob([template], { type: "text/csv" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "clustering_dataset_template.csv";
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" /> Download Template
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="rounded-lg border border-dashed p-6">
                    <label className="block text-sm font-medium mb-2">Upload CSV</label>
                    <input
                      type="file"
                      accept=".csv,text/csv"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleClusterFileUpload(file);
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-2">Headers must match template exactly</p>
                    {clusterData.length > 0 && (
                      <p className="text-xs text-green-700 mt-2">Loaded {clusterData.length} rows</p>
                    )}
                  </div>

                  <div className="rounded-lg border p-6 bg-gray-50">
                    <label className="block text-sm font-medium mb-2">K (number of clusters)</label>
                    <input
                      type="number"
                      min={2}
                      max={8}
                      value={clusterK}
                      onChange={(e) => setClusterK(parseInt(e.target.value || "3"))}
                      className="w-28 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="mt-4">
                      <Button onClick={handleRunClustering} className="gap-2">
                        <Upload className="w-4 h-4" /> Run Clustering & Update Map
                      </Button>
                    </div>
                    <p className="text-xs text-gray-600 mt-3">
                      Hasil FeatureCollection akan disimpan di localStorage dan dipakai halaman Peta.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Data Tab */}
          {activeTab === "data" && (
            <div className="space-y-4">
              <div className="p-6 rounded-xl bg-white border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-gray-900 font-semibold mb-1">Earthquake Data Records</h2>
                    <p className="text-sm text-gray-600">View, search, and manage all uploaded earthquake data</p>
                  </div>
                  {earthquakeData.length > 0 && (
                    <Button variant="outline" onClick={handleExportData} className="gap-2">
                      <Download className="w-4 h-4" />
                      Export Data
                    </Button>
                  )}
                </div>

                {earthquakeData.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">No data. Upload a CSV first.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left bg-gray-50">
                          {Object.keys(earthquakeData[0]).map((h) => (
                            <th key={h} className="px-3 py-2 font-medium text-gray-700 border-b">
                              {h}
                            </th>
                          ))}
                          <th className="px-3 py-2 font-medium text-gray-700 border-b">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {earthquakeData.map((row, idx) => (
                          <tr key={idx} className="border-b hover:bg-gray-50">
                            {Object.keys(earthquakeData[0]).map((h) => (
                              <td key={h} className="px-3 py-2 text-gray-800">
                                {row[h]}
                              </td>
                            ))}
                            <td className="px-3 py-2">
                              <Button variant="ghost" className="text-red-600" onClick={() => handleDeleteRecord(idx)}>
                                Delete
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recent Events Tab */}
          {activeTab === "recent" && (
            <div className="space-y-4">
              <div className="p-6 rounded-xl bg-white border border-gray-100 shadow-sm">
                <h2 className="text-gray-900 font-semibold mb-4">Recent Earthquake Events</h2>
                {statistics.recentEvents.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No recent events found. Upload data to see recent earthquakes.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {statistics.recentEvents.map((event, index) => (
                      <div key={index} className="p-4 rounded-xl border bg-white hover:shadow-sm transition-shadow">
                        <div className="flex items-start gap-4">
                          <div className="bg-red-100 p-3 rounded-lg">
                            <MapPin className="w-5 h-5 text-red-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="text-gray-900 font-medium">{event.location || "Unknown Location"}</h3>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${parseFloat(event.magnitude || "0") >= 6
                                  ? "bg-red-100 text-red-700"
                                  : parseFloat(event.magnitude || "0") >= 5
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-gray-100 text-gray-700"
                                  }`}
                              >
                                {event.magnitude || "N/A"} SR
                              </span>
                            </div>
                            <div className="grid md:grid-cols-3 gap-3 text-sm text-gray-600">
                              <div>
                                <span className="text-gray-500">Date:</span> {event.date || "N/A"}
                              </div>
                              <div>
                                <span className="text-gray-500">Time:</span> {event.time || "N/A"}
                              </div>
                              <div>
                                <span className="text-gray-500">Depth:</span> {event.depth || "N/A"} km
                              </div>
                              <div>
                                <span className="text-gray-500">Lat:</span> {event.latitude || "N/A"}
                              </div>
                              <div>
                                <span className="text-gray-500">Lng:</span> {event.longitude || "N/A"}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}