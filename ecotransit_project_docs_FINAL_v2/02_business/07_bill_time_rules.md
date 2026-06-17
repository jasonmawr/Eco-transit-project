# Time Bill Business Rules

## Purpose

A time bill is a shareable travel summary generated from a route or completed trip. It is a social artifact, not an official transport receipt.

## Inputs

- route_search_id or selected_route_snapshot
- selected_route_id
- departure_time and optional arrival_time
- total_minutes, walking_minutes, waiting_minutes, transfer_count
- fare estimate
- weather snapshot
- origin/destination labels after privacy masking
- privacy_level

## Privacy levels

| Level | Behavior | Default? |
|---|---|---:|
| `masked` | Show only broad area and total time | No |
| `station_only` | Show station/route labels, not exact coordinates | Yes |
| `full_public` | Show user-approved detailed labels, still avoid exact home/work coordinates | No |

## Rules

1. Default privacy is `station_only`.
2. Never publish exact latitude/longitude on public bill pages by default.
3. If origin/destination is near home/work-like saved location, force masking.
4. `share_slug` must be random, non-sequential and unique.
5. Public bill page must show it is user-generated/estimated, not official proof of travel.
6. Logged-in users can see their bill history and delete/unpublish bills.
7. Guest bill can be temporary; if persisted, it must still obey privacy and expiry settings.
8. Share count increments idempotently by event/session to avoid spam inflation.

## Acceptance

- Bill can be created from a route.
- Public page loads without authentication when public.
- Private/unpublished/deleted bill returns friendly unavailable state.
- Copy link fallback works on unsupported Web Share browsers.
