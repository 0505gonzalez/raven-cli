'use strict';

var program = require('commander');
var prompt = require('prompt');
var colors = require('colors');

var ProjectCreator = require('./core/project_creator');
var ProjectBuilder = require('./core/project_builder');

var pkg = require('../package.json');

function RavenCli() {}

RavenCli.prototype.run = function (argv) {
    prompt.message = null;
    prompt.colors = false;

    program.version(pkg.version);

    program
        .command('start')
        .description('create a new game or library')
        .action(RavenCli._handleStartCommand);

    program
        .command('build')
        .description('compile project or library')
        .action(RavenCli._handleBuildCommand);

    program
        .command('clean')
        .description('clean up build files')
        .action(RavenCli._handleCleanCommand);

    if (process.argv.slice(2).length) {
        program.parse(argv);
    } else {
        program.outputHelp();
    }
};

RavenCli._handleStartCommand = function () {
    prompt.start();

    prompt.get({
        properties: {
            name: {
                pattern: /^[a-zA-Z\_]+$/,
                message: 'Name must be only letters and underscores',
                required: true
            }
        }
    }, function (err, results) {
        if (err) {
            console.error(colors.red('\nAborting raven project creation'));
            return;
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

RavenCli._handleCleanCommand = function () {
    ProjectBuilder.clean({ project_directory: process.cwd() }, function (err) {
        if (err) {
            console.log(err.stack);
            console.error(colors.red('\nProject clean was unsuccessful'));
            return;
        }

        console.log(colors.green('\nProject was cleaned successfully'));
    });
};

module.exports = RavenCli;
