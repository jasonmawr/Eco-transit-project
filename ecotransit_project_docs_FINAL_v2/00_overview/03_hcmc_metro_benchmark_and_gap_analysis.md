# HCMC Metro Benchmark and Gap Analysis

## Why this document exists

The customer says: “HCMC Metro is the foundation; the new web must be developed beyond that.” This document translates that vague request into testable product requirements.

## Observed benchmark capabilities

As of the final documentation date, the HCMC Metro website exposes the following public concepts:

| Benchmark area | HCMC Metro baseline behavior | EcoTransit requirement |
|---|---|---|
| Home/navigation | Menu groups for offers, route lookup, nearby station utilities, digital map, news/FAQ and language selector | Must include all equivalent information architecture concepts, but presented in a more modern map-first/mobile-first shell |
| Route lookup | Origin/destination selection for Metro Line 1, fare, time, distance, station count, detail journey | Must support metro and bus+walking route options, weather scoring, fare estimate, trip timeline, station context and bill generation |
| Nearby utilities | Station filter and category filter such as café, restaurant, shopping, service | Must support list + map, richer place cards, distance/walking time, review snippets, guide links and saved/favorite state |
| Digital map | Quick station search, layers such as Metro/Cafe/Hotel/Food/Shopping/Service, walking guidance, open Google Maps | Must support route planning drawer, station/POI layers, current-location flow, weather badge, guide/review markers and mobile bottom sheet |
| Offers | Displays offers/merchant promotion content | Must support points redemption, voucher inventory, redemption history and admin-managed offers |
| News | Displays transit-related news | Must support curated article/video guides, weather/schedule context and station-linked content |
| Language | VN/EN/JP/KR language choices are visible | EcoTransit must be i18n-ready; ship Vietnamese fully and English for public core screens; JP/KR can be prepared as language shells if content is not supplied |

## Do not copy

Do not copy HCMC Metro layout, visual assets, icons, code, text or proprietary data. Use the site only as a functional benchmark.

## Must equal or exceed matrix

| Capability | Equal baseline? | Exceed target |
|---|---:|---|
| Route lookup | Yes | Multimodal bus + metro + walking, weather-aware score, route reason |
| Fare/time/distance | Yes | Adds walking/waiting/transfer breakdown and comfort/weather score |
| Station list | Yes | Adds station detail page with amenities, nearby reviews, guides and posts |
| Nearby places | Yes | Adds UGC, moderation, distance, map/list toggle and content relation |
| Map | Yes | Adds route drawer, POI/review layers, share route and bill action |
| Offers | Yes | Adds points wallet and voucher redemption logic |
| News/content | Yes | Adds guide/video CMS and station/weather linking |
| Account | Exceed | Auth, profile, points, tickets, bills, reviews, notifications |
| Admin | Exceed | Moderation, ticket review, vouchers, content, stations, audit, settings |
| Social sharing | Exceed | Time bill card, privacy masking, share URL, OG image/card |
| UI quality | Exceed | Taste Skill premium UI gate, screenshot QA and motion system |

## Acceptance statement

A build is not acceptable if it only recreates HCMC Metro route lookup and nearby pages. It must demonstrate at least one complete happy path across: route planning → station/place discovery → time bill or ticket upload → points/reward or review/content interaction.
