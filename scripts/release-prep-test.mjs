import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const requiredFiles = [
  'README.md',
  'INSTALL_MOD.md',
  'PRIVACY.md',
  'FAIR_PLAY.md',
  'LICENSE',
  'docs/mod-release-metadata.json',
  'docs/modrinth.md',
  'docs/curseforge.md',
  'docs/github-release-checklist.md',
  'fabric-mod/blockcoach-client/LICENSE'
];

for (const file of requiredFiles) {
  assert.equal(existsSync(file), true, `Missing public release preparation file: ${file}`);
}

const metadata = JSON.parse(readFileSync('docs/mod-release-metadata.json', 'utf8'));
assert.equal(metadata.projectName, 'BlockCoach');
assert.equal(metadata.slug, 'blockcoach');
assert.equal(metadata.tagline, 'Level up your fights.');
assert.equal(metadata.version, '0.56.0');
assert.equal(metadata.minecraftVersion, '1.21.11');
assert.equal(metadata.loader, 'fabric');
assert.equal(metadata.environment, 'client');
assert.equal(metadata.clientSide, 'required');
assert.equal(metadata.serverSide, 'unsupported');
assert.equal(metadata.license, 'MIT');
assert.equal(metadata.modId, 'blockcoach_client');
assert.equal(metadata.releaseChannel, 'alpha');
assert.match(metadata.artifactName, /blockcoach-client-0\.56\.0\+1\.21\.11\.jar/);
assert.equal(metadata.platforms.githubReleases.status, 'prepared');
assert.equal(metadata.platforms.modrinth.status, 'prepared');
assert.equal(metadata.platforms.curseforge.status, 'prepared');
assert.ok(metadata.safetyClaims.includes('localhost-only event transport'));
assert.ok(metadata.safetyClaims.includes('no cloud upload by default'));
assert.ok(metadata.safetyClaims.includes('no auto-aim'));
assert.ok(metadata.safetyClaims.includes('no auto-click'));
assert.ok(metadata.requiredReleaseFiles.includes('PRIVACY.md'));
assert.ok(metadata.requiredReleaseFiles.includes('FAIR_PLAY.md'));

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
assert.equal(packageJson.version, '0.56.0');
assert.match(readFileSync('src/state/defaults.js', 'utf8'), /APP_VERSION = '0\.56'/);
assert.match(readFileSync('fabric-mod/blockcoach-client/gradle.properties', 'utf8'), /mod_version=0\.56\.0/);

const privacy = readFileSync('PRIVACY.md', 'utf8');
assert.match(privacy, /localhost-only/i);
assert.match(privacy, /127\.0\.0\.1:4317\/events/);
assert.match(privacy, /Keine Cloud|No default cloud endpoint/i);
assert.match(privacy, /minecraftTrainerApp/);

const fairPlay = readFileSync('FAIR_PLAY.md', 'utf8');
assert.match(fairPlay, /not a cheat client/i);
assert.match(fairPlay, /aim for the player/);
assert.match(fairPlay, /click for the player/);
assert.match(fairPlay, /automate gameplay|Gameplay-Automation/i);
assert.match(fairPlay, /server/i);

const install = readFileSync('INSTALL_MOD.md', 'utf8');
assert.match(install, /Minecraft Java Edition 1\.21\.11/);
assert.match(install, /Fabric Loader/);
assert.match(install, /blockcoach-client-0\.56\.0\+1\.21\.11\.jar/);
assert.match(install, /npm run bridge/);

const modrinth = readFileSync('docs/modrinth.md', 'utf8');
assert.match(modrinth, /Slug: blockcoach/);
assert.match(modrinth, /Client required/);
assert.match(modrinth, /Server unsupported/);
assert.match(modrinth, /Version type: Alpha/);
assert.match(modrinth, /Fabric API/);
assert.doesNotMatch(modrinth, /Win automatically|unfair PvP edge/i);

const curseforge = readFileSync('docs/curseforge.md', 'utf8');
assert.match(curseforge, /Project name: BlockCoach/);
assert.match(curseforge, /Release type: Alpha/);
assert.match(curseforge, /Fabric API/);
assert.doesNotMatch(curseforge, /Win automatically|unfair PvP edge/i);

const releaseChecklist = readFileSync('docs/github-release-checklist.md', 'utf8');
assert.match(releaseChecklist, /blockcoach-client-v0\.56\.0/);
assert.match(releaseChecklist, /npm run fabric:build/);
assert.match(releaseChecklist, /PRIVACY\.md/);
assert.match(releaseChecklist, /FAIR_PLAY\.md/);

const readme = readFileSync('README.md', 'utf8');
assert.match(readme, /Version 0\.56/);
assert.match(readme, /Public Mod Release Preparation/);
assert.match(readme, /docs\/mod-release-metadata\.json/);
assert.match(readme, /test:release-prep/);

console.log('Release preparation test passed: public mod metadata, privacy, fair-play, install and platform release drafts are complete and consistent.');
