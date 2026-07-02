# GitHub Release Checklist - BlockCoach Client

GitHub Releases are the first alpha distribution step before Modrinth and CurseForge.

## Target release

```text
Tag: v0.62.0-alpha
Title: BlockCoach Client v0.62.0-alpha
Minecraft: Java Edition 1.21.11
Loader: Fabric
Artifact: blockcoach-client-0.62.0+1.21.11.jar
```

## Automatic release path

```zsh
git tag v0.62.0-alpha
git push origin v0.62.0-alpha
```

Then wait for:

```text
Actions → BlockCoach Alpha Release → green
```

## Before creating the release

- [ ] `npm run check` passes
- [ ] `npm test` passes
- [ ] `npm run test:release-automation` passes
- [ ] GitHub Actions workflow `BlockCoach Fabric Build` passes
- [ ] GitHub Actions workflow `BlockCoach Alpha Release` passes
- [ ] Release asset contains the `.jar`
- [ ] `.jar` starts in Minecraft Java `1.21.11` with Fabric
- [ ] Local Bridge receives `minecraft_connected`
- [ ] Local Bridge receives `server_joined` after joining a server
- [ ] Web app shows live status
- [ ] No cloud endpoint exists in mod source
- [ ] No combat/camera/input automation exists in mod source
- [ ] `PRIVACY.md` is included
- [ ] `FAIR_PLAY.md` is included
- [ ] `INSTALL_MOD.md` is included
- [ ] `docs/alpha-test-checklist.md` is included

## Release notes source

The automated release uses:

```text
docs/release-notes-alpha-template.md
```

## Release notes draft

```markdown
# BlockCoach Client 0.62.0 Alpha

**Level up your fights.**

This is an alpha release of the BlockCoach Fabric client for Minecraft Java `1.21.11`.

## What works

- Local bridge event transport
- Minecraft connection event
- Server join event
- Health change signal
- Hotbar change signal
- Item-use signal
- Death signal
- Session tick signal
- Web app remains usable in manual mode

## What this alpha does not do yet

- No full match detection
- No perfect win/loss parser
- No server-specific scoreboard parser
- No cloud sync
- No auto-aim, auto-click, camera control, enemy marking, or gameplay automation

## Requirements

- Minecraft Java Edition `1.21.11`
- Fabric Loader
- Fabric API if required by the build
- BlockCoach Local Bridge
- BlockCoach Web App

## Install

See `INSTALL_MOD.md`.

## Privacy and fair play

See `PRIVACY.md` and `FAIR_PLAY.md`.

BlockCoach is not officially affiliated with Minecraft, Mojang, or Microsoft.
```

## After release

- [ ] Download the uploaded `.jar` from GitHub Releases
- [ ] Install from the release asset, not local build output
- [ ] Re-test Minecraft launch
- [ ] Re-test Local Bridge
- [ ] Fill out `docs/alpha-test-checklist.md`
- [ ] Only then prepare Modrinth draft
