# Test Report v0.62 - Release E2E Stability Fix

## Scope

v0.62 fixes the alpha release workflow failure that happened during `npm run ci:e2e` with `TypeError: fetch failed` while waiting for Chrome DevTools Protocol.

## Root cause

The release workflow reached the browser E2E stage, but the E2E runner only waited about 8 seconds for the Chrome debugger endpoint and did not print Chrome stdout/stderr when startup failed or was slow.

This made the workflow look like a generic fetch failure instead of a diagnosable browser startup problem.

## Changes

- App version: `0.62`
- Package version: `0.62.0`
- Mod version: `0.62.0`
- Alpha tag target: `v0.62.0-alpha`
- Release artifact target: `blockcoach-client-0.62.0+1.21.11.jar`

## E2E runner hardening

Updated `scripts/e2e-user-flow-test.mjs`:

- uses a dynamically assigned free localhost port instead of a random fixed range
- explicitly binds Chrome remote debugging to `127.0.0.1`
- increases Chrome debugger wait time to 30 seconds
- detects early Chrome process exit
- captures Chrome stdout/stderr
- prints browser path, debug port, exit code, signal and last fetch error when startup fails
- keeps the existing real browser click flow unchanged

## Release workflow hardening

Updated `.github/workflows/fabric-release.yml`:

- keeps browser E2E in the alpha release workflow
- uploads release E2E screenshots as `blockcoach-release-e2e-screens` with `if: always()`
- keeps release permissions limited to `contents: write`
- keeps Modrinth/CurseForge upload out of the release workflow

## Commands executed locally

```zsh
npm run check
npm run test:core
npm run ci:e2e
npm test
```

## Results

```text
Syntax check passed: 40 JavaScript files.
Smoke test passed.
Regression tests passed.
Bridge integration tests passed.
Local bridge test passed.
Fabric prototype test passed.
Release preparation test passed.
GitHub Actions test passed.
Release automation test passed.
E2E user-flow test passed.
```

## Not executed locally

The real Fabric Gradle build was not executed in this container because external Maven/Gradle dependencies are not reliably available here. The previous GitHub Actions Fabric build was already green after the v0.60 compile fix.

## Expected next GitHub result

After pushing v0.62 and tagging `v0.62.0-alpha`, the alpha release workflow should either pass or produce a detailed Chrome diagnostic instead of the previous generic `fetch failed` message.
