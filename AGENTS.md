# Project Rules

1. Any development or modification must synchronously update `docs/工具平台设计.md` so that the implemented behavior, module boundary, capability, and integration contract remain documented.
2. Every modification must comply with `docs/用户界面设计规范.md`. Reuse the shared tokens and components; do not introduce one-off visual values or interaction patterns without first updating that guideline.
3. Every completed development item must update its status, progress percentage, and acceptance evidence in `docs/开发清单.md`. Do not mark an item complete until it has been verified.
4. Before modifying code, inspect the repository structure, relevant implementation, tests, documentation, and current working-tree changes. Do not make implementation decisions from filenames or the request alone.
5. Keep changes minimal and scoped to the requested behavior. Prefer existing abstractions, components, tokens, contracts, and toolchain commands; do not include unrelated refactors, formatting churn, or renames.
6. Every behavior change must have proportional verification evidence. Validate behavior, accessibility semantics, visual states, and applicable empty, loading, error, and permission-denied states; do not treat edited code as completed functionality.
7. Changes that affect how users start, run, build, package, or distribute the application must be verified through the actual user-facing entry point as well as the affected module.
8. Before reporting completion, reconcile implementation, tests, documentation, configuration, entry scripts, and user-visible names so they describe the same current behavior. State unverified areas and residual risks explicitly.

## Working Agreement

- Keep Learning, Entertainment, and Tools independent. A tool must use the platform contracts instead of importing another tool directly.
- Follow the workspace directory governance in `docs/工具平台设计.md`. Do not add a top-level directory, place product code at the repository root, or bypass package ownership boundaries without updating that document.
- A tool owns its data, state, routes, and business logic. Cross-tool reuse must be extracted to `packages/` behind a typed contract.
- Prefer strongly typed contracts between the desktop shell, tools, and shared services.
- Public UI must remain synchronized across its shared implementation, the settings design-system viewer, and the UI design documentation. Adding or changing a shared component, token, variant, or interaction contract requires updating all applicable surfaces and their tests together; the viewer must use the real public component and catalog rather than a disconnected mock.
- Treat file access, network access, camera access, system commands, and cloud synchronization as explicit capabilities with clear ownership and user consent.
- Add tests in proportion to the change, especially for shared contracts, token resolution, themes, and permission checks.
- For UI changes, verify light and dark themes, keyboard navigation, focus states, and applicable loading, empty, error, and permission-denied states.
- Before a change is considered ready, run relevant type checks, formatting, static analysis, and affected tests. A tool failure must not make the desktop shell or other tools unusable.
- Except for conventional toolchain files such as `AGENTS.md`, `README.md`, and `package.json`, documentation and project-visible names should use Chinese. Code identifiers remain in English.
- Do not add a dependency or platform-specific implementation without documenting its cross-platform impact in `docs/工具平台设计.md`.
