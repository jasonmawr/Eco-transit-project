# Final Scope Lock and Assumptions

## Scope locked as included

The final release baseline includes all current customer-requested flows:

- Map route planner for bus + metro.
- Weather-aware route recommendation.
- Nearby places around stations/ga/trạm.
- Reviews and guide sharing.
- Article/video guides for metro + bus by weather/schedule.
- Ticket photo upload for points.
- Rewards/voucher redemption.
- Time bill generation and social sharing.
- Admin moderation and management.
- Production-readiness basics.

## Decisions that are no longer unspecified

| Former unknown | Final decision |
|---|---|
| ORM/query builder | Prisma ORM |
| Rich text editor | TipTap editor in admin CMS |
| Voucher partner API | Internal/manual voucher inventory first; partner API adapter interface included but not blocking release |
| Queue engine | BullMQ + Redis for async jobs; Cloud Function adapter can be used for storage-trigger OCR if hosting supports it |
| Geofence central administrative area | Seeded polygon config + admin settings screen; not hard-coded |
| Moderation automation | Lightweight rule checks + manual approval required for public UGC and uncertain tickets |
| Map provider | Google Maps Platform primary; map provider adapter boundary required |
| OCR provider | Google Cloud Vision adapter primary; local dev stub only in non-production |

## Assumptions

1. The team can obtain required API keys for map/routing/place/weather/OCR before production.
2. Public bus data may be incomplete; system must support seeded/static route data and adapter fallback.
3. Voucher redemption can launch with internal/manual code inventory; partner integration is not required to prove the product.
4. Legal policy text must be reviewed by project owner before public launch.
5. Customer-provided content, videos and voucher campaigns can be edited through admin CMS.
6. If exact official transit APIs are unavailable, EcoTransit must be honest in UI: show estimated routes and timestamp/source.

## Change-control rule

Any new request outside this scope must be logged in `09_delivery/05_change_control.md`, sized, prioritized and accepted before implementation.
