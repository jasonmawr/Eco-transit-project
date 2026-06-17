# Database Design

## Recommended database

PostgreSQL with migrations managed by selected ORM/query builder.

Recommended ORM options:

- Prisma: strong DX, schema-first, fast start.
- Drizzle: type-safe SQL-like, lighter abstraction.

Choose one in an ADR before implementation.

## Tables

### users

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | generated |
| email | text unique | nullable only if provider allows? prefer required |
| password_hash | text nullable | nullable for OAuth-only account |
| auth_provider | text | local/google/etc |
| provider_subject | text nullable | OAuth subject |
| display_name | text | public/friendly name |
| avatar_url | text nullable | external avatar |
| role | text | user/moderator/admin |
| status | text | active/disabled |
| points_balance_cache | int | derived cache |
| created_at | timestamptz |  |
| updated_at | timestamptz |  |

Indexes: unique(email), idx(role,status), optional unique(auth_provider, provider_subject).

### sessions

| Column | Type | Notes |
|---|---|---|
| id | uuid pk |  |
| user_id | uuid fk users |  |
| refresh_token_hash | text unique | never store raw token |
| user_agent | text nullable |  |
| ip_hash | text nullable | hash only |
| csrf_secret | text nullable | if cookie auth requires CSRF |
| last_seen_at | timestamptz |  |
| expires_at | timestamptz |  |
| revoked_at | timestamptz nullable |  |
| created_at | timestamptz |  |

### stations

| Column | Type | Notes |
|---|---|---|
| id | uuid pk |  |
| external_source | text | internal/gobus/hurc/manual |
| station_code | text | source code |
| station_name | text | user-facing |
| station_type | text | bus_stop/metro_station |
| lat | numeric |  |
| lng | numeric |  |
| district | text nullable |  |
| address | text nullable |  |
| amenities | jsonb |  |
| active | boolean |  |
| updated_at | timestamptz |  |

Indexes: unique(external_source, station_code), idx(station_type,district), geo index if supported.

### routes

| Column | Type | Notes |
|---|---|---|
| id | uuid pk |  |
| external_source | text |  |
| route_code | text |  |
| route_name | text |  |
| transport_mode | text | bus/metro/transit |
| geometry_polyline | text nullable |  |
| fare_min | int nullable | VND |
| fare_max | int nullable | VND |
| metadata | jsonb | provider/source details |
| active | boolean |  |
| updated_at | timestamptz |  |

Indexes: unique(external_source, route_code).

### route_stations

| Column | Type | Notes |
|---|---|---|
| route_id | uuid fk routes | composite pk |
| station_id | uuid fk stations | composite pk |
| order_index | int | route order |
| arrival_offset | int nullable | minutes/seconds depending decision |
| departure_offset | int nullable |  |

### tickets

| Column | Type | Notes |
|---|---|---|
| id | uuid pk |  |
| user_id | uuid fk users |  |
| ticket_type | text | bus/metro/unknown |
| image_path | text | private storage path |
| image_hash | text | exact hash |
| image_phash | text nullable | perceptual hash |
| trip_date | date nullable | from metadata/OCR/manual |
| station_from_id | uuid nullable |  |
| station_to_id | uuid nullable |  |
| fare_amount | int nullable | VND |
| ocr_text | text nullable |  |
| ocr_payload | jsonb |  |
| verification_status | text | uploaded/pending/verified/rejected/manual_review |
| verification_score | numeric nullable | 0-1 or 0-100, decide consistently |
| rejection_reason | text nullable |  |
| verified_by | uuid nullable | moderator/admin/system |
| verified_at | timestamptz nullable |  |
| created_at | timestamptz |  |
| updated_at | timestamptz |  |

Indexes: idx(user_id, verification_status), idx(trip_date), unique(image_hash) if policy permits.

### point_ledger_entries

| Column | Type | Notes |
|---|---|---|
| id | uuid pk |  |
| user_id | uuid fk users |  |
| source_type | text | ticket/bonus/redeem/admin_adjust/quiz |
| source_id | uuid nullable | idempotency anchor |
| delta | int | positive or negative |
| balance_after | int |  |
| status | text | posted/reversed/pending? prefer posted only for balance |
| created_at | timestamptz |  |

Indexes: idx(user_id, created_at), unique(source_type, source_id) where source_id not null.

### vouchers

| Column | Type | Notes |
|---|---|---|
| id | uuid pk |  |
| partner_name | text |  |
| title | text |  |
| description | text |  |
| points_cost | int |  |
| voucher_code_encrypted | text nullable | for shared/manual code; prefer code table if many |
| quantity_total | int |  |
| quantity_remaining | int |  |
| valid_from | timestamptz |  |
| valid_to | timestamptz |  |
| redemption_type | text | manual_code/partner_api |
| partner_payload | jsonb |  |
| status | text | draft/active/disabled/expired |
| created_at | timestamptz |  |
| updated_at | timestamptz |  |

Indexes: idx(status, valid_to).

### voucher_redemptions

| Column | Type | Notes |
|---|---|---|
| id | uuid pk |  |
| voucher_id | uuid fk vouchers |  |
| user_id | uuid fk users |  |
| points_entry_id | uuid fk point_ledger_entries | negative ledger |
| redemption_code | text nullable | encrypted/protected if sensitive |
| status | text | redeemed/cancelled/failed |
| redeemed_at | timestamptz |  |

### bills

| Column | Type | Notes |
|---|---|---|
| id | uuid pk |  |
| user_id | uuid nullable | guest temporary possible |
| route_snapshot | jsonb | frozen route |
| weather_snapshot | jsonb | frozen weather |
| total_minutes | int |  |
| walking_minutes | int |  |
| waiting_minutes | int |  |
| transfer_count | int |  |
| share_slug | text unique | random |
| share_public | boolean |  |
| privacy_level | text | masked/station_only/full_public |
| share_count | int |  |
| expires_at | timestamptz nullable | for guest/temp |
| created_at | timestamptz |  |

### reviews

| Column | Type | Notes |
|---|---|---|
| id | uuid pk |  |
| user_id | uuid fk users |  |
| station_id | uuid nullable |  |
| place_name | text |  |
| place_provider | text | internal/google/osm |
| place_ref | text nullable | provider place_id/ref |
| rating | int | 1-5 |
| content | text |  |
| media | jsonb | asset ids/paths |
| moderation_status | text | pending/approved/rejected/hidden |
| moderation_reason | text nullable |  |
| published_at | timestamptz nullable |  |
| created_at | timestamptz |  |
| updated_at | timestamptz |  |

### posts

| Column | Type | Notes |
|---|---|---|
| id | uuid pk |  |
| author_id | uuid nullable |  |
| post_type | text | article/video/guide |
| title | text |  |
| slug | text unique |  |
| summary | text |  |
| body_md_or_json | text/jsonb | choose consistently |
| cover_image_url | text nullable |  |
| video_url | text nullable |  |
| station_id | uuid nullable |  |
| status | text | draft/published/archived |
| published_at | timestamptz nullable |  |
| created_at | timestamptz |  |
| updated_at | timestamptz |  |

### media_assets

| Column | Type | Notes |
|---|---|---|
| id | uuid pk |  |
| owner_type | text | ticket/review/post/bill |
| owner_id | uuid |  |
| path | text | storage path |
| mime_type | text |  |
| size_bytes | int |  |
| visibility | text | private/public_after_approval/public |
| created_at | timestamptz |  |

### audit_logs

| Column | Type | Notes |
|---|---|---|
| id | uuid pk |  |
| actor_id | uuid nullable | system or user |
| action | text |  |
| target_type | text |  |
| target_id | uuid/text |  |
| payload | jsonb | no secrets |
| request_id | text nullable |  |
| created_at | timestamptz |  |

### geofences

| Column | Type | Notes |
|---|---|---|
| id | uuid pk |  |
| name | text | e.g. central_administrative_area |
| polygon_geojson | jsonb | configurable |
| active | boolean |  |
| created_at | timestamptz |  |
| updated_at | timestamptz |  |
