'use strict';

var program = require('commander');
var prompt = require('prompt');
var colors = require('colors');

var ProjectBuilder = require('./raven/project_builder');

var pkg = require('../package.json');

function RavenCli() {}

RavenCli.run = function (argv) {

    prompt.message = null;
    program.version(pkg.version);

    program
        .command('start')
        .description('create a new game in folder game_name')
        .action(function (name){
            if (!name) {
                return console.error('game name is required');
            }

            prompt.start();
            prompt.get({
                properties: {
                    name: {
                        pattern: /^[a-zA-Z\s\-\_]+$/,
                        message: 'Name must be only letters, spaces, or dashes',
                        required: true
                    }
                }
            }, function (err, results) {
                if (err) {
                    console.error('\nAborting raven project creation');
                }

                ProjectBuilder.buildNewProject({ project_name: results.name });

                console.log(colors.green('\nProject successfully created'));
            });
        });

    program
        .command('build')
        .description('compiled and build .gba folder from source code in current directory')
        .action(function (){
            console.log('building the game');
            // TODO: Build project in current directory
        });

    program.parse(argv);
};

module.exports = RavenCli;
