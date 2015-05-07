'use strict';


module.exports = function (grunt) {

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-mocha-cli');

  grunt.initConfig(require('./grunt/config'));

  grunt.registerTask('default', ['jshint', 'mochacli']);
  grunt.registerTask('test', ['jshint', 'mochacli']);
  grunt.registerTask('precommit', []);

};
