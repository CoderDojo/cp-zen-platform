'use strict';

var times = module.exports = {};

times.msec = 1;
times.sec = 1000 * times.msec;
times.min = 60 * times.sec;
times.hr = 60 * times.min;
times.day = 24 * times.hr;
times.yr = 365 * times.day;

times.short = times.hr;
times.medium = 30 * times.day;
times.long = times.yr;
