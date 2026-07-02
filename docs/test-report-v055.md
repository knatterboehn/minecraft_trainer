# Test Report v0.55 - Fabric Version Resolver & Build Readiness

## Scope

v0.55 prepares the Fabric prototype for a real local build against Minecraft Java `1.21.11`.

Focus:

- use Yarn mappings because the prototype source uses Yarn names
- add Fabric version resolver
- add Fabric build runner
- keep BlockCoach gamification unchanged
- keep Live Integration honest: no fake live data

## Changes verified

- App version: `0.55`
- Package version: `0.55.0`
- Bridge health version: `0.55`
- Fabric target remains `minecraft_version=1.21.11`
- `build.gradle` uses Yarn mappings:

```gradle
mappings "net.fabricmc:yarn:${project.yarn_mappings}:v2"
```

- `gradle.properties` now contains intentionally unresolved values:

```properties
loader_version=UNRESOLVED
yarn_mappings=UNRESOLVED+1.21.11
fabric_api_version=UNRESOLVED+1.21.11
```

These are resolved locally via:

```zsh
npm run fabric:resolve -- --write
```

## Automated tests run in this environment

```zsh
node --check scripts/fabric-version-resolver.mjs
node --check scripts/fabric-build-runner.mjs
node --check scripts/fabric-build-preflight.mjs
npm run check
npm test
```

## Result

Passed:

```text
Syntax check passed: 37 JavaScript files.
Smoke test passed.
Regression tests passed.
Bridge integration tests passed.
Local bridge test passed.
Fabric prototype test passed.
E2E user-flow test passed.
```

## Not run here

The real Gradle build was not run in this container, because this environment cannot resolve external Maven/Gradle dependencies.

Run locally on Vince's machine:

```zsh
npm run fabric:resolve -- --write
npm run fabric:preflight
npm run fabric:build
```

## Safety check

The Fabric prototype remains safe:

- localhost endpoint only
- no cloud endpoint
- no auto-aim
- no auto-clicking
- no camera control
- no enemy marking
- no gameplay automation
