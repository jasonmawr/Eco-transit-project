import { PlacesProvider, PlacePOI } from '@ecotransit/shared';
import { prisma } from '../../config/db.js';

export class LocalPlacesProvider implements PlacesProvider {
  async getPlacesNearStation(stationId: string, category?: string): Promise<PlacePOI[]> {
    console.log(`LocalPlacesProvider: Querying POIs for station: ${stationId}, category: ${category || 'all'}`);
    
    const queryConditions: any = { stationId };
    if (category && category !== 'all') {
      queryConditions.category = category;
    }

    const dbPlaces = await prisma.place.findMany({
      where: queryConditions,
    });

    return dbPlaces.map((p: any) => ({
      id: p.id,
      stationId: p.stationId,
      name: p.name,
      category: p.category,
      lat: p.lat,
      lng: p.lng,
      address: p.address || undefined,
      details: p.details || undefined,
      featured: p.featured,
      distanceMeters: 150, // mock distance
      walkingMinutes: 2,   // mock walking duration
    }));
  }
}
