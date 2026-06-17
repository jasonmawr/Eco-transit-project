import { TransitRouteProvider, RouteOption, RouteLeg } from '@ecotransit/shared';
import { prisma } from '../../config/db.js';

interface DijkstraState {
  stationId: string;
  totalCost: number;
  totalMinutes: number;
  totalDistance: number;
  totalFare: number;
  legs: RouteLeg[];
  transferCount: number;
  lastMode: string | null;
}

export class LocalRouteProvider implements TransitRouteProvider {
  async findRoutes(
    origin: { lat: number; lng: number; label?: string },
    destination: { lat: number; lng: number; label?: string },
    _departureTime: Date,
    _preferences?: {
      fewerTransfers?: boolean;
      lessWalking?: boolean;
      cheaper?: boolean;
      accessible?: boolean;
    },
    weatherContext?: {
      condition: string;
      conditions?: ('normal' | 'rain' | 'hot' | 'night')[];
      temperature: number;
    }
  ): Promise<RouteOption[]> {
    console.log(`LocalRouteProvider: Calculating Dijkstra routes from (${origin.lat}, ${origin.lng}) to (${destination.lat}, ${destination.lng})`);

    const stations = await prisma.station.findMany();
    if (stations.length === 0) {
      return [];
    }

    // 1. Helper to find closest station
    const findNearest = (lat: number, lng: number) => {
      let nearest = stations[0];
      let minDist = Infinity;
      for (const s of stations) {
        const dist = Math.sqrt(Math.pow(s.lat - lat, 2) + Math.pow(s.lng - lng, 2));
        if (dist < minDist) {
          minDist = dist;
          nearest = s;
        }
      }
      return nearest;
    };

    const startStation = findNearest(origin.lat, origin.lng);
    const endStation = findNearest(destination.lat, destination.lng);

    // If starting and ending at the same station
    if (startStation.id === endStation.id) {
      return [
        {
          id: 'walk-only',
          score: 95,
          totalTimeMinutes: 10,
          totalFare: 0,
          walkingMinutes: 10,
          waitingMinutes: 0,
          transferCount: 0,
          legs: [
            {
              mode: 'walk',
              fromStationName: origin.label || 'Vị trí của bạn',
              toStationName: destination.label || 'Điểm đến',
              distanceMeters: 600,
              durationMinutes: 10,
              fareEstimate: 0,
            },
          ],
          explanation: 'Điểm đi và điểm đến rất gần nhau, EcoTransit đề xuất bạn đi bộ để bảo vệ sức khỏe.',
        },
      ];
    }

    // Load active edges
    const edges = await prisma.routeEdge.findMany({ where: { active: true } });

    // Build adjacency mapping
    const graph: Record<string, typeof edges> = {};
    for (const edge of edges) {
      if (!graph[edge.fromStationId]) {
        graph[edge.fromStationId] = [];
      }
      graph[edge.fromStationId].push(edge);
    }

    // Standard Dijkstra Search implementation
    const runDijkstra = (
      weightFn: (edge: any) => number,
      transferPenalty: number
    ): DijkstraState | null => {
      const queue: DijkstraState[] = [
        {
          stationId: startStation.id,
          totalCost: 0,
          totalMinutes: 0,
          totalDistance: 0,
          totalFare: 0,
          legs: [],
          transferCount: 0,
          lastMode: null,
        },
      ];

      // Keep track of minimum cost to reach each node
      const minCosts: Record<string, number> = {};
      let bestResult: DijkstraState | null = null;

      while (queue.length > 0) {
        // Sort queue to pull node with lowest cumulative cost
        queue.sort((a, b) => a.totalCost - b.totalCost);
        const curr = queue.shift()!;

        if (curr.stationId === endStation.id) {
          if (!bestResult || curr.totalCost < bestResult.totalCost) {
            bestResult = curr;
          }
          continue;
        }

        const costKey = `${curr.stationId}:${curr.lastMode || 'none'}`;
        if (minCosts[costKey] !== undefined && minCosts[costKey] <= curr.totalCost) {
          continue;
        }
        minCosts[costKey] = curr.totalCost;

        const neighbors = graph[curr.stationId] || [];
        for (const edge of neighbors) {
          const isTransfer = curr.lastMode !== null && curr.lastMode !== edge.mode;
          const edgeCost = weightFn(edge) + (isTransfer ? transferPenalty : 0);
          
          let legFare = edge.fareEstimate;
          if (edge.mode === 'metro' && legFare === 0) {
            legFare = 15000; // default base fare Metro 1
          }

          const nextLeg: RouteLeg = {
            mode: edge.mode as 'metro' | 'bus' | 'walk',
            fromStationName: stations.find(s => s.id === edge.fromStationId)?.name || 'Ga đi',
            toStationName: stations.find(s => s.id === edge.toStationId)?.name || 'Ga đến',
            distanceMeters: edge.distanceMeters,
            durationMinutes: edge.durationMinutes,
            fareEstimate: legFare,
            lineCode: edge.mode === 'metro' ? 'METRO1' : 'BUS19',
            lineName: edge.mode === 'metro' ? 'Metro Tuyến 1' : 'Tuyến Xe Buýt số 19',
          };

          queue.push({
            stationId: edge.toStationId,
            totalCost: curr.totalCost + edgeCost,
            totalMinutes: curr.totalMinutes + edge.durationMinutes,
            totalDistance: curr.totalDistance + edge.distanceMeters,
            totalFare: curr.totalFare + legFare,
            legs: [...curr.legs, nextLeg],
            transferCount: curr.transferCount + (isTransfer ? 1 : 0),
            lastMode: edge.mode,
          });
        }
      }

      return bestResult;
    };

    // Construct cost functions based on weather and preferences
    const activeConditions = weatherContext?.conditions || [weatherContext?.condition || 'normal'];

    const getWeights = (prefType: 'fastest' | 'min_walking' | 'min_transfers' | 'weather_optimized') => {
      let walkingMultiplier = 1.0;
      let busMultiplier = 1.0;
      let metroMultiplier = 1.0;
      let transferCost = 5.0;

      // 1. Adjust parameters based on weather conditions
      for (const cond of activeConditions) {
        if (cond === 'rain') {
          walkingMultiplier += 1.5;
          busMultiplier += 0.3;
          metroMultiplier += -0.2;
          transferCost += 5.0;
        } else if (cond === 'hot') {
          walkingMultiplier += 1.0;
          busMultiplier += 0.2;
          metroMultiplier += -0.1;
          transferCost += 2.0;
        } else if (cond === 'night') {
          walkingMultiplier += 0.5;
          transferCost += 3.0;
        }
      }

      // Clamp weather modifiers
      walkingMultiplier = Math.max(1.0, Math.min(3.5, walkingMultiplier));
      busMultiplier = Math.max(1.0, Math.min(1.8, busMultiplier));
      metroMultiplier = Math.max(0.7, Math.min(1.0, metroMultiplier));
      transferCost = Math.max(0.0, Math.min(20.0, transferCost));

      // 2. Adjust parameters based on user preference type
      if (prefType === 'min_walking') {
        walkingMultiplier *= 3.0;
      } else if (prefType === 'min_transfers') {
        transferCost += 25;
      }

      const weightFn = (edge: any) => {
        if (edge.mode === 'walk') {
          return edge.durationMinutes * walkingMultiplier;
        }
        if (edge.mode === 'bus') {
          return edge.durationMinutes * busMultiplier;
        }
        if (edge.mode === 'metro') {
          return edge.durationMinutes * metroMultiplier;
        }
        return edge.durationMinutes;
      };

      return { weightFn, transferCost };
    };

    // Calculate options for different targets
    const optTypes: ('fastest' | 'min_walking' | 'min_transfers' | 'weather_optimized')[] = [
      'fastest',
      'min_walking',
      'min_transfers',
      'weather_optimized',
    ];

    const rawOptions: DijkstraState[] = [];
    for (const optType of optTypes) {
      const { weightFn, transferCost } = getWeights(optType);
      const res = runDijkstra(weightFn, transferCost);
      if (res) {
        rawOptions.push(res);
      }
    }

    if (rawOptions.length === 0) {
      return [];
    }

    // Deduplicate identical paths (same sequence of legs by station names and modes)
    const uniqueOptions: RouteOption[] = [];
    const pathKeys = new Set<string>();

    for (const raw of rawOptions) {
      // Create walk connections from user start location to station and destination to location
      const walkLeg1: RouteLeg = {
        mode: 'walk',
        fromStationName: origin.label || 'Vị trí của bạn',
        toStationName: startStation.name,
        distanceMeters: 400,
        durationMinutes: 6,
        fareEstimate: 0,
      };

      const walkLeg2: RouteLeg = {
        mode: 'walk',
        fromStationName: endStation.name,
        toStationName: destination.label || 'Điểm đến',
        distanceMeters: 300,
        durationMinutes: 4,
        fareEstimate: 0,
      };

      const completedLegs = [walkLeg1, ...raw.legs, walkLeg2];
      const pathKey = completedLegs.map(l => `${l.fromStationName}->${l.mode}->${l.toStationName}`).join('|');

      if (pathKeys.has(pathKey)) {
        continue;
      }
      pathKeys.add(pathKey);

      // Re-sum total parameters with walk connect legs
      const totalWalkTime = 10; // walkLeg1 + walkLeg2 duration
      const totalMinutes = raw.totalMinutes + totalWalkTime;

      // Calculate score out of 100
      let score = 100;
      let weatherPenalty = 0;
      let explanation = '';

      for (const cond of activeConditions) {
        if (cond === 'rain') {
          weatherPenalty += raw.legs.some(l => l.mode === 'walk' || l.mode === 'bus') ? 15 : 4;
        } else if (cond === 'hot') {
          weatherPenalty += raw.legs.some(l => l.mode === 'walk') ? 10 : 2;
        } else if (cond === 'night') {
          weatherPenalty += raw.legs.some(l => l.mode === 'walk' && l.distanceMeters > 500) ? 15 : 4;
        }
      }
      // Clamp total weather penalty to prevent score distortion
      weatherPenalty = Math.min(30, weatherPenalty);

      const conditionsExcludingNormal = activeConditions.filter(c => c !== 'normal');
      if (conditionsExcludingNormal.length === 0) {
        explanation = 'Thời tiết mát mẻ, lộ trình xanh này được tối ưu hóa cho thời gian di chuyển nhanh nhất.';
      } else {
        const parts: string[] = [];
        if (conditionsExcludingNormal.includes('rain')) parts.push('mưa');
        if (conditionsExcludingNormal.includes('hot')) parts.push('nắng nóng');
        if (conditionsExcludingNormal.includes('night')) parts.push('trời tối');

        let conditionStr = '';
        if (parts.length === 1) {
          if (parts[0] === 'mưa') conditionStr = 'Trời mưa';
          else if (parts[0] === 'nắng nóng') conditionStr = 'Thời tiết nắng nóng';
          else if (parts[0] === 'trời tối') conditionStr = 'Trời tối';
        } else if (parts.length === 2) {
          const p1 = parts[0] === 'mưa' ? 'trời mưa' : parts[0];
          const p2 = parts[1];
          conditionStr = `Trong điều kiện ${p1} và ${p2}`;
        } else {
          const p1 = parts[0] === 'mưa' ? 'trời mưa' : parts[0];
          const p2 = parts[1];
          const p3 = parts[2];
          conditionStr = `Trong điều kiện ${p1}, ${p2} và ${p3}`;
        }

        let strategy = 'ưu tiên các phương tiện có mái che/điều hòa và hạn chế đi bộ đường dài ngoài trời';
        if (conditionsExcludingNormal.includes('rain') && conditionsExcludingNormal.includes('night')) {
          strategy = 'tối ưu hóa lộ trình di chuyển an toàn, ưu tiên Metro và tránh các đoạn đi bộ trơn trượt vào ban đêm';
        } else if (conditionsExcludingNormal.includes('hot') && conditionsExcludingNormal.includes('night')) {
          strategy = 'tối ưu hóa lộ trình mát mẻ, di chuyển an toàn và tránh đi bộ chặng xa';
        } else if (conditionsExcludingNormal.includes('rain')) {
          strategy = 'ưu tiên Metro có mái che và hạn chế tối đa các đoạn đi bộ ngoài trời trơn trượt';
        } else if (conditionsExcludingNormal.includes('hot')) {
          strategy = 'ưu tiên tàu Metro máy lạnh mát mẻ và giảm thiểu tối đa đi bộ dưới nắng gắt';
        } else if (conditionsExcludingNormal.includes('night')) {
          strategy = 'ưu tiên lộ trình an toàn, đơn giản, ít chuyển tuyến và hạn chế đi bộ xa ban đêm';
        }

        explanation = `${conditionStr}, EcoTransit ${strategy}.`;
      }

      score = score - weatherPenalty - raw.transferCount * 8 - Math.floor(raw.totalMinutes / 5);

      uniqueOptions.push({
        id: `dijkstra-route-${uniqueOptions.length}-${Date.now()}`,
        score: Math.max(score, 15),
        totalTimeMinutes: totalMinutes,
        totalFare: raw.totalFare,
        walkingMinutes: totalWalkTime,
        waitingMinutes: 2 + raw.transferCount * 3,
        transferCount: raw.transferCount,
        legs: completedLegs,
        explanation,
        weatherSnapshot: weatherContext,
      });
    }

    return uniqueOptions.sort((a, b) => b.score - a.score);
  }
}
