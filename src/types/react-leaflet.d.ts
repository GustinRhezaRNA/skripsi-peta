// Add react-leaflet component types
declare module 'react-leaflet' {
  export interface MapContainerProps {
    center: [number, number];
    zoom: number;
    style?: React.CSSProperties;
    className?: string;
    children?: React.ReactNode;
  }

  export interface TileLayerProps {
    url: string;
    attribution?: string;
  }

  export interface GeoJSONProps {
    data: any;
    style?: (feature: any) => any;
    onEachFeature?: (feature: any, layer: any) => void;
  }

  export class MapContainer extends React.Component<MapContainerProps, any> {}
  export class TileLayer extends React.Component<TileLayerProps, any> {}
  export class GeoJSON extends React.Component<GeoJSONProps, any> {}

  // Additional components/hooks used in the app
  export interface PopupProps {
    children?: React.ReactNode;
  }
  export class Popup extends React.Component<PopupProps, any> {}

  export interface CircleMarkerProps {
    center: [number, number];
    radius?: number;
    pathOptions?: any;
    children?: React.ReactNode;
  }
  export class CircleMarker extends React.Component<CircleMarkerProps, any> {}

  export function useMap(): any;
  export function useMapEvents(handlers: any): any;
}
