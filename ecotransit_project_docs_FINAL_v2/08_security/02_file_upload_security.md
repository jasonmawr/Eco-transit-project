# File Upload Security

## Allowed files

- jpg/jpeg
- png
- webp

## Required checks

- Content length limit.
- Extension allowlist.
- MIME allowlist.
- Magic byte sniffing where possible.
- Image decode attempt.
- Randomized storage filename.
- Strip EXIF if feasible.
- Compute hash and pHash.
- Store outside public web root/private bucket.
- Access through signed URL/protected proxy only.

## Forbidden

- No SVG ticket upload unless sanitized and explicitly allowed.
- No public direct ticket image URL.
- No original filename as storage path.
- No OCR/job execution based on unvalidated file.
