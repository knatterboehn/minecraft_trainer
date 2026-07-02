import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const cwd = 'fabric-mod/blockcoach-client';
const gradlew = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
const command = existsSync(`${cwd}/${gradlew}`) ? gradlew : 'gradle';

const result = spawnSync(command, ['build'], {
  cwd,
  stdio: 'inherit',
  shell: process.platform === 'win32'
});

if (result.error) {
  console.error(`Could not start ${command}. Install Gradle or add a Gradle wrapper to ${cwd}.`);
  process.exit(1);
}
process.exit(result.status ?? 1);
