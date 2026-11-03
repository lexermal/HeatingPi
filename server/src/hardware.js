'use strict';
const fs = require('fs');
const path = require('path');
const config = require('./config');
const log = require('./log');

// Relay pins as PHYSICAL header numbers (same list as the legacy CustomConfig.GPIO_PINS).
// Pin id N in the DB = PHYSICAL_PINS[N - 1].
const PHYSICAL_PINS = [3, 5, 11, 13, 15, 19, 21, 23];

// Physical header pin -> BCM GPIO number. Pi 1 B rev 1 boards wire pins 3/5/13 differently.
const BCM_REV2 = { 3: 2, 5: 3, 7: 4, 8: 14, 10: 15, 11: 17, 12: 18, 13: 27, 15: 22, 16: 23, 18: 24, 19: 10, 21: 9, 22: 25, 23: 11, 24: 8, 26: 7 };
const BCM_REV1 = { ...BCM_REV2, 3: 0, 5: 1, 13: 21 };

function readCpuInfo() {
  try {
    return fs.readFileSync('/proc/cpuinfo', 'utf8');
  } catch {
    return '';
  }
}

const cpuInfo = readCpuInfo();
const isPi = /^Hardware\s*:\s*BCM(2708|2709|2710|2835|2836|2837|2711)/m.test(cpuInfo);
const simulated = config.simulate === 'auto' ? !isPi : config.simulate === 'true';
const revision = (cpuInfo.match(/^Revision\s*:\s*([0-9a-f]+)/m) || [])[1] || '';
const bcmMap = ['0002', '0003'].includes(revision) ? BCM_REV1 : BCM_REV2;

// ---------------------------------------------------------------------------
// GPIO via sysfs. Relays are ACTIVE-LOW: "on" = pin LOW.
// ---------------------------------------------------------------------------
const simulatedState = new Map();
let initialized = false;

function sleepSync(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function exportPin(bcm) {
  const dir = path.join(config.gpioDir, `gpio${bcm}`);
  if (!fs.existsSync(dir)) fs.writeFileSync(path.join(config.gpioDir, 'export'), String(bcm));
  // udev fixes the group permissions of the new gpioN files asynchronously after export,
  // so the first write can fail with EACCES for a few hundred ms.
  for (let i = 0; i < 40; i++) {
    try {
      fs.accessSync(path.join(dir, 'direction'), fs.constants.W_OK);
      return dir;
    } catch {
      sleepSync(50);
    }
  }
  return dir;
}

// Opens every relay pin as output driven LOW (= all relays ON) before the first real state is
// written. This mirrors the legacy rpio init and is intentionally kept: the brief "all relays
// click on" is the user's signal that the application is up and working.
function initAll() {
  initialized = true;
  for (const physical of PHYSICAL_PINS) {
    if (simulated) {
      simulatedState.set(physical, true);
      continue;
    }
    try {
      const dir = exportPin(bcmMap[physical]);
      fs.writeFileSync(path.join(dir, 'direction'), 'low');
    } catch (e) {
      log.error(`Could not initialize physical pin ${physical}: ${e.message}`);
    }
  }
  log.info(`Initialized relay pins${simulated ? ' (simulated)' : ''}.`);
}

/** Switches relay `pinId` (1..8) on or off. */
function setRelay(pinId, on) {
  if (!initialized) initAll();
  const physical = PHYSICAL_PINS[pinId - 1];
  if (physical === undefined) throw new Error(`Unknown pin ${pinId}`);
  if (simulated) {
    simulatedState.set(physical, on);
    return;
  }
  fs.writeFileSync(path.join(config.gpioDir, `gpio${bcmMap[physical]}`, 'value'), on ? '0' : '1');
}

// ---------------------------------------------------------------------------
// DS18B20 temperature sensor (1-Wire)
// ---------------------------------------------------------------------------
let simTemp = 19.4;

/** @returns {{ value: number } | { error: string }} */
function readTemperature() {
  if (simulated) {
    // Gentle random walk (10..25 °C) so the simulated dashboard looks like a real room.
    simTemp = Math.min(25, Math.max(10, simTemp + (Math.random() - 0.5) * 0.4));
    return { value: Math.round(simTemp * 100) / 100 };
  }

  let devices;
  try {
    devices = fs.readdirSync(config.w1Glob).filter((d) => d.startsWith('28-'));
  } catch (e) {
    return { error: `1-Wire bus not available: ${e.message}` };
  }
  if (!devices.length) return { error: 'No DS18B20 sensor found' };

  // One retry: a single CRC error on the 1-Wire bus is common and not worth a failed reading.
  let lastError = '';
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const raw = fs.readFileSync(path.join(config.w1Glob, devices[0], 'w1_slave'), 'utf8');
      const [line1, line2] = raw.trim().split('\n');
      const match = (line2 || '').match(/t=(-?\d+)/);
      if (!line1.endsWith('YES') || !match) {
        lastError = 'CRC check failed';
        continue;
      }
      const milli = Number(match[1]);
      // 85000 is the DS18B20 power-on reset value, not a real measurement.
      if (milli === 85000) {
        lastError = 'Sensor returned power-on reset value';
        continue;
      }
      return { value: Math.round(milli / 10) / 100 };
    } catch (e) {
      lastError = e.message;
    }
  }
  return { error: lastError };
}

const isInitialized = () => initialized;

module.exports = { PHYSICAL_PINS, isPi, simulated, initAll, isInitialized, setRelay, readTemperature };
