#!/usr/bin/env node
const TITLE = 'cp-zen-platform';
process.env.component = TITLE;

process.setMaxListeners(0);
require('events').EventEmitter.prototype._maxListeners = 100; // eslint-disable-line no-underscore-dangle

const util = require('util');
const cluster = require('cluster');
const workerFactory = require('./web/index.js');
const { logger } = require('cp-logs-lib')({
  name: TITLE,
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'info',
});

// Array of Worker processes
const workers = [];
const numCPUs = 1; // require('os').cpus().length;

function cleanShutdown(err) {
  if (err !== undefined) {
    logger.error(
      err,
      err.stack !== undefined
        ? `FATAL: UncaughtException, please report: ${util.inspect(err.stack)}`
        : 'FATAL: UncaughtException, no stack trace',
    );
  }
  if (cluster.isMaster) {
    // shutdown all our workers - exit when all workers have exited..
    logger.info('Master, got shutdown signal, shutting down workers..');
    for (let i = 0; i < workers.length; i += 1) {
      const worker = workers[i];
      if (worker.destroy) worker.destroy();
      else if (worker.kill) worker.kill();
      else if (worker.process && worker.process.kill) worker.process.kill();
    }
  } else {
    logger.info(`Worker: ${cluster.worker.id} exiting`);
    process.exit(0);
  }
}

logger.info(
  `Starting ${TITLE} ${
    cluster.isWorker
      ? `Worker Id: ${cluster.worker.id} pid: ${process.pid}`
      : `Master: ${process.pid}`
  }`,
);

// handle uncaught exceptions
process.on('uncaughtException', cleanShutdown);

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
    // Fork workers.
    for (let i = 0; i < numCPUs; i += 1) {
      const worker = cluster.fork();
      workers.push(worker);
    }

    // Handle workers exiting
    cluster.on('exit', (worker) => {
      if (worker.exitedAfterDisconnect === true) {
        logger.info('Cleanly exiting..');
        process.exit(0);
      }
      logger.error(`Worker: ${worker.process.pid} has died!! Respawning..`);
      const newWorker = cluster.fork();
      for (let i = 0; i < workers.length; i += 1) {
        if (workers[i] && workers[i].id === worker.id) workers.splice(i);
      }
      workers.push(newWorker);
    });
  } else {
    startWorker();
  }
}

start();
