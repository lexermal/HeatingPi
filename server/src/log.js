'use strict';
const { logLevel } = require('./config');

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };
const min = LEVELS[logLevel] || LEVELS.info;

// journald adds timestamps itself, so only the level is prefixed.
function make(level) {
  return (...args) => {
    if (LEVELS[level] < min) return;
    (level === 'error' || level === 'warn' ? console.error : console.log)(`[${level}]`, ...args);
  };
}

module.exports = { debug: make('debug'), info: make('info'), warn: make('warn'), error: make('error') };
