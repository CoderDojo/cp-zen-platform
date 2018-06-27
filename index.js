#!/usr/bin/env node
/* eslint-disable no-console */
const TITLE = 'cp-zen-platform';
process.env.component = TITLE;

process.setMaxListeners(0);
require('events').EventEmitter.prototype._maxListeners = 100; // eslint-disable-line no-underscore-dangle

const util = require('util');
const cluster = require('cluster');
const workerFactory = require('./web/index.js');
// Array of Worker processes
const workers = [];

// clean shut down - note cb is optional here (used in testsuite)
function cleanShutdown() {
  if (cluster.isMaster) {
    // shutdown all our workers - exit when all workers have exited..
    console.log('Master, got shutdown signal, shutting down workers..');
    for (let i = 0; i < workers.length; i += 1) {
      const worker = workers[i];
      if (worker.destroy) worker.destroy();
      else if (worker.kill) worker.kill();
      else if (worker.process && worker.process.kill) worker.process.kill();
    }
  } else {
    console.log(`Worker: ${cluster.worker.id} exiting`);
    process.exit(0);
  }
}

// Show 'starting' message
let starting = `Starting ${TITLE} `;
starting += cluster.isWorker
  ? `Worker Id: ${cluster.worker.id} pid: ${process.pid}`
  : `Master: ${process.pid}`;
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
process.on('INT', cleanShutdown);
process.on('SIGUSR2', cleanShutdown);

// start worker
function startWorker() {
  workerFactory.start();
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
