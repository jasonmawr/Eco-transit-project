# Final Executive Brief — EcoTransit

## Product positioning

EcoTransit is a modern public-transit experience platform for young users in HCMC. The customer reference site, HCMC Metro, is the starting benchmark. EcoTransit must be more complete, more beautiful, more interactive and more useful across the full journey.

EcoTransit is not the official operator core for ticketing or metro operations. It is an experience layer that helps users plan, discover, share and build habits around public transport.

## Final product promise

> “Plan a bus + metro trip, understand the weather impact, discover cool places near stations, learn how to combine metro and bus, upload a ticket to earn points, redeem rewards, and share a beautiful time bill on social media.”

## What must be built for the current complete brief

1. Public landing page with premium visual identity.
2. Map-first route planner supporting bus + metro + walking.
3. Weather-aware route scoring and explanation.
4. Metro/station detail pages with facilities, nearby places, guides and reviews.
5. Nearby discovery page with station/category filters and map/list mode.
6. Articles/video guides for combining metro + bus by weather/schedule.
7. Quiz for transit persona and suggested first routes.
8. Auth/profile/points wallet.
9. Ticket photo upload with async verification and manual review fallback.
10. Immutable points ledger and reward/voucher redemption.
11. UGC review/guide submission with moderation before publishing.
12. Time bill generation from trip data, privacy masking, share card and fallback copy link.
13. In-app notifications for verification, points, voucher and moderation outcomes.
14. Admin console for content, places, reviews, tickets, vouchers, users, settings and audit.
15. Observability, backup/restore, health checks, CI/CD and release gates.

## Product differentiation over HCMC Metro benchmark

EcoTransit must keep the useful baseline patterns from HCMC Metro: route lookup, station map, nearby utilities, offers and news. It must exceed the benchmark through:

- Bus + metro multimodal route planning.
- Weather-aware recommendations.
- Youth-oriented discovery and lifestyle content.
- Community reviews and guides.
- Ticket photo rewards and voucher redemption.
- Social time bill card.
- Stronger mobile visual design.
- Admin moderation and privacy controls.

## Final scope principle

This pack is the final baseline for the current known requirement. It prevents common misses through a traceability matrix, acceptance criteria and UAT scripts. It cannot freeze future customer changes; future changes must be handled through `09_delivery/05_change_control.md`.
