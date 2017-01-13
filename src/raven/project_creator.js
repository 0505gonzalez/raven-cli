'use strict';

var _ = require('underscore');
var fs = require('fs');
var path = require('path');
var assert = require('assert-plus');

var RAVEN_TEMPLATE_PATH = path.resolve(__dirname) + '/../templates';

function ProjectCreator() {}

ProjectCreator.createNewProject = function (options, callback) {
    assert.string(options.project_directory, 'options.project_directory must be a string');
    assert.string(options.project_name, 'options.project_name must be a string');
    assert.func(callback);

    var newProjectMainfile = options.project_directory + '/src/' + options.project_name + '.cpp';
    var ravenProjectFile = options.project_directory + '/raven.json';

    var helloWorldTemplateFile = RAVEN_TEMPLATE_PATH + '/hello_world.cpp.template';
    var helloWorldTemplateStr = fs.readFileSync(helloWorldTemplateFile).toString();
    var helloWorldTemplate = _.template(helloWorldTemplateStr);

    if (fs.existsSync(options.project_directory)) {
        throw new Error('directory already exists:', options.project_directory);
    }

    fs.mkdirSync(options.project_directory, '0744');
    fs.mkdirSync(options.project_directory + '/src', '0744');

    fs.writeFileSync(newProjectMainfile, helloWorldTemplate());
    fs.writeFileSync(ravenProjectFile, JSON.stringify({ name: options.project_name }, null, '    '));

    callback();
};

module.exports = ProjectCreator;
