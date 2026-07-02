// Placeholder for a future real Minecraft bridge.
// A browser page cannot read Minecraft directly. A Fabric mod, server plugin, or local bridge would send events here later.

export function getBridgeStatus() {
  return {
    connected: false,
    label: 'Minecraft-Integration vorbereitet',
    detail: 'Aktuell läuft die App im manuellen Modus. Keine Live-Daten werden vorgetäuscht.'
  };
}

export function connectBridge() {
  return getBridgeStatus();
}
