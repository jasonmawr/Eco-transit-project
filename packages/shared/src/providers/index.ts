export interface RouteLeg {
  mode: 'metro' | 'bus' | 'walk';
  fromStationName?: string;
  toStationName?: string;
  distanceMeters: number;
  durationMinutes: number;
  fareEstimate: number;
  lineCode?: string;
  lineName?: string;
}

export interface RouteOption {
  id: string;
  score: number;
  totalTimeMinutes: number;
  totalFare: number;
  walkingMinutes: number;
  waitingMinutes: number;
  transferCount: number;
  legs: RouteLeg[];
  explanation: string;
  weatherSnapshot?: any;
}

export interface TransitRouteProvider {
  findRoutes(
    origin: { lat: number; lng: number; label?: string },
    destination: { lat: number; lng: number; label?: string },
    departureTime: Date,
    preferences?: {
      fewerTransfers?: boolean;
      lessWalking?: boolean;
      cheaper?: boolean;
      accessible?: boolean;
    },
    weatherContext?: {
      condition: string;
      temperature: number;
    }
  ): Promise<RouteOption[]>;
}

export interface MapProviderConfig {
  getMapConfig(): Promise<{
    provider: 'leaflet' | 'google';
    apiKey?: string;
    mapStyle?: any;
    tileUrl?: string;
    attribution?: string;
  }>;
}

export interface WeatherData {
  condition: 'normal' | 'rain' | 'heavy_rain' | 'hot' | 'night';
  temperature: number;
  description: string;
}

export interface WeatherProvider {
  getWeather(lat: number, lng: number): Promise<WeatherData>;
}

export interface PlacePOI {
  id: string;
  stationId: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  address?: string;
  details?: string;
  featured: boolean;
  distanceMeters?: number;
  walkingMinutes?: number;
}

export interface PlacesProvider {
  getPlacesNearStation(stationId: string, category?: string): Promise<PlacePOI[]>;
}

export interface OcrResult {
  ocrText: string;
  confidence: number;
  metadata: {
    tripDate?: Date;
    fareEstimate?: number;
    stationName?: string;
    isTicket?: boolean;
  };
}

export interface OcrProvider {
  processTicketImage(buffer: Buffer, base64Data?: string): Promise<OcrResult>;
}

export interface StorageProvider {
  uploadFile(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<{ url: string; key: string }>;
  getSignedUrl(key: string): Promise<string>;
}

export interface VoucherPartnerProvider {
  redeemPartnerVoucher(voucherId: string, userId: string): Promise<{ code: string; partnerReference: string }>;
}

export interface NotificationProvider {
  sendNotification(userId: string, title: string, body: string, data?: any): Promise<void>;
}
