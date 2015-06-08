// Karma configuration
// Generated on Mon Jul 21 2014 11:48:34 GMT+0200 (CEST)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['browserify', 'mocha', 'sinon-chai'],


    // list of files / patterns to load in the browser
    files: [
      'web/public/components/angular/angular.js',
      'web/public/components/angular-mocks/angular-mocks.js',
      'web/public/components/moment/moment.js',
      'test/test-helper.js',
      'web/public/js/controllers/review-champion-application-controller.js',
      // 'web/public/js/controllers/*.js',
      'test/*-spec.js'
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'test/test-helper.js': ['browserify'],
      'web/public/js/controllers/review-champion-application-controller.js': ['coverage', 'browserify'],
      'test/*-spec.js': ['browserify']
      // 'web/public/js/controllers/*.js': ['coverage']
    },

    coverageReporter: {
      // type : 'html',
      type : 'text-summary',
      dir : 'coverage/'
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'coverage'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  });
};
