'use strict';

var _ = require('underscore');
var async = require('async');
var fs = require('fs');
var path = require('path');
var assert = require('assert-plus');

var RAVEN_TEMPLATE_PATH = path.resolve(__dirname) + '/templates';

function ProjectCreator() {}

ProjectCreator.createNewProject = function (options, callback) {
    assert.string(options.project_directory, 'options.project_directory must be a string');
    assert.string(options.project_name, 'options.project_name must be a string');
    assert.func(callback);

    async.auto({
        ensure_project_folder_does_not_exist: function (callback) {
            ProjectCreator._ensureProjectFolderDoesNotExist(options.project_directory, callback);
        },
        project_folder: ['ensure_project_folder_does_not_exist', function (results, callback) {
            ProjectCreator._generateProjectDirectory(options.project_directory, options.project_name, callback);
        }]
    }, function (err) {
        return callback(err);
    });
};

ProjectCreator._ensureProjectFolderDoesNotExist = function (projectDirectory, callback) {
    fs.exists(projectDirectory, function (exists) {
        if (exists) {
            return callback(new Error('Directory already exists: ' + projectDirectory));
        }

        callback();
    });
};

ProjectCreator._generateProjectDirectory = function (projectDirectory, projectName, callback) {
    var ravenProjectFile = projectDirectory + '/raven.json';

    async.auto({
        project_folder: function (callback) {
            fs.mkdir(projectDirectory, '0744', callback);
        },
        project_configuration_file: ['project_folder', function (results, callback) {
            var projectConfiguration = { name: projectName };
            var projectFileContents = JSON.stringify(projectConfiguration, null, '    ');

            fs.writeFile(ravenProjectFile, projectFileContents, callback);
        }],
        source_folder: ['project_folder', function (results, callback) {
            fs.mkdir(projectDirectory + '/src', '0744', callback);
        }],
        main_source_file: ['source_folder', function (results, callback) {
            ProjectCreator._generateMainSourcefile(projectDirectory, projectName, callback);
        }]
    }, function (err) {
        return callback(err);
    });
};

ProjectCreator._generateMainSourcefile = function (projectDirectory, projectName, callback) {
    var helloWorldTemplateFile = RAVEN_TEMPLATE_PATH + '/hello_world.c.template';
    var newProjectMainfile = projectDirectory + '/src/' + projectName + '.c';

    async.auto({
        hello_world_template_buffer: function (callback) {
            fs.readFile(helloWorldTemplateFile, callback);
        },
        hello_world_file: ['hello_world_template_buffer', function (results, callback) {
            var helloWorldTemplate = _.template(results.hello_world_template_buffer.toString());

            fs.writeFile(newProjectMainfile, helloWorldTemplate(), callback);
        }]
    }, function (err) {
        return callback(err);
    });
};

module.exports = ProjectCreator;
