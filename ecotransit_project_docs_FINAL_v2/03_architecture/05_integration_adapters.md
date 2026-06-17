# Integration Adapters

## Required adapter interfaces

### Route provider

```ts
interface RouteProvider {
  searchTransitRoutes(input: RouteSearchInput): Promise<RouteCandidate[]>;
}
```

Responsibilities:
- Call external routes provider.
- Normalize legs/modes/durations/fare estimates.
- Hide provider-specific shapes from business logic.

### Weather provider

```ts
interface WeatherProvider {
  getWeatherContext(input: WeatherInput): Promise<WeatherContext>;
}
```

Responsibilities:
- Return condition, temperature, precipitation probability.
- Cache by location/time bucket.

### Places provider

```ts
interface PlacesProvider {
  findNearbyPlaces(input: NearbyPlacesInput): Promise<PlaceSummary[]>;
}
```

Responsibilities:
- Return external place metadata only.
- Do not treat external ratings/reviews as EcoTransit UGC.

### Storage provider

```ts
interface StorageProvider {
  putPrivateObject(input: PutObjectInput): Promise<StoredObject>;
  createSignedReadUrl(path: string, ttlSeconds: number): Promise<string>;
}
```

Responsibilities:
- Store private originals.
- Generate expiring URLs for authorized access.

### OCR provider

```ts
interface OcrProvider {
  extractText(input: OcrInput): Promise<OcrResult>;
}
```

Responsibilities:
- Return text, confidence, raw payload.
- Never decide points directly.

### Notification provider

```ts
interface NotificationProvider {
  notify(input: NotificationInput): Promise<void>;
}
```

Responsibilities:
- Support in-app and optional push/email later.

## Adapter test requirements

- Every adapter must have mock/fake implementation.
- External API failures must be mapped to domain errors.
- Timeout and retry policy must be explicit.
- Sensitive request/response fields must not be logged.
