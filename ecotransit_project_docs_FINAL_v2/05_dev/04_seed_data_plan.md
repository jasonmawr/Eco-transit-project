# Seed Data Plan

## Goals

- Make local/staging useful without real production data.
- Seed enough stations/routes/posts/vouchers/users for coding and tests.
- Keep seed deterministic and reversible.

## Seed accounts

| Role | Email | Purpose |
|---|---|---|
| user | user@example.com | normal flows |
| moderator | moderator@example.com | moderation queues |
| admin | admin@example.com | voucher/content/config |

Passwords must be in local `.env` or documented only as local dev values.

## Seed transit data

- Metro line 1 sample stations around central area.
- Several bus stops/routes around District 1.
- Route-station ordering.
- Station guides/posts.

## Seed rewards

- 3 active vouchers.
- 1 expired voucher.
- 1 disabled voucher.
- Point ledger examples.

## Seed tickets

- pending ticket.
- verified ticket.
- rejected duplicate ticket.
- manual_review ticket.

## Seed UGC

- approved reviews.
- pending reviews.
- rejected reviews.

## Rules

- Never seed production secrets.
- Mark demo data clearly.
- Seed script must be idempotent.
