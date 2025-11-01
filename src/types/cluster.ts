// Types for cluster data
export interface ClusterData {
  Kabupaten: string;
  Cluster: number;
}

export interface DataItem {
  Kabupaten: string;
  Freq_Total: number;
  Max_MMI: number;
  Avg_MMI: number;
  pop_density: number;
  sex_ratio: number;
  vulnerable_age_ratio: number;
  poverty_ratio: number;
  disability_ratio: number;
}

export interface ClusterRequest {
  k?: number; // Optional: server will determine K automatically if not provided
  data: DataItem[];
}

export interface GeoJSONFeature {
  type: string;
  properties: {
    NAME_2?: string;
    cluster?: number;
    [key: string]: any;
  };
  geometry: {
    type: string;
    coordinates: any[];
  };
}

export interface GeoJSONResponse {
  type: string;
  name?: string;
  crs?: any;
  features: GeoJSONFeature[];
}

export interface ClusterResponse {
  k?: number;
  centroids?: number[][];
  result?: ClusterData[];
  type?: string;
  features?: GeoJSONFeature[];
  name?: string;
  crs?: any;
}
