'use strict';

module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            files: ['./**/*.js', './*.js'],
            options: {
                ignores: ['node_modules/**/*.js'],
                jshintrc: '.jshintrc'
            }
        }
    });

    grunt.registerTask('test:style', ['jshint']);
    grunt.registerTask('test', ['test:style']);
};
