'use strict';

var program = require('commander');
var prompt = require('prompt');
var colors = require('colors');

var ProjectCreator = require('./raven/project_creator');
var ProjectBuilder = require('./raven/project_builder');

var pkg = require('../package.json');

function RavenCli() {
    this.projectCreator = new ProjectCreator();
    this.projectBuilder = new ProjectBuilder();
}

RavenCli.prototype.run = function (argv) {
    var self = this;

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

                self.projectCreator.buildNewProject({
                    project_directory: process.cwd() + '/' + results.name,
                    project_name: results.name
                }, function () {
                    console.log(colors.green('\nProject successfully created'));
                });
            });
        });

    program
        .command('build')
        .description('compile and build .gba folder from the source code in the current directory')
        .action(function () {
            self.projectBuilder.build({ project_directory: process.cwd() }, function () {
                console.log(colors.green('\nProject was built successfully'));
            });
        });

    program.parse(argv);
};

module.exports = RavenCli;
