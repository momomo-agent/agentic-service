import { WebSocketServer } from 'ws';
import { randomUUID } from 'node:crypto';

const registry = new Map(); // id → { ws, name, capabilities, lastPong }
const pendingCaptures = new Map(); // requestId → { resolve, reject, timer }
const sessions = new Map(); // sessionId → { data: {}, deviceIds: Set }

export function joinSession(sessionId, deviceId) {
  if (!sessions.has(sessionId)) sessions.set(sessionId, { data: {}, deviceIds: new Set() });
  sessions.get(sessionId).deviceIds.add(deviceId);
}

export function setSessionData(sessionId, key, value) {
  if (!sessions.has(sessionId)) sessions.set(sessionId, { data: {}, deviceIds: new Set() });
  sessions.get(sessionId).data[key] = value;
}

export function getSessionData(sessionId, key) {
  return sessions.get(sessionId)?.data[key] ?? null;
}

export function broadcastSession(sessionId) {
  for (const device of registry.values()) {
    try { device.ws.send(JSON.stringify({ type: 'session', sessionId })); } catch { /* ignore */ }
  }
}

// Device management: id → { id, meta, registeredAt, lastSeen, status }
const devices = new Map()

setInterval(() => {
  const now = Date.now()
  for (const d of devices.values()) {
    d.status = (now - d.lastSeen > 60000) ? 'offline' : 'online'
  }
}, 10000)

export function registerDevice(idOrDevice, meta) {
  if (typeof idOrDevice === 'object') {
    const device = idOrDevice
    registry.set(device.id, device)
    if (!devices.has(device.id)) {
      devices.set(device.id, { id: device.id, meta: { name: device.name, capabilities: device.capabilities }, registeredAt: new Date().toISOString(), lastSeen: Date.now(), status: 'online' })
    }
    return
  }
  const id = idOrDevice
  const now = new Date().toISOString()
  devices.set(id, { id, meta, registeredAt: now, lastSeen: Date.now(), status: 'online' })
  return { id, registeredAt: now }
}

export function updateStatus(id, status) {
  if (!devices.has(id)) throw new Error('Device not found: ' + id);
  devices.get(id).status = status;
}

export function heartbeat(id) {
  if (!devices.has(id)) registerDevice(id, {})
  const d = devices.get(id)
  d.lastSeen = Date.now()
  d.status = 'online'
}

export function getDevices() {
  return Array.from(devices.values()).map(d => ({ ...d }))
}

export function unregisterDevice(id) {
  registry.delete(id);
  for (const [reqId, pending] of pendingCaptures) {
    if (pending.deviceId === id) {
      clearTimeout(pending.timer);
      pending.reject(new Error('Device disconnected'));
      pendingCaptures.delete(reqId);
    }
  }
}

export function sendCommand(deviceId, command) {
  const device = registry.get(deviceId);
  if (!device) throw new Error(`Device not found: ${deviceId}`);
  const SUPPORTED = ['capture', 'speak', 'display'];
  if (!SUPPORTED.includes(command.type)) throw new Error(`Unsupported command type: ${command.type}`);
  const requestId = randomUUID();
  const { type, ...rest } = command;
  device.ws.send(JSON.stringify({ type: 'command', requestId, action: type, ...rest }));
  if (type !== 'capture') return Promise.resolve();
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      pendingCaptures.delete(requestId);
      reject(new Error('Capture timeout'));
    }, 10000);
    pendingCaptures.set(requestId, { resolve, reject, timer, deviceId });
  });
}

export function broadcastWakeword(deviceId) {
  for (const device of registry.values()) {
    try { device.ws.send(JSON.stringify({ type: 'wakeword', deviceId })); } catch { /* ignore */ }
  }
}

export function startWakeWordDetection(keyword = process.env.WAKE_WORD || 'hey agent') {
  if (!process.stdin.isTTY) return;
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => {
    if (chunk.toLowerCase().includes(keyword.toLowerCase())) {
      const data = JSON.stringify({ type: 'wake', keyword });
      for (const { ws } of registry.values()) {
        if (ws.readyState === ws.OPEN) ws.send(data);
      }
    }
  });
}

export function initWebSocket(httpServer) {
  const wss = new WebSocketServer({ server: httpServer });

  wss.on('connection', (ws) => {
    let deviceId = null;

    ws.on('message', (raw) => {
      let msg;
      try { msg = JSON.parse(raw); } catch { return; }

      if (msg.type === 'register') {
        deviceId = msg.id;
        registerDevice({ id: msg.id, name: msg.name, capabilities: msg.capabilities || [], ws, lastPong: Date.now() });
        ws.send(JSON.stringify({ type: 'registered', id: msg.id }));
      } else if (msg.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong' }));
      } else if (msg.type === 'pong' && deviceId) {
        const d = registry.get(deviceId);
        if (d) d.lastPong = Date.now();
      } else if (msg.type === 'wakeword') {
        broadcastWakeword(deviceId);
      } else if (msg.type === 'join-session') {
        joinSession(msg.sessionId, deviceId);
        broadcastSession(msg.sessionId);
      } else if (msg.type === 'capture_result') {
        const pending = pendingCaptures.get(msg.requestId);
        if (pending) {
          clearTimeout(pending.timer);
          pending.resolve(msg.data);
          pendingCaptures.delete(msg.requestId);
        }
      }
    });

    ws.on('close', () => { if (deviceId) unregisterDevice(deviceId); });
    ws.on('error', () => { if (deviceId) unregisterDevice(deviceId); });
  });

  setInterval(() => {
    const now = Date.now();
    for (const [id, device] of registry) {
      if (now - device.lastPong > 60000) {
        unregisterDevice(id);
      } else {
        try { device.ws.send(JSON.stringify({ type: 'ping' })); } catch { unregisterDevice(id); }
      }
    }
  }, 30000);

  process.once('SIGINT', () => {
    wss.close(() => process.exit(0));
  });

  return wss;
}
