'use strict';

var _ = require('underscore');
var fs = require('fs');
var fse = require('fs-extra');
var exec = require('child_process').exec;
var path = require('path');
var assert = require('assert-plus');

function ProjectBuilder() {
    var RAVEN_TEMPLATE_PATH = path.resolve(__dirname) + '/../templates';

    var makefileTemplateFile = RAVEN_TEMPLATE_PATH + '/Makefile.template';
    var makefileTemplateStr = fs.readFileSync(makefileTemplateFile).toString();

    this._makefileTemplate = _.template(makefileTemplateStr);
    this.RAVEN_PATH = path.resolve(__dirname) + '/../..';
}

ProjectBuilder.prototype.build = function (options, callback) {
    assert.string(options.project_directory, 'options.project_directory must be a string');
    assert.func(callback);

    var ravenProjectJSONFile = options.project_directory + '/raven.json';

    if (!fs.existsSync(ravenProjectJSONFile)) {
        throw new Error('This directory does not contain a valid package.json file');
    }

    var ravenProjectJSON = require(ravenProjectJSONFile);

    var srcDirectory = options.project_directory + '/src';
    var buildDirectory = options.project_directory + '/build';
    var buildSrcDirectory = buildDirectory + '/src';
    var makefile = buildDirectory + '/Makefile';

    if (fs.existsSync(buildDirectory)) {
        fse.removeSync(buildDirectory);
    }

    fs.mkdirSync(buildDirectory, '0744');

    fs.writeFileSync(makefile, this._makefileTemplate({
        raven_path: this.RAVEN_PATH,
        target_name: ravenProjectJSON.name
    }));

    fse.copy(srcDirectory, buildSrcDirectory);

    exec('make -C ' + buildDirectory, function (err, stdout, stderr) {
        // TODO: Handle errors
        callback();
    });
};

module.exports = ProjectBuilder;
