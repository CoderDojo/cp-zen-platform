#!/usr/bin/env node
var TITLE = 'cp-zen-platform';
process.env.component = TITLE;

process.setMaxListeners(0);
require('events').EventEmitter.prototype._maxListeners = 100; // eslint-disable-line no-underscore-dangle

var util = require('util');
var cluster = require('cluster');
var workerFactory = require('./web/index.js')
// Array of Worker processes
var workers = [];

// clean shut down - note cb is optional here (used in testsuite)
function cleanShutdown () {
  if (cluster.isMaster) {
    // shutdown all our workers - exit when all workers have exited..
    console.log("Master, got shutdown signal, shutting down workers..");
    for (var i = 0; i < workers.length; i+=1) {
      var worker = workers[i];
      if (worker.destroy) worker.destroy();
      else if (worker.kill) worker.kill();
      else if (worker.process && worker.process.kill) worker.process.kill();
    }
  }else {
    console.log("Worker: " + cluster.worker.id + ' exiting');
    process.exit(0);
  }
};

// Show 'starting' message
var starting = "Starting " + TITLE;
if (cluster.isWorker) starting += " Worker Id: " + cluster.worker.id + " pid: " + process.pid;
else starting = starting + ' Master: ' + process.pid;
console.log(starting);

// handle uncaught exceptions
process.on('uncaughtException', function (err) {
  console.error(new Date().toString() + " FATAL: UncaughtException, please report: " + util.inspect(err));
  if (err !== undefined && err.stack !== undefined) {
   console.error(util.inspect(err.stack));
  }
  console.trace();
  cleanShutdown();  // exit on uncaught exception
});

// handle process signals
process.on('SIGTERM', cleanShutdown);
process.on('SIGHUP', cleanShutdown);
process.on('INT', cleanShutdown);

// start worker
function startWorker() {
  workerFactory.start();
};

// start: note we use one master and one worker, so any uncaught exceptions in worker
// will result in the worker process being restarted by the master.
function start() {
  if (cluster.isMaster) {
    var numCPUs = 1;//require('os').cpus().length;
    // Fork workers.
    for (var i = 0; i < numCPUs; i+=1) {
      var worker = cluster.fork();
      workers.push(worker);
    }

    // Handle workers exiting
    cluster.on('exit', function (worker) {
      if (worker.suicide === true) {
        console.log("Cleanly exiting..");
        process.exit(0);
      } else {
        var msg = "Worker: " + worker.process.pid + " has died!! Respawning..";
        console.error(msg);
        var newWorker = cluster.fork();
        for (var i = 0; i < workers.length; i+=1) {
          if (workers[i] && workers[i].id === worker.id) workers.splice(i);
        }
        workers.push(newWorker);
      }
    });
  } else {
    startWorker();
  }
};

start();



/*
var pm2 = require('pm2');

pm2.connect(function() {
  pm2.start({
    script    : 'web/index.js',         // Script to be run
    exec_mode : 'cluster',        // Allow your app to be clustered
    instances : 0
  }, function(err, apps) {
    if (err) return console.error(err);
       pm2.streamLogs('all', 0, false, 'HH:mm:ss', false);
  });
});

process.on('SIGINT', function() {
  console.log('Got SIGINT, exiting');
  pm2.kill();
});

process.on('SIGTERM', function() {
  console.log('Got SIGTERM, exiting');
  pm2.kill();
});
*/
