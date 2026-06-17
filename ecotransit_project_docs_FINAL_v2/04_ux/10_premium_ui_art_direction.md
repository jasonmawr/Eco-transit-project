# Premium UI Art Direction

## Brand direction

EcoTransit should feel clean, young, confident, urban and eco-friendly.

## Visual identity

| Token | Value intent |
|---|---|
| Primary | Metro green / transit emerald |
| Secondary | Sky/cyan for map and movement |
| Accent | Warm reward yellow/orange for points/vouchers |
| Surface | Soft off-white, mint-tinted panels, glass map cards |
| Danger | Clear but not harsh red |
| Typography | Modern sans-serif, high readability, large mobile headings |

## Suggested palette

```css
--eco-primary: #06A77D;
--eco-primary-deep: #047857;
--eco-mint: #E7F8F2;
--eco-sky: #38BDF8;
--eco-ink: #10201B;
--eco-muted: #66756F;
--eco-reward: #FBBF24;
--eco-surface: #FFFFFF;
--eco-soft: #F6FBF9;
```

## Core UI motifs

- Route line as visual anchor.
- Station dots and transfer chips.
- Weather badge as contextual layer.
- Reward coin/card as delight moment.
- Time bill as shareable card with distinct identity.
- Mobile bottom sheet for map interactions.

## Anti-slop bans

- No generic SaaS hero with random abstract blobs unrelated to transit.
- No crowded admin-style tables on public mobile screens.
- No tiny gray text for critical route instructions.
- No inconsistent border radius/shadows.
- No placeholder icons without semantic meaning.
- No carousel spam.
- No animations that delay core route search.

## Motion rules

- Respect `prefers-reduced-motion`.
- Route cards reveal in <= 250ms stagger.
- Bottom sheet transitions <= 280ms.
- Reward success may use a short celebratory motion <= 900ms.
- Bill generation can show a 1-step “creating card” animation, but must not block copy link.
