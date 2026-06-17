# UI Quality Gate

A UI task is not complete until this gate passes.

## Visual design

- [ ] Screen has a clear hierarchy: title, primary action, secondary actions, body content.
- [ ] Color palette is coherent and uses one primary accent.
- [ ] Radius system is consistent.
- [ ] Typography has intentional scale and weights.
- [ ] Spacing uses consistent rhythm.
- [ ] UI does not look like generic AI-generated SaaS/template.

## States

- [ ] Loading state exists.
- [ ] Empty state exists.
- [ ] Error state exists.
- [ ] Success state exists where applicable.
- [ ] Disabled/pending state exists for async actions.
- [ ] External-provider-degraded state exists for map/route/weather where applicable.

## Mobile

- [ ] 390px width has no horizontal overflow.
- [ ] Tap targets are usable.
- [ ] Primary CTA is visible without awkward scrolling when appropriate.
- [ ] Map/bottom sheet does not trap scroll.
- [ ] Tables collapse or scroll safely.

## Accessibility

- [ ] Keyboard navigation works.
- [ ] Focus state visible.
- [ ] Text contrast passes AA.
- [ ] Inputs have labels.
- [ ] Status does not rely only on color.
- [ ] Motion respects reduced-motion.

## Domain UX

- [ ] Route recommendation explains weather/walking/transfer tradeoff.
- [ ] Ticket status copy is clear.
- [ ] Points/voucher actions clearly state cost and consequence.
- [ ] Bill sharing clearly states privacy level.
- [ ] Moderation actions require reason/confirmation where needed.
