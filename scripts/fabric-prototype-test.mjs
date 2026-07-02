import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const requiredFiles = [
  'fabric-mod/blockcoach-client/settings.gradle',
  'fabric-mod/blockcoach-client/build.gradle',
  'fabric-mod/blockcoach-client/gradle.properties',
  'fabric-mod/blockcoach-client/src/main/resources/fabric.mod.json',
  'fabric-mod/blockcoach-client/src/client/java/dev/blockcoach/client/BlockCoachClient.java',
  'fabric-mod/blockcoach-client/src/client/java/dev/blockcoach/client/BlockCoachBridgeClient.java',
  'fabric-mod/blockcoach-client/README.md',
  'scripts/fabric-version-resolver.mjs',
  'scripts/fabric-build-runner.mjs'
];

for (const file of requiredFiles) {
  assert.equal(existsSync(file), true, `Missing Fabric prototype file: ${file}`);
}

const buildGradle = readFileSync('fabric-mod/blockcoach-client/build.gradle', 'utf8');
assert.match(buildGradle, /id 'fabric-loom'/);
assert.doesNotMatch(buildGradle, /fabric-loom-remap/);
assert.match(buildGradle, /net\.fabricmc:yarn:\$\{project\.yarn_mappings\}:v2/);
assert.doesNotMatch(buildGradle, /officialMojangMappings/);

const modJson = readFileSync('fabric-mod/blockcoach-client/src/main/resources/fabric.mod.json', 'utf8');
assert.match(modJson, /"id"\s*:\s*"blockcoach_client"/);
assert.match(modJson, /"environment"\s*:\s*"client"/);
assert.match(modJson, /dev\.blockcoach\.client\.BlockCoachClient/);
assert.match(modJson, /\"minecraft\"\s*:\s*\"1\.21\.11\"/);

const client = readFileSync('fabric-mod/blockcoach-client/src/client/java/dev/blockcoach/client/BlockCoachClient.java', 'utf8');
assert.match(client, /implements ClientModInitializer/);
assert.match(client, /ClientTickEvents\.END_CLIENT_TICK\.register/);
assert.match(client, /ClientPlayConnectionEvents\.JOIN\.register/);
assert.match(client, /minecraft_connected/);
assert.match(client, /server_joined/);
assert.match(client, /health_changed/);
assert.match(client, /hotbar_changed/);
assert.match(client, /player_death/);
assert.match(client, /lastUsePressed/);
assert.match(client, /MINECRAFT_VERSION = \"1\.21\.11\"/);
assert.match(client, /resolveSelectedHotbarSlot/);
assert.doesNotMatch(client, /SharedConstants\.getGameVersion\(\)\.getName\(\)/);
assert.doesNotMatch(client, /inventory\.selectedSlot/);
assert.doesNotMatch(client, /attack\(|swingHand\(|clickMouse\(|setYaw\(|setPitch\(/, 'Prototype must not automate combat or camera control.');

const bridgeClient = readFileSync('fabric-mod/blockcoach-client/src/client/java/dev/blockcoach/client/BlockCoachBridgeClient.java', 'utf8');
assert.match(bridgeClient, /HttpClient/);
assert.match(client, /http:\/\/127\.0\.0\.1:4317\/events/);


const preflight = readFileSync('scripts/fabric-build-preflight.mjs', 'utf8');
assert.match(preflight, /requiredGradleVersion = '9\.5\.0'/);
assert.match(preflight, /Gradle 9\.5\.0\+/);
assert.match(preflight, /Fabric Loom 1\.17\.x/);

const gradleProps = readFileSync('fabric-mod/blockcoach-client/gradle.properties', 'utf8');
assert.match(gradleProps, /minecraft_version=1\.21\.11/);
assert.match(gradleProps, /yarn_mappings=/);
assert.match(gradleProps, /fabric_api_version=/);
assert.match(gradleProps, /mod_version=0\.62\.0/);
assert.match(bridgeClient, /Content-Type/);
assert.match(bridgeClient, /application\/json/);
assert.doesNotMatch(bridgeClient, /https?:\/\/(?!127\.0\.0\.1|localhost)/, 'Bridge client must not send to cloud endpoints.');

console.log('Fabric prototype test passed: client mod skeleton, Yarn mapping setup, safe event sources and localhost-only bridge sender are consistent.');
