#!/usr/bin/env node
const TITLE = 'cp-zen-platform';
process.env.component = TITLE;

process.setMaxListeners(0);
require('events').EventEmitter.prototype._maxListeners = 100; // eslint-disable-line no-underscore-dangle

const util = require('util');
const cluster = require('cluster');
const index = require('./web/index.js');

// Show 'starting' message
let starting = `Starting ${TITLE}`;
if (cluster.isWorker) {
  starting += ` Worker Id: ${cluster.worker.id} pid: ${process.pid}`;
} else {
  starting = `${starting} Master: ${process.pid}`;
}
console.log(starting);

// handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(
    `${new Date().toString()} FATAL: UncaughtException, please report: ${util.inspect(err)}`,
  );
  if (err !== undefined && err.stack !== undefined) {
    console.error(util.inspect(err.stack));
  }
  console.trace();
  cleanShutdown(); // exit on uncaught exception
});

// Array of Worker processes
const workers = [];

function cleanShutdown() {
  if (cluster.isMaster) {
    // shutdown all our workers - exit when all workers have exited..
    console.log('Master, got shutdown signal, shutting down workers..');

    workers.forEach((worker) => {
      if (worker.destroy) worker.destroy();
      else if (worker.kill) worker.kill();
      else if (worker.process && worker.process.kill) worker.process.kill();
    });
  } else {
    console.log(`Worker: ${cluster.worker.id} exiting`);
    process.exit(0);
  }
}

// handle process signals
process.on('SIGTERM', cleanShutdown);
process.on('SIGHUP', cleanShutdown);
process.on('INT', cleanShutdown);

// start worker
function startWorker() {
  index.start();
}

// start: note we use one master and one worker, so any uncaught exceptions in worker
// will result in the worker process being restarted by the master.
function start() {
  if (cluster.isMaster) {
    const numCPUs = 1; // require('os').cpus().length;
    // Fork workers.
    for (let i = 0; i < numCPUs; i += 1) {
      const worker = cluster.fork();
      workers.push(worker);
    }

    // Handle workers exiting
    cluster.on('exit', (worker) => {
      if (worker.suicide === true) {
        console.log('Cleanly exiting..');
        process.exit(0);
      } else {
        const msg = `Worker: ${worker.process.pid} has died!! Respawning..`;
        console.error(msg);
        const newWorker = cluster.fork();
        for (let i = 0; i < workers.length; i += 1) {
          if (workers[i] && workers[i].id === worker.id) workers.splice(i);
        }
        workers.push(newWorker);
      }
    });
  } else {
    startWorker();
  }
}

start();
