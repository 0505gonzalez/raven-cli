'use strict';

var program = require('commander');
var prompt = require('prompt');
var colors = require('colors');

var ProjectCreator = require('./raven/project_creator');
var ProjectBuilder = require('./raven/project_builder');

var pkg = require('../package.json');

function RavenCli() {}

RavenCli.prototype.run = function (argv) {
    prompt.message = null;
    program.version(pkg.version);

    program
        .command('start')
        .description('create a new game or library')
        .action(RavenCli._handleStartCommand);

    program
        .command('build')
        .description('compile project or library')
        .action(RavenCli._handleBuildCommand);

    program.parse(argv);
};

RavenCli._handleStartCommand = function () {
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

        var projectOptions = {
            project_directory: process.cwd() + '/' + results.name,
            project_name: results.name
        };

        ProjectCreator.createNewProject(projectOptions, function () {
            console.log(colors.green('\nProject was created successfully'));
        });
    });
};

RavenCli._handleBuildCommand = function () {
    ProjectBuilder.build({ project_directory: process.cwd() }, function (err, buildInfo) {
        if (err) {
            console.error(err.stack);
            console.error(colors.red('\nProject build was unsuccessful'));
            return;
        }

        console.log('\n' + buildInfo);
        console.log(colors.green('\nProject was built successfully'));
    });
};

module.exports = RavenCli;
