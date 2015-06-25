'use strict';


module.exports = function jshint(grunt) {
    // Load task
    grunt.loadNpmTasks('grunt-contrib-jshint');

    // Options
    return {
        files: [
            'web/controllers/**/*.js',
            'lib/**/*.js',
            'web/models/!**!/!*.js'
        ],
        options: {
            jshintrc: '.jshintrc'
        }
    };
};
