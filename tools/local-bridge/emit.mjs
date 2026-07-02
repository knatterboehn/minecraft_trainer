const DEFAULT_URL = process.env.BLOCKCOACH_BRIDGE_HTTP || 'http://127.0.0.1:4317/events';

function parseArgs(argv) {
  const event = { type: 'minecraft_connected', playerName: 'Vince', minecraftVersion: '1.21' };
  let url = DEFAULT_URL;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--url') url = argv[i + 1] || url;
    if (arg === '--type') event.type = argv[i + 1] || event.type;
    if (arg === '--server') { event.type = 'server_joined'; event.server = argv[i + 1] || 'PvPClub'; }
    if (arg === '--win') { event.type = 'fight_result'; event.result = 'win'; }
    if (arg === '--loss') { event.type = 'fight_result'; event.result = 'loss'; }
    if (arg === '--training') { event.type = 'fight_result'; event.result = 'training'; }
    if (arg === '--json') return { url, event: JSON.parse(argv[i + 1] || '{}') };
  }

  return { url, event };
}

const { url, event } = parseArgs(process.argv.slice(2));
const response = await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(event)
});
const body = await response.text();
if (!response.ok) {
  console.error(body);
  process.exit(1);
}
console.log(body);
