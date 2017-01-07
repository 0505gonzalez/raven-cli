'use strict';

var fs = require('fs');
var fse = require('fs-extra');
var path = require('path');

var RAVEN_TEMPLATE_PATH = path.resolve(__dirname) + '/../templates';

function ProjectBuilder() {}

ProjectBuilder.buildNewProject = function (options) {
    var projectDirectory = process.cwd() + '/' + options.project_name;
    var helloWorldMainfile = RAVEN_TEMPLATE_PATH + '/hello_world/src/hello_world.c';
    var newProjectMainfile = projectDirectory + '/src/' + options.project_name + '.c';

    if (fs.existsSync(projectDirectory)) {
        throw new Error('directory already exists:', projectDirectory);
    }

    fs.mkdirSync(projectDirectory, '0744');
    fs.mkdirSync(projectDirectory + '/src', '0744');
    fse.copySync(helloWorldMainfile, newProjectMainfile);
};

module.exports = ProjectBuilder;
