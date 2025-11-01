import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import * as XLSX from "xlsx";
import {
  Database,
  Download,
  Upload,
  AlertCircle,
  Calendar,
  LogOut,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "../../components/ui/button";
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
  const navigate = useNavigate();
  const [earthquakeData, setEarthquakeData] = useState<EarthquakeData[]>([]);
  const [activeTab, setActiveTab] = useState<"upload" | "data" | "recent">("upload");
  const [message, setMessage] = useState<Message>(null);
  // Clustering dataset states
  const [clusterData, setClusterData] = useState<DataItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };


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
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("https://127.0.0.1:8000/upload-cluster", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    console.log(data);
    showMessage({
      type: "success",
      text: "Upload & Clustering Done",
      description: `${data.count} items processed.`,
    });
  };

  const handleClusterFileUpload = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];

      if (jsonData.length < 2) {
        showMessage({ type: "error", text: "File is empty or invalid" });
        return;
      }

      // Get headers from first row
      const headers = jsonData[0].map((h: any) => String(h).trim());

      const required = [
        "Kabupaten/Kota",
        "Freq_Total",
        "Max_MMI",
        "Avg_MMI",
        "pop_density",
        "sex_ratio",
        "vulnerable_age_ratio",
        "poverty_ratio",
        "disability_ratio",
      ];

      // Check if required columns exist (allowing variations)
      const columnIndices: Record<string, number> = {};
      required.forEach((req) => {
        const idx = headers.findIndex((h) =>
          h === req ||
          (req === "Kabupaten/Kota" && (h === "Kabupaten" || h === "Kota"))
        );
        if (idx === -1 && req !== "Kabupaten/Kota") {
          throw new Error(`Missing column: ${req}`);
        }
        if (idx !== -1) {
          columnIndices[req === "Kabupaten/Kota" ? "Kabupaten" : req] = idx;
        }
      });

      // Parse data rows for preview
      const parsed: DataItem[] = jsonData.slice(1).map((row) => {
        const parseValue = (val: any): number => {
          if (typeof val === "number") return val;
          if (typeof val === "string") {
            // Handle comma as decimal separator
            const normalized = val.replace(",", ".");
            return parseFloat(normalized) || 0;
          }
          return 0;
        };

        return {
          Kabupaten: String(row[columnIndices.Kabupaten] || "").trim(),
          Freq_Total: parseValue(row[columnIndices.Freq_Total]),
          Max_MMI: parseValue(row[columnIndices.Max_MMI]),
          Avg_MMI: parseValue(row[columnIndices.Avg_MMI]),
          pop_density: parseValue(row[columnIndices.pop_density]),
          sex_ratio: parseValue(row[columnIndices.sex_ratio]),
          vulnerable_age_ratio: parseValue(row[columnIndices.vulnerable_age_ratio]),
          poverty_ratio: parseValue(row[columnIndices.poverty_ratio]),
          disability_ratio: parseValue(row[columnIndices.disability_ratio]),
        } as DataItem;
      }).filter(item => item.Kabupaten); // Remove empty rows

      // Store both parsed data and the original file
      setClusterData(parsed);
      // Store file in a ref or state for later upload
      (window as any).__clusterFile = file;

      showMessage({
        type: "success",
        text: "Dataset loaded successfully",
        description: `${parsed.length} kabupaten/kota imported`
      });
    } catch (e: any) {
      showMessage({
        type: "error",
        text: "Failed to read Excel file",
        description: e.message || "Please check file format"
      });
    }
  };

  const handleRunClustering = async () => {
    if (clusterData.length === 0) {
      showMessage({ type: "error", text: "No data to process", description: "Please upload Excel file first" });
      return;
    }

    // Get the stored file
    const file = (window as any).__clusterFile;
    if (!file) {
      showMessage({ type: "error", text: "File not found", description: "Please re-upload the Excel file" });
      return;
    }

    setIsProcessing(true);
    try {
      showMessage({ type: "info", text: "Processing clustering...", description: "Please wait" });

      // Send file to backend via FormData
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://127.0.0.1:8000/upload-cluster", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();

      showMessage({
        type: "success",
        text: "Clustering completed successfully",
        description: `${result.count} kabupaten/kota processed and saved`
      });

      // Refresh map data
      setTimeout(() => {
        window.dispatchEvent(new Event('clusterUpdated'));
      }, 1000);

    } catch (e: any) {
      console.error("Clustering error:", e);
      showMessage({
        type: "error",
        text: "Clustering failed",
        description: e.message || "Please try again"
      });
    } finally {
      setIsProcessing(false);
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
            <div className="flex items-center gap-3">
              <span className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 text-sm">Admin Access</span>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>


        {/* Tabs */}
        <div>
          <div className="mb-6 inline-flex rounded-lg border bg-white p-1">
            {([
              { id: "upload", label: "Upload Data", icon: Upload },
              { id: "data", label: "View Data", icon: Database },
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

              {/* Clustering dataset uploader */}
              <div className="p-6 rounded-xl bg-white border border-gray-100 shadow-sm">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-gray-900 font-semibold mb-2">Upload Data Kabupaten/Kota</h2>
                    <p className="text-sm text-gray-600">
                      Upload file Excel dengan data agregat per Kabupaten/Kota untuk clustering K-Means.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Create sample Excel template
                      const ws_data = [
                        [
                          "Kabupaten/Kota",
                          "Freq_Total",
                          "Max_MMI",
                          "Avg_MMI",
                          "pop_density",
                          "sex_ratio",
                          "vulnerable_age_ratio",
                          "poverty_ratio",
                          "disability_ratio",
                        ],
                        ["Kabupaten Bandung", 73, 4, 3.03, 6.45, 105.4, 79.89, 10.36, 11.9],
                        ["Kabupaten Bandung Barat", 14, 3, 3, 13.7, 104.3, 78.73, 10.49, 10.64],
                        ["Kabupaten Bekasi", 1, 3, 3, 25.41, 103.2, 64.33, 4.82, 8.93],
                      ];
                      const ws = XLSX.utils.aoa_to_sheet(ws_data);
                      const wb = XLSX.utils.book_new();
                      XLSX.utils.book_append_sheet(wb, ws, "Data Clustering");
                      XLSX.writeFile(wb, "template_clustering_jabar.xlsx");
                      showMessage({ type: "success", text: "Template downloaded" });
                    }}
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" /> Download Template
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 hover:border-blue-400 transition-colors">
                    <div className="text-center">
                      <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <label className="block text-sm font-medium mb-3 cursor-pointer">
                        <span className="text-blue-600 hover:text-blue-700">Click to upload</span> or drag and drop
                      </label>
                      <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleClusterFileUpload(file);
                        }}
                        className="hidden"
                        id="cluster-file-upload"
                      />
                      <label
                        htmlFor="cluster-file-upload"
                        className="block w-full"
                      >
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={() => document.getElementById("cluster-file-upload")?.click()}
                        >
                          Select Excel File
                        </Button>
                      </label>
                      <p className="text-xs text-gray-500 mt-3">
                        Excel files only (.xlsx, .xls)
                      </p>
                    </div>
                    {clusterData.length > 0 && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800 font-medium">
                          ✓ {clusterData.length} Kabupaten/Kota loaded
                        </p>
                        <p className="text-xs text-green-700 mt-1">
                          Ready to process clustering
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="rounded-lg border p-6 bg-gradient-to-br from-blue-50 to-blue-100">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-semibold text-blue-900 mb-2">
                          Informasi Clustering
                        </h3>
                        <ul className="text-xs text-blue-800 space-y-1.5">
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600">•</span>
                            <span>Jumlah cluster (K) ditentukan otomatis oleh server</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600">•</span>
                            <span>Data berdasarkan agregasi per Kabupaten/Kota</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600">•</span>
                            <span>Hasil clustering akan otomatis tersimpan</span>
                          </li>
                        </ul>
                      </div>

                      <div className="pt-3 border-t border-blue-200">
                        <Button
                          onClick={handleRunClustering}
                          disabled={clusterData.length === 0 || isProcessing}
                          className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
                        >
                          {isProcessing ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Processing...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4" />
                              Run Clustering & Update Map
                            </>
                          )}
                        </Button>
                        <p className="text-xs text-blue-700 mt-2 text-center">
                          Hasil akan ditampilkan di halaman Peta
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Format Info */}
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <h3 className="text-amber-900 font-medium mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Format Data Excel
                  </h3>
                  <p className="text-sm text-amber-800 mb-3">
                    File Excel harus memiliki kolom berikut (urutan boleh berbeda):
                  </p>
                  <div className="grid md:grid-cols-3 gap-2 text-xs">
                    {[
                      "Kabupaten/Kota",
                      "Freq_Total",
                      "Max_MMI",
                      "Avg_MMI",
                      "pop_density",
                      "sex_ratio",
                      "vulnerable_age_ratio",
                      "poverty_ratio",
                      "disability_ratio",
                    ].map((col) => (
                      <div key={col} className="flex items-center gap-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-white border border-amber-300 text-amber-900 font-mono">
                          {col}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-amber-700 mt-3">
                    💡 Tip: Gunakan koma (,) atau titik (.) sebagai pemisah desimal
                  </p>
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

        </div>
      </div>
    </div>
  );
}