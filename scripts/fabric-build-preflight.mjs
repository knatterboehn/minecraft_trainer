import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const propsPath = 'fabric-mod/blockcoach-client/gradle.properties';
const modJsonPath = 'fabric-mod/blockcoach-client/src/main/resources/fabric.mod.json';
const buildGradlePath = 'fabric-mod/blockcoach-client/build.gradle';
const requiredGradleVersion = '9.5.0';

function readProperties(path) {
  const text = readFileSync(path, 'utf8');
  const props = new Map();
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const index = trimmed.indexOf('=');
    if (index === -1) continue;
    props.set(trimmed.slice(0, index), trimmed.slice(index + 1));
  }
  return props;
}

function commandVersion(command, args) {
  const result = spawnSync(command, args, { encoding: 'utf8' });
  if (result.error) return null;
  return `${result.stdout || ''}${result.stderr || ''}`.trim();
}

function parseGradleVersion(text) {
  const match = String(text).match(/Gradle\s+([0-9]+(?:\.[0-9]+){1,2})/i);
  return match?.[1] || null;
}

function compareSemverLike(a, b) {
  const aa = String(a).split('.').map(part => Number.parseInt(part, 10) || 0);
  const bb = String(b).split('.').map(part => Number.parseInt(part, 10) || 0);
  const length = Math.max(aa.length, bb.length);
  for (let i = 0; i < length; i += 1) {
    const diff = (aa[i] || 0) - (bb[i] || 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

if (!existsSync(propsPath)) throw new Error(`Missing ${propsPath}`);
if (!existsSync(modJsonPath)) throw new Error(`Missing ${modJsonPath}`);
if (!existsSync(buildGradlePath)) throw new Error(`Missing ${buildGradlePath}`);

const props = readProperties(propsPath);
const minecraftVersion = props.get('minecraft_version');
const fabricApiVersion = props.get('fabric_api_version');
const loaderVersion = props.get('loader_version');
const yarnMappings = props.get('yarn_mappings');
const loomVersion = props.get('loom_version');
const modJson = readFileSync(modJsonPath, 'utf8');
const buildGradle = readFileSync(buildGradlePath, 'utf8');

const problems = [];
if (minecraftVersion !== '1.21.11') problems.push(`minecraft_version must be 1.21.11, got ${minecraftVersion}`);
if (!loaderVersion || /UNRESOLVED/i.test(loaderVersion)) problems.push('loader_version is unresolved. Run npm run fabric:resolve -- --write.');
if (!yarnMappings || /UNRESOLVED/i.test(yarnMappings) || !yarnMappings.includes('1.21.11')) {
  problems.push(`yarn_mappings must be pinned for 1.21.11, got ${yarnMappings || 'missing'}. Run npm run fabric:resolve -- --write.`);
}
if (!fabricApiVersion || /UNRESOLVED/i.test(fabricApiVersion) || !fabricApiVersion.includes('1.21.11')) {
  problems.push(`fabric_api_version must be pinned for 1.21.11, got ${fabricApiVersion || 'missing'}. Run npm run fabric:resolve -- --write.`);
}
if (!loomVersion || !/^1\.17/.test(loomVersion)) {
  problems.push(`loom_version should stay on 1.17-SNAPSHOT for the Minecraft 1.21.11 prototype, got ${loomVersion || 'missing'}.`);
}
if (!modJson.includes('"minecraft": "1.21.11"')) problems.push('fabric.mod.json must depend on Minecraft 1.21.11 exactly');
if (!buildGradle.includes('net.fabricmc:yarn:${project.yarn_mappings}:v2')) problems.push('build.gradle must use Yarn mappings because the prototype source uses Yarn names.');
if (buildGradle.includes('officialMojangMappings')) problems.push('build.gradle still uses official Mojang mappings; use Yarn mappings for this prototype.');

const javaVersion = commandVersion('java', ['-version']);
if (!javaVersion) problems.push('Java was not found. Install Java 21 before building.');
else if (!/version "21\.|openjdk version "21\.|version "2[2-9]\.|openjdk version "2[2-9]\./i.test(javaVersion)) {
  problems.push(`Java 21+ is required. Detected: ${javaVersion.split('\n')[0]}`);
}

const gradleVersionText = commandVersion('gradle', ['--version']);
const gradlewExists = existsSync('fabric-mod/blockcoach-client/gradlew') || existsSync('fabric-mod/blockcoach-client/gradlew.bat');
if (!gradleVersionText && !gradlewExists) {
  problems.push('Gradle was not found and no Gradle wrapper exists. Install Gradle 9.5.0+ or use GitHub Actions.');
} else if (gradleVersionText) {
  const gradleVersion = parseGradleVersion(gradleVersionText);
  if (!gradleVersion) problems.push('Could not detect Gradle version from gradle --version output.');
  else if (compareSemverLike(gradleVersion, requiredGradleVersion) < 0) {
    problems.push(`Gradle ${requiredGradleVersion}+ is required for Fabric Loom 1.17.x. Detected Gradle ${gradleVersion}.`);
  }
}

if (problems.length) {
  console.error('Fabric build preflight failed:');
  for (const problem of problems) console.error(`- ${problem}`);
  console.error('\nNext step: run npm run fabric:resolve -- --write, then use Gradle 9.5.0+ and rerun npm run fabric:preflight.');
  process.exit(1);
}

console.log('Fabric build preflight passed: Minecraft 1.21.11 target, Yarn mappings, Fabric API, Java 21+, Gradle 9.5.0+ and mod metadata are ready.');
