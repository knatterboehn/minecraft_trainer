import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const workflowPath = '.github/workflows/fabric-build.yml';
const docsPath = 'docs/github-actions-build.md';

assert.equal(existsSync(workflowPath), true, `Missing workflow: ${workflowPath}`);
assert.equal(existsSync(docsPath), true, `Missing workflow guide: ${docsPath}`);

const workflow = readFileSync(workflowPath, 'utf8');
const docs = readFileSync(docsPath, 'utf8');
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const metadata = JSON.parse(readFileSync('docs/mod-release-metadata.json', 'utf8'));

assert.equal(pkg.version, '0.63.0');
assert.equal(metadata.version, '0.63.0');
assert.equal(metadata.artifactName, 'blockcoach-client-0.63.0+1.21.11.jar');
assert.match(readFileSync('src/state/defaults.js', 'utf8'), /APP_VERSION = '0\.63'/);
assert.match(readFileSync('fabric-mod/blockcoach-client/gradle.properties', 'utf8'), /mod_version=0\.63\.0/);

assert.match(workflow, /name:\s*BlockCoach Fabric Build/);
assert.match(workflow, /push:/);
assert.match(workflow, /pull_request:/);
assert.match(workflow, /workflow_dispatch:/);
assert.match(workflow, /permissions:\s*\n\s*contents:\s*read/);
assert.match(workflow, /actions\/checkout@v7/);
assert.match(workflow, /actions\/setup-node@v6/);
assert.match(workflow, /node-version:\s*'22'/);
assert.match(workflow, /package-manager-cache:\s*false/);
assert.match(workflow, /name:\s*Web app checks/);
assert.match(workflow, /name:\s*Browser E2E checks/);
assert.match(workflow, /npm run ci:web/);
assert.match(workflow, /npm run ci:e2e/);
assert.match(workflow, /E2E_CHROME_PATH:\s*\/usr\/bin\/google-chrome-stable/);
assert.match(workflow, /Show browser environment/);
assert.match(workflow, /blockcoach-e2e-screens/);
assert.match(workflow, /name:\s*Fabric client JAR/);
assert.match(workflow, /needs:\s*\n\s*- web-tests\s*\n\s*- browser-e2e/);
assert.match(workflow, /actions\/setup-java@v4/);
assert.match(workflow, /distribution:\s*temurin/);
assert.match(workflow, /java-version:\s*'21'/);
assert.match(workflow, /gradle\/actions\/setup-gradle@v4/);
assert.match(workflow, /gradle-version:\s*'9\.5\.0'/);
assert.match(workflow, /npm run fabric:resolve/);
assert.match(workflow, /npm run fabric:preflight/);
assert.match(workflow, /npm run fabric:build/);
assert.match(workflow, /actions\/upload-artifact@v4/);
assert.match(workflow, /fabric-mod\/blockcoach-client\/build\/libs\/\*\.jar/);
assert.match(workflow, /blockcoach-client-0\.63\.0-minecraft-1\.21\.11/);
assert.match(workflow, /if-no-files-found:\s*error/);
assert.doesNotMatch(workflow, /GITHUB_TOKEN.*write|contents:\s*write|modrinth token|curseforge token/i);

assert.equal(pkg.scripts['ci:web'], 'npm run check && npm run test:core');
assert.equal(pkg.scripts['ci:e2e'], 'node scripts/e2e-user-flow-test.mjs');
assert.equal(pkg.scripts['ci:fabric'], 'npm run fabric:resolve && npm run fabric:preflight && npm run fabric:build');
assert.equal(pkg.scripts['test:workflow'], 'node scripts/github-actions-test.mjs');
assert.match(pkg.scripts.test, /test:core/);
assert.match(pkg.scripts.test, /test:e2e/);
assert.match(pkg.scripts['test:core'], /github-actions-test\.mjs/);
assert.doesNotMatch(pkg.scripts['ci:web'], /test:e2e/);

assert.match(docs, /v0\.63 GitHub Actions Build/);
assert.match(docs, /Browser E2E checks/);
assert.match(docs, /\.github\/workflows\/fabric-build\.yml/);
assert.match(docs, /blockcoach-client-0\.63\.0-minecraft-1\.21\.11/);
assert.match(docs, /blockcoach-client-0\.63\.0\+1\.21\.11\.jar/);
assert.match(docs, /Gradle `9\.5\.0`/);
assert.match(docs, /Fabric Loom 1\.17/i);
assert.match(docs, /Alpha Release Workflow/i);
assert.match(docs, /git tag v0\.63\.0-alpha/);

console.log('GitHub Actions test passed: CI workflow, separated browser E2E, Fabric artifact build, docs and version metadata are consistent.');
