# Backup and Monitoring

## Backup checklist

- [ ] Nightly DB snapshot.
- [ ] Pre-release DB backup.
- [ ] Object storage retention/copy strategy.
- [ ] Restore test on staging.
- [ ] Migration files versioned.
- [ ] Secrets recoverable via secret manager.

## Monitoring checklist

- [ ] API latency p95.
- [ ] Route provider failures.
- [ ] Upload failures.
- [ ] OCR/verify job failure rate.
- [ ] Manual review queue size.
- [ ] Voucher redeem failure rate.
- [ ] Login failures/rate-limit hits.
- [ ] Frontend error rate.

## Alert suggestions

- API error rate above threshold.
- Verify queue lag above threshold.
- Storage write failures.
- DB connection failures.
- Provider outage.
- Suspicious upload spike.
