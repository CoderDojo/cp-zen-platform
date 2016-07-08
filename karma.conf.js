// Karma configuration
// Generated on Mon Jul 21 2014 11:48:34 GMT+0200 (CEST)

module.exports = function(config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',


        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['browserify', 'mocha', 'fixture', 'sinon-chai'],


        // list of files / patterns to load in the browser
        files: [
            './test/utils/globals.js',
            './web/public/components/jquery/dist/jquery.js',
            './web/public/components/angular/angular.js',
            './web/public/components/angular-mocks/angular-mocks.js',
            './web/public/components/angular-bootstrap/ui-bootstrap.js',
            './web/public/components/angular-bootstrap/ui-bootstrap-tpls.js',
            './web/public/components/moment/moment.js',
            './web/public/components/angular-translate/angular-translate.js',
            './web/public/components/bootstrap/dist/js/bootstrap.js',
            './web/public/components/ckeditor/ckeditor.js',
            './web/public/components/ng-ckeditor/ng-ckeditor.js',
            './web/public/components/tg-angular-validator/dist/angular-validator.js',
            './web/public/components/angular-ui-router/release/angular-ui-router.js',
            './web/public/components/ngstorage/ngStorage.js',
            './web/public/components/angular-route/angular-route.js',
            './web/public/components/angular-ui-select/dist/select.js',
            './web/public/components/angular-sanitize/angular-sanitize.js',
            './web/public/components/angular-ui-map/ui-map.js',
            './web/public/components/angular-ui-utils/ui-utils.js',
            './web/public/components/angular-truncate/src/truncate.js',
            './web/public/components/angular-wizard/dist/angular-wizard.js',
            './web/public/components/checklist-model/checklist-model.js',
            './web/public/components/angular-sb-date-select/src/sb-date-select.js',
            './web/public/components/angular-alert-banner/dist/angular-alert-banner.js',
            './web/public/components/angular-translate-loader-url/angular-translate-loader-url.js',
            './web/public/components/angular-spinner/angular-spinner.min.js',
            './web/public/components/ng-tags-input/ng-tags-input.min.js',
            './web/public/components/ngBootbox/ngBootbox.js',
            './web/public/components/angular-cookies/angular-cookies.js',
            './web/public/components/angular-translate-storage-cookie/angular-translate-storage-cookie.min.js',
            './web/public/components/angular-breadcrumb/dist/angular-breadcrumb.min.js',
            './web/public/components/angular-recaptcha/release/angular-recaptcha.min.js',
            './web/public/components/ng-file-upload/ng-file-upload.min.js',
            './web/public/components/ng-file-upload-shim/ng-file-upload-shim.min.js',
            './web/public/components/ng-slide-down/dist/ng-slide-down.min.js',
            './web/public/components/angular-popover-toggle/popover-toggle.js',
            './web/public/components/angular-dynamic-locale/dist/tmhDynamicLocale.js',
            './web/public/components/angular-atomic-notify/src/angular-atomic-notify.js',
            './web/public/components/intl-tel-input/build/js/intlTelInput.min.js',
            './web/public/components/international-phone-number/releases/international-phone-number.min.js',
            './web/public/components/ng-idle/angular-idle.min.js',
            './web/public/components/angularjs-dropdown-multiselect/dist/angularjs-dropdown-multiselect.min.js',
            './web/public/components/angular-tooltips/dist/angular-tooltips.min.js',
            './web/public/components/ngGeolocation/ngGeolocation.min.js',
            './web/public/components/angular-socialshare/lib/angular-socialshare.js',
            './web/public/components/angular-google-analytics/dist/angular-google-analytics.min.js',
            './web/public/components/angular-aria/angular-aria.min.js',
            './web/public/js/cp-zen-platform.js',
            './web/public/js/controllers/*.js',
            './web/public/js/directives/*.js',
            './web/public/js/services/*.js',
            './web/public/js/init-master.js',
            './test/*-spec.js',
            './test/fixtures/*.json'
        ],

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
