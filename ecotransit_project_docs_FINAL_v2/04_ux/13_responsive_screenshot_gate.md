# Responsive Screenshot Gate

## Required viewports

- Mobile: 390 × 844.
- Tablet: 768 × 1024.
- Desktop: 1440 × 900.

## For each user-facing batch

Capture screenshots for changed screens and check:

- No horizontal overflow.
- Header and bottom navigation are usable.
- Map controls do not overlap critical route cards.
- CTA buttons are reachable without awkward scrolling.
- Text contrast is readable outdoors/mobile.
- Error/empty/loading states are designed.
- Forms have clear labels and validation messages.
- Long Vietnamese text wraps cleanly.
- Touch targets >= 44px where practical.

## Required screenshot evidence list

`09_delivery/screenshot_evidence/` should contain named screenshots or report references:

```text
home-mobile.png
route-planner-mobile.png
route-detail-mobile.png
station-detail-mobile.png
nearby-mobile.png
ticket-upload-mobile.png
rewards-mobile.png
bill-share-mobile.png
admin-moderation-desktop.png
```

A batch cannot be marked complete if it changes public UI but provides no screenshot evidence.
