# Microinteractions and Motion

## Required microinteractions

| Flow | Interaction |
|---|---|
| Route search | Search button transitions to progress, route cards slide into bottom sheet |
| Weather-aware route | Weather badge pulses once and explanation appears inline |
| Station selection | Station dot highlights and detail sheet snaps up |
| Ticket upload | Upload progress, image preview, success pending state |
| Points awarded | Short reward confirmation animation |
| Voucher redeem | Confirmation sheet, success code reveal |
| Bill generation | Card preview assembles quickly, copy/share button highlights |
| Review submit | Pending moderation badge and timeline |

## Reduced motion

When `prefers-reduced-motion` is enabled:
- Replace slide/stagger with fade or instant state change.
- Disable celebratory particles.
- Keep all content accessible.

## Motion acceptance

Motion must never block route search, form submission or voucher redemption. Loading states must not hide error recovery actions.
