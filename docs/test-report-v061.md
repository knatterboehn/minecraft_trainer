# Test Report v0.62 - Alpha Release Automation

## Scope

v0.62 prepares automated GitHub alpha releases for the BlockCoach Fabric client.

## Added

- `.github/workflows/fabric-release.yml`
- `docs/release-notes-alpha-template.md`
- `docs/alpha-test-checklist.md`
- `scripts/release-automation-test.mjs`
- `npm run test:release-automation`

## Release workflow

The new workflow runs on tags like:

```text
v0.62.0-alpha
```

It performs:

```text
Web app checks
→ Browser E2E checks
→ Fabric artifact resolution
→ Fabric preflight
→ Fabric Gradle build
→ Release JAR detection
→ GitHub prerelease creation
→ .jar upload as release asset
```

## Safety guardrails

- Normal build workflow stays read-only with `contents: read`.
- Release workflow is the only workflow with `contents: write`.
- No Modrinth or CurseForge tokens are configured.
- Release notes keep alpha limitations clear.
- Alpha test checklist includes stop criteria for privacy, fair play, gameplay automation and localStorage safety.

## Version metadata

- App version: `0.62`
- Package version: `0.62.0`
- Mod version: `0.62.0`
- Release artifact target: `blockcoach-client-0.62.0+1.21.11.jar`
- GitHub Actions artifact name: `blockcoach-client-0.62.0-minecraft-1.21.11`
- Alpha tag target: `v0.62.0-alpha`

## Commands run

```bash
npm run check
npm run test:core
npm run test:e2e
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

## Not run here

The real Fabric Gradle build was not executed in this chat environment because external Maven/Gradle dependencies are not reliably available here. The GitHub Actions build already proved the Fabric JAR path can pass in the repository environment.

## Next external check

Push v0.62, then create and push the alpha tag:

```zsh
git tag v0.62.0-alpha
git push origin v0.62.0-alpha
```

Expected GitHub result:

```text
Actions → BlockCoach Alpha Release → green
GitHub Releases → BlockCoach Client v0.62.0-alpha prerelease with .jar attached
```
