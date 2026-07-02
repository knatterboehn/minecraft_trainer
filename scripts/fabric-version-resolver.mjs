import { readFileSync, writeFileSync } from 'node:fs';
import https from 'node:https';

const propsPath = 'fabric-mod/blockcoach-client/gradle.properties';
const args = new Set(process.argv.slice(2));
const shouldWrite = args.has('--write');

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
  return { text, props };
}

function fetchText(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, { headers: { 'User-Agent': 'BlockCoach fabric resolver' } }, (response) => {
      if (response.statusCode < 200 || response.statusCode >= 300) {
        response.resume();
        reject(new Error(`HTTP ${response.statusCode} for ${url}`));
        return;
      }
      let body = '';
      response.setEncoding('utf8');
      response.on('data', chunk => { body += chunk; });
      response.on('end', () => resolve(body));
    });
    request.on('error', reject);
    request.setTimeout(20000, () => {
      request.destroy(new Error(`Timeout while fetching ${url}`));
    });
  });
}

function pickLatestStable(entries, fallbackMessage) {
  if (!Array.isArray(entries) || entries.length === 0) throw new Error(fallbackMessage);
  const stable = entries.find(entry => entry?.stable === true || entry?.loader?.stable === true || entry?.mappings?.stable === true);
  return stable || entries[0];
}

function parseMavenVersions(xml) {
  return [...xml.matchAll(/<version>([^<]+)<\/version>/g)].map(match => match[1]);
}

function compareVersionLike(a, b) {
  const tokenize = value => String(value).split(/[^0-9A-Za-z]+/).filter(Boolean).map(part => /^\d+$/.test(part) ? Number(part) : part);
  const aa = tokenize(a);
  const bb = tokenize(b);
  const length = Math.max(aa.length, bb.length);
  for (let i = 0; i < length; i += 1) {
    const av = aa[i] ?? 0;
    const bv = bb[i] ?? 0;
    if (typeof av === 'number' && typeof bv === 'number') {
      if (av !== bv) return av - bv;
    } else {
      const result = String(av).localeCompare(String(bv), undefined, { numeric: true, sensitivity: 'base' });
      if (result !== 0) return result;
    }
  }
  return 0;
}

function replaceProperty(text, key, value) {
  const line = `${key}=${value}`;
  const pattern = new RegExp(`^${key}=.*$`, 'm');
  if (pattern.test(text)) return text.replace(pattern, line);
  return `${text.trimEnd()}\n${line}\n`;
}

const { text, props } = readProperties(propsPath);
const minecraftVersion = props.get('minecraft_version') || '1.21.11';
const fabricMetaBase = 'https://meta.fabricmc.net/v2/versions';

try {
  const loaderJson = JSON.parse(await fetchText(`${fabricMetaBase}/loader/${minecraftVersion}`));
  const loaderEntry = pickLatestStable(loaderJson, `No Fabric Loader versions returned for Minecraft ${minecraftVersion}`);
  const loaderVersion = loaderEntry?.loader?.version;
  if (!loaderVersion) throw new Error(`Could not read loader.version for Minecraft ${minecraftVersion}`);

  const yarnJson = JSON.parse(await fetchText(`${fabricMetaBase}/yarn/${minecraftVersion}`));
  const yarnEntry = pickLatestStable(yarnJson, `No Yarn mappings returned for Minecraft ${minecraftVersion}`);
  const yarnMappings = yarnEntry?.version;
  if (!yarnMappings || !yarnMappings.includes(minecraftVersion)) {
    throw new Error(`Could not read Yarn mappings for Minecraft ${minecraftVersion}`);
  }

  const fabricApiMetadata = await fetchText('https://maven.fabricmc.net/net/fabricmc/fabric-api/fabric-api/maven-metadata.xml');
  const apiVersions = parseMavenVersions(fabricApiMetadata)
    .filter(version => version.endsWith(`+${minecraftVersion}`) || version.includes(`+${minecraftVersion}`))
    .sort(compareVersionLike);
  const fabricApiVersion = apiVersions.at(-1);
  if (!fabricApiVersion) throw new Error(`No Fabric API artifact found for Minecraft ${minecraftVersion}`);

  const resolved = {
    minecraft_version: minecraftVersion,
    loader_version: loaderVersion,
    yarn_mappings: yarnMappings,
    fabric_api_version: fabricApiVersion
  };

  console.log('Resolved Fabric artifacts:');
  for (const [key, value] of Object.entries(resolved)) console.log(`- ${key}=${value}`);

  if (shouldWrite) {
    let next = text;
    for (const [key, value] of Object.entries(resolved)) next = replaceProperty(next, key, value);
    writeFileSync(propsPath, next);
    console.log(`\nUpdated ${propsPath}`);
  } else {
    console.log('\nDry run only. Add --write to update gradle.properties.');
  }
} catch (error) {
  console.error('Fabric version resolver failed.');
  console.error(error.message);
  console.error('\nCheck your internet connection and verify that Fabric has published Loader, Yarn and Fabric API artifacts for the selected Minecraft version.');
  process.exit(1);
}
