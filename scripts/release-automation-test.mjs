import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const releaseWorkflowPath = '.github/workflows/fabric-release.yml';
const buildWorkflowPath = '.github/workflows/fabric-build.yml';
const notesPath = 'docs/release-notes-alpha-template.md';
const alphaChecklistPath = 'docs/alpha-test-checklist.md';
const actionsGuidePath = 'docs/github-actions-build.md';

for (const file of [releaseWorkflowPath, buildWorkflowPath, notesPath, alphaChecklistPath, actionsGuidePath]) {
  assert.equal(existsSync(file), true, `Missing release automation file: ${file}`);
}

const releaseWorkflow = readFileSync(releaseWorkflowPath, 'utf8');
const buildWorkflow = readFileSync(buildWorkflowPath, 'utf8');
const notes = readFileSync(notesPath, 'utf8');
const checklist = readFileSync(alphaChecklistPath, 'utf8');
const actionsGuide = readFileSync(actionsGuidePath, 'utf8');
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const metadata = JSON.parse(readFileSync('docs/mod-release-metadata.json', 'utf8'));
const buildGradle = readFileSync('fabric-mod/blockcoach-client/build.gradle', 'utf8');

assert.equal(pkg.version, '0.63.0');
assert.equal(metadata.version, '0.63.0');
assert.equal(metadata.artifactName, 'blockcoach-client-0.63.0+1.21.11.jar');
assert.equal(metadata.platforms.githubReleases.status, 'automated-alpha-ready');
assert.match(readFileSync('src/state/defaults.js', 'utf8'), /APP_VERSION = '0\.63'/);
assert.match(readFileSync('fabric-mod/blockcoach-client/gradle.properties', 'utf8'), /mod_version=0\.63\.0/);
assert.match(buildGradle, /version = "\$\{project\.mod_version\}\+\$\{project\.minecraft_version\}"/);

assert.match(releaseWorkflow, /name:\s*BlockCoach Alpha Release/);
assert.match(releaseWorkflow, /tags:\s*\n\s*- 'v\*\.\*\.\*-alpha'/);
assert.match(releaseWorkflow, /workflow_dispatch:/);
assert.match(releaseWorkflow, /tag_name:/);
assert.match(releaseWorkflow, /permissions:\s*\n\s*contents:\s*write/);
assert.match(releaseWorkflow, /actions\/checkout@v7/);
assert.match(releaseWorkflow, /actions\/setup-node@v6/);
assert.match(releaseWorkflow, /node-version:\s*'22'/);
assert.match(releaseWorkflow, /actions\/setup-java@v4/);
assert.match(releaseWorkflow, /java-version:\s*'21'/);
assert.match(releaseWorkflow, /gradle\/actions\/setup-gradle@v4/);
assert.match(releaseWorkflow, /gradle-version:\s*'9\.5\.0'/);
assert.match(releaseWorkflow, /npm run ci:web/);
assert.match(releaseWorkflow, /npm run ci:e2e/);
assert.match(releaseWorkflow, /blockcoach-release-e2e-screens/);
assert.match(releaseWorkflow, /npm run fabric:resolve/);
assert.match(releaseWorkflow, /npm run fabric:preflight/);
assert.match(releaseWorkflow, /npm run fabric:build/);
assert.match(releaseWorkflow, /Locate release JAR/);
assert.match(releaseWorkflow, /! -name '\*-sources\.jar'/);
assert.match(releaseWorkflow, /actions\/upload-artifact@v4/);
assert.match(releaseWorkflow, /blockcoach-client-0\.63\.0-minecraft-1\.21\.11/);
assert.match(releaseWorkflow, /gh release create/);
assert.match(releaseWorkflow, /--notes-file docs\/release-notes-alpha-template\.md/);
assert.match(releaseWorkflow, /--prerelease/);
assert.match(releaseWorkflow, /gh release upload/);
assert.match(releaseWorkflow, /--clobber/);
assert.doesNotMatch(releaseWorkflow, /MODRINTH_TOKEN|CURSEFORGE_TOKEN|secrets\./i);

assert.match(buildWorkflow, /permissions:\s*\n\s*contents:\s*read/);
assert.doesNotMatch(buildWorkflow, /contents:\s*write/);
assert.match(buildWorkflow, /blockcoach-client-0\.63\.0-minecraft-1\.21\.11/);

assert.match(notes, /BlockCoach Client 0\.63\.0 Alpha/);
assert.match(notes, /Minecraft Java `1\.21\.11`/);
assert.match(notes, /No auto-aim/i);
assert.match(notes, /No cloud sync/i);
assert.match(notes, /PRIVACY\.md/);
assert.match(notes, /FAIR_PLAY\.md/);

assert.match(checklist, /Alpha Test Checklist/);
assert.match(checklist, /minecraft_connected/);
assert.match(checklist, /server_joined/);
assert.match(checklist, /hotbar_changed/);
assert.match(checklist, /Stop criteria/);
assert.match(checklist, /mod sends data to anything other than localhost or `127\.0\.0\.1`/);
assert.match(checklist, /does not aim, click, move, mark enemies, or automate gameplay/);

assert.match(actionsGuide, /Alpha Release Workflow/);
assert.match(actionsGuide, /git tag v0\.63\.0-alpha/);
assert.match(actionsGuide, /GitHub Prerelease/);
assert.match(actionsGuide, /docs\/alpha-test-checklist\.md/);

console.log('Release automation test passed: alpha tag workflow, release notes, artifact naming and tester checklist are consistent.');
