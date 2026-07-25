# Deferred Work

## Deferred from: code review of 1-1-project-scaffold-and-mount-api.md (2026-07-25)

- Embed sizing / height chain for host roots without an explicit height — VoidCanvas (Story 1.3) owns sizing to the mount root; standalone `void.css` already sets `html/body/#app` for the demo caller.
- Package `exports` / library entry for `mountMindVoid` — not required by Story 1.1 AC; revisit when a portfolio shell consumes the package as a dependency rather than embedding via `index.html` / direct import.
