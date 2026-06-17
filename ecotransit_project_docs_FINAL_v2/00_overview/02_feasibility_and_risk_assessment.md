# Feasibility and Risk Assessment

> EcoTransit Project Docs v1.0 — generated for coding-agent handoff.
> Principle: production-grade, mobile-first, privacy-by-design, không xây trùng lõi vận hành của Go!Bus/HCMC Metro; EcoTransit là lớp trải nghiệm, nội dung, gamification và chia sẻ.


## Executive verdict

EcoTransit is feasible as a production-grade MVP within the proposed time window only if the team preserves the product boundary: do not replace operator-grade route, ticketing, fare, or payment systems. Build an experience/enrichment layer with external route/weather/place adapters, local seed data, and a controlled points/voucher system.

## Feasibility scorecard

| Area | Feasibility | Reason | Required control |
|---|---:|---|---|
| Product positioning | High | Differentiated if focused on youth experience, UGC, guide, bill, rewards | Explicitly ban operator-core claims |
| Route search | Medium-High | External transit routing can cover MVP, but provider limitations and cost/availability exist | Adapter + cache + fallback + route snapshot |
| Weather-aware scoring | High | Can be implemented as scoring layer over route options | Keep scoring transparent and testable |
| Station/guide content | High | Can seed stations and add local enrichment/UGC | Moderation and content status model |
| Ticket upload | High | Upload itself is straightforward | Secure upload pipeline |
| Ticket verification | Medium-Low | Fraud and changing ticket/open-loop formats make full automation hard | Hybrid verify: technical checks + OCR + rules + manual review |
| Points/vouchers | Medium-High | Internal ledger and manual/CSV vouchers are feasible | Ledger, idempotency, quantity locks |
| Social bill sharing | Medium-High | Technically simple, privacy-sensitive | Privacy default, no exact coordinates by default |
| Notifications | Medium | Status notifications feasible; push requires provider setup | In-app first, FCM optional/P1 |
| Admin moderation | High | CRUD/workflow screens are straightforward | RBAC, audit logs, queues, filters |
| One-month delivery | Medium | Possible for P0/P1-lite if scope is controlled | Strict sprint slicing and no microservices |

## Main feasibility conclusion

The hardest parts are not map rendering or CRUD. The hardest parts are:

1. Correct product boundary.
2. Ticket verification trust/fraud control.
3. Privacy-safe sharing.
4. External data/provider uncertainty.
5. UI polish that does not look like a generic AI-generated app.

## Risk register

| ID | Risk | Probability | Impact | Mitigation | Owner gate |
|---|---|---:|---:|---|---|
| R-01 | App duplicates official operator functions and loses differentiation | Medium | High | Keep EcoTransit as experience layer | Product owner |
| R-02 | Google/route/weather APIs have quota/cost/provider issues | Medium | Medium | Adapter + cache + mock provider + fallback copy | Tech lead |
| R-03 | Ticket OCR is unreliable | High | High | Manual review path, confidence scoring, no automatic unlimited points | Backend lead |
| R-04 | Fraud through reused/edited ticket images | High | High | image_hash, pHash, quota/day, duplicate detection, review queue | Backend/security |
| R-05 | Share bill leaks sensitive travel pattern | Medium | High | Default `station_only`, mask exact location/time where needed | Product/security |
| R-06 | UGC creates moderation/legal risk | Medium | High | Pending by default, report/remove workflow, audit trail | Moderator/admin |
| R-07 | P1 features creep into P0 | High | Medium | Roadmap gates and no undocumented work | PM/agent |
| R-08 | UI becomes pretty but unusable on mobile | Medium | High | Mobile-first E2E + accessibility checklist | Frontend |
| R-09 | Voucher partner API is undefined | High | Medium | MVP manual_code/CSV/import only | Product/backend |
| R-10 | No reliable seed data | Medium | Medium | Minimal curated seed, import scripts, admin-editable geofence | Data owner |

## Go/No-Go rules

### Go for P0 implementation when

- Stack is chosen and recorded in ADR.
- Data provider strategy is adapter-based.
- Ticket verification is explicitly hybrid, not fully automated by promise.
- Voucher partner API is marked optional/P1 unless contract is provided.
- Privacy rules for bill sharing are approved.
- UX direction and Taste Skill prompt are approved.

### No-Go until clarified when

- Owner expects official ticket/payment integration in MVP.
- The team claims fully automated anti-fraud ticket verification with no manual review.
- The team stores exact home/work coordinates in public bill links.
- The team asks agent to implement UI without design system/taste gate.
