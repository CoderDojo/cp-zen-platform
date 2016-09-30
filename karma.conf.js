// Karma configuration
// Generated on Mon Jul 21 2014 11:48:34 GMT+0200 (CEST)

var dependencies = require('./web/public/dependencies.json');
var appCode = require('./web/public/app.json');
var filesToLoad = [
    './test/utils/globals.js',
    './web/public/components/ckeditor/ckeditor.js'
  ]
  .concat(dependencies)
  .concat(['./web/public/components/angular-mocks/angular-mocks.js'])
  .concat(appCode)
  .concat(['./test/*-spec.js', './test/fixtures/*.json']);

module.exports = function(config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',


        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['browserify', 'mocha', 'fixture', 'sinon-chai'],


        // list of files / patterns to load in the browser
        files: filesToLoad,

        jsonFixturesPreprocessor: {
          variableName: '__json__'
        },

        // list of files to exclude
        exclude: [],


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            '**/*.html'   : ['html2js'],
            '**/*.json'   : ['json_fixtures'],
            'web/public/js/**/*.js': ['coverage'],
            'test/utils/globals.js': ['browserify'],
            'test/**/*-spec.js': ['browserify']
        },

        coverageReporter: {
            // type : 'html',
            type: 'text-summary',
            dir: 'coverage/'
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
