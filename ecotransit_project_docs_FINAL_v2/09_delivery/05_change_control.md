# Change Control

No documentation pack can prevent future customer changes. This file prevents uncontrolled scope creep.

## Change request template

```text
Change ID:
Requester:
Date:
Description:
Reason:
Affected screens:
Affected backend/modules:
Data/migration impact:
Security/privacy impact:
Priority:
Accepted / Rejected / Deferred:
Target batch:
Acceptance criteria:
```

## Rules

1. Do not implement new scope without a logged change.
2. Critical bug fixes can be implemented immediately but must be documented after.
3. UI preference changes require screenshot comparison.
4. Business rule changes require test updates.
5. Provider/API changes require adapter review.
