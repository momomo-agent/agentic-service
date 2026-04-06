const registry = new Map(); // id → { ws, ...deviceInfo }

export function register(ws, deviceInfo) {
  registry.set(deviceInfo.id, { ws, ...deviceInfo });
  ws.on('close', () => registry.delete(deviceInfo.id));
}

export function broadcast(event, data) {
  const msg = JSON.stringify({ event, data });
  for (const { ws } of registry.values()) {
    try { ws.send(msg); } catch { /* ignore closed ws */ }
  }
}

export function registerDevice(device) {
  registry.set(device.id, device);
}

export function unregisterDevice(id) {
  registry.delete(id);
}

export function getDevices() {
  return Array.from(registry.values()).map(({ ws, ...info }) => info);
}
