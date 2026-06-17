# Domain Glossary

| Term | Meaning |
|---|---|
| EcoTransit | Consumer web app experience layer for public transit |
| Operator core | Official operational system for route, fare, ticketing, or payment; out of EcoTransit MVP scope |
| Route search | Request to find bus/metro/walking route options |
| Weather-aware score | EcoTransit score that adjusts route ranking based on rain/heat and user preferences |
| Station | Metro station or bus stop in the local transit dataset |
| Guide | Curated content about station/route/place experience |
| UGC | User-generated content, such as reviews and tips |
| Ticket | Uploaded proof image for a bus/metro trip |
| Verification status | uploaded, pending, verified, rejected, manual_review |
| Points ledger | Append-only record of points changes |
| Balance cache | Denormalized user points balance derived from ledger |
| Voucher | Reward purchasable with points |
| Redemption | Voucher claim by user, linked to points ledger entry |
| Bill | Shareable trip summary/card based on a route/travel snapshot |
| Privacy level | Bill visibility mode, e.g. masked, station_only, full_public |
| Moderator | User role that reviews tickets and UGC |
| Admin | User role that manages system configuration/rewards/content |
| Adapter | Provider wrapper that isolates external API integration from core business logic |
