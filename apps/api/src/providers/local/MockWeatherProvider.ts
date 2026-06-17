import { WeatherProvider, WeatherData } from '@ecotransit/shared';

export class MockWeatherProvider implements WeatherProvider {
  private presets: WeatherData[] = [
    { condition: 'normal', temperature: 28, description: 'Thời tiết mát mẻ, trời nhiều mây.' },
    { condition: 'rain', temperature: 26, description: 'Có mưa rào rải rác trong khu vực.' },
    { condition: 'heavy_rain', temperature: 24, description: 'Mưa to giông bão, nguy cơ ngập úng nhẹ.' },
    { condition: 'hot', temperature: 35, description: 'Nắng nóng gay gắt cực điểm.' },
    { condition: 'night', temperature: 27, description: 'Thời tiết mát mẻ dễ chịu về đêm.' }
  ];

  async getWeather(lat: number, lng: number): Promise<WeatherData> {
    console.log(`MockWeatherProvider: Querying weather for coordinates (${lat}, ${lng})`);
    
    // Choose night preset if current time is evening
    const hour = new Date().getHours();
    if (hour >= 18 || hour < 5) {
      return this.presets[4]; // night
    }

    // Default return normal or hot depending on coordinates parity
    const check = Math.floor(lat + lng) % 4;
    return this.presets[check];
  }
}
