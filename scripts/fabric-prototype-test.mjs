import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const requiredFiles = [
  'fabric-mod/blockcoach-client/settings.gradle',
  'fabric-mod/blockcoach-client/build.gradle',
  'fabric-mod/blockcoach-client/gradle.properties',
  'fabric-mod/blockcoach-client/src/main/resources/fabric.mod.json',
  'fabric-mod/blockcoach-client/src/client/java/dev/blockcoach/client/BlockCoachClient.java',
  'fabric-mod/blockcoach-client/src/client/java/dev/blockcoach/client/BlockCoachBridgeClient.java',
  'fabric-mod/blockcoach-client/README.md'
];

for (const file of requiredFiles) {
  assert.equal(existsSync(file), true, `Missing Fabric prototype file: ${file}`);
}

const buildGradle = readFileSync('fabric-mod/blockcoach-client/build.gradle', 'utf8');
assert.match(buildGradle, /id 'fabric-loom'/);
assert.doesNotMatch(buildGradle, /fabric-loom-remap/);

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
assert.doesNotMatch(client, /attack\(|swingHand\(|clickMouse\(|setYaw\(|setPitch\(/, 'Prototype must not automate combat or camera control.');

const bridgeClient = readFileSync('fabric-mod/blockcoach-client/src/client/java/dev/blockcoach/client/BlockCoachBridgeClient.java', 'utf8');
assert.match(bridgeClient, /HttpClient/);
assert.match(client, /http:\/\/127\.0\.0\.1:4317\/events/);

const gradleProps = readFileSync('fabric-mod/blockcoach-client/gradle.properties', 'utf8');
assert.match(gradleProps, /minecraft_version=1\.21\.11/);
assert.match(gradleProps, /mod_version=0\.54\.0/);
assert.match(bridgeClient, /Content-Type/);
assert.match(bridgeClient, /application\/json/);
assert.doesNotMatch(bridgeClient, /https?:\/\/(?!127\.0\.0\.1|localhost)/, 'Bridge client must not send to cloud endpoints.');

console.log('Fabric prototype test passed: client mod skeleton, safe event sources and localhost-only bridge sender are consistent.');
