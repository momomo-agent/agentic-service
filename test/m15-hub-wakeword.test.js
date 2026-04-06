// DBB-005: hub.js wakeword broadcast to all connected devices
import assert from 'node:assert/strict';
import { broadcastWakeword, registerDevice, unregisterDevice } from '../src/server/hub.js';

const received = [];
const makeDevice = (id) => ({
  id,
  name: `device-${id}`,
  capabilities: [],
  lastPong: Date.now(),
  ws: { send: (msg) => received.push({ id, msg: JSON.parse(msg) }) }
});

// Register 2 devices
registerDevice(makeDevice('d1'));
registerDevice(makeDevice('d2'));

// Broadcast wakeword
broadcastWakeword();

// Both should receive wakeword
const d1msgs = received.filter(r => r.id === 'd1' && r.msg.type === 'wakeword');
const d2msgs = received.filter(r => r.id === 'd2' && r.msg.type === 'wakeword');

assert.equal(d1msgs.length, 1, 'device d1 should receive wakeword');
assert.equal(d2msgs.length, 1, 'device d2 should receive wakeword');

unregisterDevice('d1');
unregisterDevice('d2');

console.log('PASS: broadcastWakeword sends to all connected devices (DBB-005)');
