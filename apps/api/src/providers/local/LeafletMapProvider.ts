import { MapProviderConfig } from '@ecotransit/shared';

export class LeafletMapProvider implements MapProviderConfig {
  async getMapConfig(): Promise<{
    provider: 'leaflet' | 'google';
    apiKey?: string;
    mapStyle?: any;
    tileUrl?: string;
    attribution?: string;
  }> {
    return {
      provider: 'leaflet',
      tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    };
  }
}
