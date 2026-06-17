# UAT Script for Customer Signoff

## Scenario 1 — Guest route planning

1. Open home on mobile.
2. Search route from a central location to a Metro Line 1 station.
3. Confirm route options show time/fare/walking/transfer/weather explanation.
4. Open route detail timeline.
5. Open station detail.

Pass if the journey is understandable without login.

## Scenario 2 — Nearby discovery

1. Open nearby page.
2. Select Bến Thành station.
3. Filter café/food/service.
4. Switch map/list.
5. Open place and read review/guide.

Pass if it feels more useful than a static place list.

## Scenario 3 — Content/video guide

1. Open guide hub.
2. Filter bus+metro or rain/weather.
3. Open article/video guide.
4. Navigate to related station/route.

Pass if content is discoverable and linked to transit context.

## Scenario 4 — Ticket points

1. Login as user.
2. Upload ticket sample.
3. See pending status.
4. Login as moderator/admin and approve.
5. Return as user and see points ledger update.

Pass if points are not awarded before verification.

## Scenario 5 — Rewards

1. Open rewards wallet.
2. Select voucher.
3. Redeem.
4. See code and ledger deduction.
5. Check redemption history.

Pass if inventory/points are consistent.

## Scenario 6 — Time bill share

1. Create bill from route.
2. Confirm privacy defaults to station_only.
3. Copy/share URL.
4. Open public bill page.

Pass if it is attractive and does not leak exact sensitive coordinates.

## Scenario 7 — Admin moderation/content

1. View pending tickets/reviews.
2. Approve/reject with reason.
3. Create/publish article.
4. Pause voucher.
5. View audit logs.

Pass if no DB/manual workaround is needed for normal operations.
