# Project Rules

1. Any development or modification must synchronously update `docs/工具平台设计.md` so that the implemented behavior, module boundary, capability, and integration contract remain documented.
2. Every modification must comply with `docs/用户界面设计规范.md`. Reuse the shared tokens and components; do not introduce one-off visual values or interaction patterns without first updating that guideline.

## Working Agreement

- Keep Learning, Entertainment, and Tools independent. A tool must use the platform contracts instead of importing another tool directly.
- Follow the workspace directory governance in `docs/工具平台设计.md`. Do not add a top-level directory, place product code at the repository root, or bypass package ownership boundaries without updating that document.
- Prefer strongly typed contracts between the desktop shell, tools, and shared services.
- Treat file access, network access, camera access, system commands, and cloud synchronization as explicit capabilities with clear ownership and user consent.
- Add tests in proportion to the change, especially for shared contracts, token resolution, themes, and permission checks.
- Do not add a dependency or platform-specific implementation without documenting its cross-platform impact in `docs/工具平台设计.md`.
