const registry = new Map();

export function registerDevice(device) {
  registry.set(device.id, device);
}

export function unregisterDevice(id) {
  registry.delete(id);
}

export function getDevices() {
  return Array.from(registry.values());
}
