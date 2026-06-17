# UI Sitemap

## Public/guest

```text
/
  Landing / search entry
/routes
  Route search + map + results
/stations
  Station list/search
/stations/:id
  Station detail + content + reviews
/posts
  Guides/articles/videos
/posts/:slug
  Public content detail
/quiz
  Quiz
/quiz/result
  Quiz result
/b/:shareSlug
  Public bill page
/login
/register
```

## Authenticated user

```text
/app
  User dashboard
/app/tickets
  Ticket list/status
/app/tickets/upload
  Upload ticket
/app/points
  Points ledger
/app/vouchers
  Voucher list/redeem
/app/bills
  My bills
/app/reviews
  My submissions
/app/profile
  Profile/settings/privacy
```

## Moderator/Admin

```text
/admin
  Admin overview
/admin/moderation/tickets
  Ticket moderation queue
/admin/moderation/reviews
  Review moderation queue
/admin/vouchers
  Voucher management
/admin/posts
  Guide/post management
/admin/stations
  Station/geofence seed management
/admin/audit-logs
  Audit logs
```
