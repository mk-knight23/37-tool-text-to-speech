# Security Policy — MK VoiceKit

Please refer to the detailed Security documentation at [docs/SECURITY.md](docs/SECURITY.md) for our complete threat model and security controls.

## Reporting a Vulnerability

If you identify a security vulnerability in MK VoiceKit, please report it privately to **kazi@reprime.com** (as published in [`public/.well-known/security.txt`](public/.well-known/security.txt)).

Please include a clear proof of concept or steps to reproduce the issue. We aim to acknowledge all reports within a few days. Do not open public issues for undisclosed security bugs.

---

## Threat Model Summary

MK VoiceKit is local-first: user text, transcripts, and document uploads are stored in your browser's IndexedDB and never sent to a server (unless you explicitly invoke optional AI processing, which processes text in-flight without retention). This removes entire classes of risk (no server-side user database, no credentials store).

Optional AI operations route securely via Vercel AI Gateway, protected by coarse body size constraints, character limits, rate limiting, and inputs validation.
