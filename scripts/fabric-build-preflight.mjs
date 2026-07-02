import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const propsPath = 'fabric-mod/blockcoach-client/gradle.properties';
const modJsonPath = 'fabric-mod/blockcoach-client/src/main/resources/fabric.mod.json';

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

if (!existsSync(propsPath)) throw new Error(`Missing ${propsPath}`);
if (!existsSync(modJsonPath)) throw new Error(`Missing ${modJsonPath}`);

const props = readProperties(propsPath);
const minecraftVersion = props.get('minecraft_version');
const fabricApiVersion = props.get('fabric_api_version');
const loaderVersion = props.get('loader_version');
const modJson = readFileSync(modJsonPath, 'utf8');

const problems = [];
if (minecraftVersion !== '1.21.11') problems.push(`minecraft_version must be 1.21.11, got ${minecraftVersion}`);
if (!loaderVersion) problems.push('loader_version is missing');
if (!fabricApiVersion) problems.push('fabric_api_version is missing');
if (fabricApiVersion && !fabricApiVersion.includes('1.21.11')) {
  problems.push(`fabric_api_version is still not pinned to a 1.21.11 artifact: ${fabricApiVersion}`);
}
if (!modJson.includes('"minecraft": "1.21.11"')) problems.push('fabric.mod.json must depend on Minecraft 1.21.11 exactly');

const javaVersion = commandVersion('java', ['-version']);
if (!javaVersion) problems.push('Java was not found. Install Java 21 before building.');
else if (!/version "21\.|openjdk version "21\.|version "2[2-9]\.|openjdk version "2[2-9]\./i.test(javaVersion)) {
  problems.push(`Java 21+ is required. Detected: ${javaVersion.split('\n')[0]}`);
}

const gradleVersion = commandVersion('gradle', ['--version']);
if (!gradleVersion) problems.push('Gradle was not found. Install Gradle or open the mod folder in IntelliJ with Gradle support.');

if (problems.length) {
  console.error('Fabric build preflight failed:');
  for (const problem of problems) console.error(`- ${problem}`);
  console.error('\nNext step: update fabric-mod/blockcoach-client/gradle.properties with the official Fabric API version for Minecraft 1.21.11, then rerun npm run fabric:preflight.');
  process.exit(1);
}

console.log('Fabric build preflight passed: Minecraft 1.21.11 target, Java/Gradle, Fabric properties and mod metadata are ready.');
