# Content Moderation Rules

## Content types

- Review.
- Guide.
- Post/article/video metadata.
- Station tip.
- UGC media.

## Moderation statuses

| Status | Meaning |
|---|---|
| pending | Submitted, not public |
| approved | Publicly visible |
| rejected | Not public, has reason |
| hidden | Previously public but hidden by moderator/admin |

## Public visibility

Only `approved` content can be rendered on public station/place pages.

## Moderator actions

- Approve.
- Reject with reason.
- Hide after publish.
- Restore hidden content if policy allows.

## Audit requirements

Every moderation action must record:

- actor_id
- action
- target_type
- target_id
- previous_status
- new_status
- reason
- timestamp

## Safety rules

- Do not show raw user email publicly.
- Do not expose private media URLs.
- Do not publish content before moderation.
- Do not permanently delete moderation evidence without admin-level policy.
