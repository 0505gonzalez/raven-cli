'use strict';

module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha-test');
    
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            files: ['./**/*.js', './*.js'],
            options: {
                ignores: ['node_modules/**/*.js'],
                jshintrc: '.jshintrc'
            }
        },
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec',
                    quiet: false,
                    clearRequireCache: false,
                    noFail: false
                },
                src: ['test/**/*.js']
            }
        }
    });

    grunt.registerTask('test:style', ['jshint']);
    grunt.registerTask('test:mocha', 'mochaTest');
    grunt.registerTask('test', ['test:style', 'test:mocha']);
};
