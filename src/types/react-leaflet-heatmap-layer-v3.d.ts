declare module 'react-leaflet-heatmap-layer-v3' {
  import * as React from 'react';
  import { LayerProps } from 'react-leaflet';

  export interface HeatmapLayerProps extends LayerProps {
    points: any[];
    longitudeExtractor: (point: any) => number;
    latitudeExtractor: (point: any) => number;
    intensityExtractor: (point: any) => number;
    radius?: number;
    blur?: number;
    max?: number;
    gradient?: Record<number, string>;
    minOpacity?: number;
  }

  export class HeatmapLayer extends React.Component<HeatmapLayerProps> {}
  
  export interface HeatmapProps {
    points: any[];
    longitudeExtractor: (point: any) => number;
    latitudeExtractor: (point: any) => number;
    intensityExtractor: (point: any) => number;
  }
  
  export class Heatmap extends React.Component<HeatmapProps> {}
  
  export const SimpleHeat: any;
  export const computeAggregate: any;
}