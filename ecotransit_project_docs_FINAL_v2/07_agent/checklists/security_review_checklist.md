# Security Review Checklist

- [ ] No token in localStorage.
- [ ] Cookies/session settings reviewed.
- [ ] Role checks implemented.
- [ ] Ownership checks implemented.
- [ ] Rate limits for risky endpoints.
- [ ] Upload MIME/extension/size validation.
- [ ] Private storage for ticket originals.
- [ ] Logs redact sensitive values.
- [ ] Error responses do not leak internals.
- [ ] Audit logs for admin/moderator actions.
