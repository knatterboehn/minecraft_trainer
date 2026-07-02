# Test Report v0.60 - Fabric 1.21.11 Compile Fix

## Context

The GitHub Actions Fabric client JAR job reached the real Java compile step after the v0.59 Gradle/Loom fix. The new failure was a Minecraft `1.21.11` API compatibility issue in `BlockCoachClient.java`.

## GitHub Actions failure

The relevant compile errors were:

```text
GameVersion.getName() cannot be found
PlayerInventory.selectedSlot has private access
```

This means the build setup was working far enough to compile the mod sources, but the Java client code still assumed older or different Yarn API details.

## Fixes in v0.60

### Minecraft version event field

Removed compile-time dependency on:

```java
SharedConstants.getGameVersion().getName()
```

The prototype is pinned to Minecraft Java `1.21.11`, so the telemetry event now uses:

```java
private static final String MINECRAFT_VERSION = "1.21.11";
```

### Hotbar selected slot

Removed direct access to:

```java
inventory.selectedSlot
```

The prototype now uses a safe selected-slot resolver:

```java
resolveSelectedHotbarSlot(inventory)
```

If the runtime exposes `getSelectedSlot`, the value is used. If not, the event remains valid with `slot: -1` instead of breaking compilation.

## Version updates

- App version: `0.60`
- Package version: `0.60.0`
- Mod version: `0.60.0`
- Artifact target: `blockcoach-client-0.60.0+1.21.11.jar`
- GitHub Actions artifact name: `blockcoach-client-0.60.0-minecraft-1.21.11`

## Tests run locally

```zsh
npm run check
npm test
npm run ci:web
npm run ci:e2e
```

Results:

```text
Syntax check passed
Smoke test passed
Regression tests passed
Bridge integration tests passed
Local bridge test passed
Fabric prototype test passed
Release preparation test passed
GitHub Actions test passed
E2E user-flow test passed
```

## Not run locally

The real Fabric/Gradle build was not run in this container because it cannot reliably download external Maven/Gradle dependencies. The next validation should happen in GitHub Actions.

## Expected next GitHub Actions result

The previous errors should be gone:

```text
SharedConstants.getGameVersion().getName()
inventory.selectedSlot has private access
```

If the workflow fails again, the next log will likely reveal the next Minecraft `1.21.11` API compatibility issue or a dependency issue.
