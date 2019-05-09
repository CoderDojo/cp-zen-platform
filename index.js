#!/usr/bin/env node
/* eslint-disable no-console */
const TITLE = 'cp-zen-platform';
process.env.component = TITLE;

process.setMaxListeners(0);
require('events').EventEmitter.prototype._maxListeners = 100; // eslint-disable-line no-underscore-dangle

const util = require('util');
const bin = require('./web/index.js');

// clean shut down - note cb is optional here (used in testsuite)
function cleanShutdown() {
  console.log(`Process: ${process.pid} exiting`);
  process.exit(0);
}

// Show 'starting' message
let starting = `Starting ${TITLE} `;
starting += `Master: ${process.pid}`;
console.log(starting);

// handle uncaught exceptions
process.on('uncaughtException', (err) => {
  if (err !== undefined) {
    const error = {
      date: new Date().toString(),
      msg:
        err.stack !== undefined
          ? `FATAL: UncaughtException, please report: ${util.inspect(err.stack)}`
          : 'FATAL: UncaughtException, no stack trace',
      err: util.inspect(err),
    };
    console.error(JSON.stringify(error));
  }
  cleanShutdown(); // exit on uncaught exception
});

process.on('unhandledRejection', r => console.log(r));

// handle process signals
process.on('SIGTERM', cleanShutdown);
process.on('SIGHUP', cleanShutdown);
process.on('SIGINT', cleanShutdown);
process.on('SIGUSR2', cleanShutdown);

bin.start();

