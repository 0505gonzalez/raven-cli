'use strict';

var _ = require('underscore');
var async = require('async');
var fs = require('fs');
var fse = require('fs-extra');
var ChildProcess = require('child_process');
var path = require('path');
var assert = require('assert-plus');

var RAVEN_TEMPLATE_PATH = path.resolve(__dirname) + '/../templates';

function ProjectBuilder() {}

ProjectBuilder.build = function (options, callback) {
    assert.string(options.project_directory, 'options.project_directory must be a string');
    assert.func(callback);

    async.auto({
        raven_project_configuration: function (callback) {
            ProjectBuilder._getProjectConfiguration(options.project_directory, callback);
        },
        build_folder: ['raven_project_configuration', function (results, callback) {
            ProjectBuilder._generateOrUpdateBuildFolder(options.project_directory, results.raven_project_configuration, callback);
        }],
        make_output: ['build_folder', function (results, callback) {
            ProjectBuilder._runMakefile(results.build_folder, callback);
        }]
    }, function (err, results) {
        if (err) {
            return callback(err);
        }

        callback(null, results.make_output);
    });
};

ProjectBuilder.clean = function (options, callback) {
    assert.string(options.project_directory, 'options.project_directory must be a string');
    assert.func(callback);

    var buildFolderPath = options.project_directory + '/build';

    async.auto({
        raven_project_configuration: function (callback) {
            ProjectBuilder._getProjectConfiguration(options.project_directory, callback);
        },
        remove_build_folder: ['raven_project_configuration', function (results, callback) {
            fse.remove(buildFolderPath, callback);
        }]
    }, function (err) {
        return callback(err);
    });
};

ProjectBuilder._getProjectConfiguration = function (projectDirectory, callback) {
    var ravenProjectJSONFile = projectDirectory + '/raven.json';

    fs.exists(ravenProjectJSONFile, function (fileExists) {
        if (!fileExists) {
            return callback(new Error('This directory does not contain a valid raven.json file'));
        }

        callback(null, require(ravenProjectJSONFile));
    });
};

ProjectBuilder._generateOrUpdateBuildFolder = function (projectDirectory, projectConfig, callback) {
    var sourceFolderPath = projectDirectory + '/src';
    var buildFolderPath = projectDirectory + '/build';

    fs.exists(buildFolderPath, function (exists) {
        if (exists) {
            return ProjectBuilder._updateBuildFolder(sourceFolderPath, buildFolderPath, projectConfig, callback);
        } else {
            return ProjectBuilder._generateBuildFolder(sourceFolderPath, buildFolderPath, projectConfig, callback);
        }
    });
};

ProjectBuilder._generateBuildFolder = function (sourceFolderPath, buildFolderPath, projectConfig, callback) {
    var buildSourceFolderPath = buildFolderPath + '/src';

    async.auto({
        build_folder: function (callback) {
            fs.mkdir(buildFolderPath, '0744', callback);
        },
        copy_latest_source: ['build_folder', function (results, callback) {
            fse.copy(sourceFolderPath, buildSourceFolderPath, callback);
        }],
        generate_makefile: ['build_folder', function (results, callback) {
            ProjectBuilder._generateMakefile(buildFolderPath, projectConfig, callback);
        }]
    }, function (err) {
        if (err) {
            return callback(err);
        }

        callback(null, buildFolderPath);
    });
};

ProjectBuilder._updateBuildFolder = function (sourceFolderPath, buildFolderPath, projectConfig, callback) {
    var buildSourceFolderPath = buildFolderPath + '/src';

    async.auto({
        delete_current_makefile: function (callback) {
            fse.remove(buildFolderPath + '/Makefile', callback);
        },
        generate_makefile: ['delete_current_makefile', function (results, callback) {
            ProjectBuilder._generateMakefile(buildFolderPath, projectConfig, callback);
        }],
        update_build_source: function (callback) {
            ProjectBuilder._updateBuildSourceFolder(sourceFolderPath, buildSourceFolderPath, callback);
        }
    }, function (err) {
        if (err) {
            return callback(err);
        }

        callback(null, buildFolderPath);
    });
};

ProjectBuilder._updateBuildSourceFolder = function (sourceFolderPath, buildSourceFolderPath, callback) {
    async.auto({
        source_files: function (callback) {
            ProjectBuilder._getListOfSourceFiles(sourceFolderPath, callback);
        },
        build_source_files: function (callback) {
            ProjectBuilder._getListOfSourceFiles(buildSourceFolderPath, callback);
        },
        remove_deleted_files: ['source_files', 'build_source_files', function (results, callback) {
            var deletedFiles = _.difference(results.build_source_files, results.source_files);
            var deletedFilePaths = _.map(deletedFiles, function (deletedFile) {
                return buildSourceFolderPath + '/' + deletedFile;
            });

            async.each(deletedFilePaths, fse.remove, callback);
        }],
        copy_new_files: ['source_files', 'build_source_files', function (results, callback) {
            var newFiles = _.difference(results.source_files, results.build_source_files);

            async.each(newFiles, function (newFile, next) {
                var sourceFilePath = sourceFolderPath + '/' + newFile;
                var buildSourceFilePath = buildSourceFolderPath + '/' + newFile;

                fse.copy(sourceFilePath, buildSourceFilePath, next);
            }, callback);
        }],
        update_modified_files: ['source_files', 'build_source_files', function (results, callback) {
            var potentiallyUpdatedFiles = _.intersection(results.source_files, results.build_source_files);

            async.each(potentiallyUpdatedFiles, function (potentiallyUpdatedFile, next) {
                var sourceFilePath = sourceFolderPath + '/' + potentiallyUpdatedFile;
                var buildSourceFilePath = buildSourceFolderPath + '/' + potentiallyUpdatedFile;

                var sourceFileModifiedDate = new Date(fs.statSync(sourceFilePath).mtime);
                var buildSourceModifiedDate = new Date(fs.statSync(buildSourceFilePath).mtime);

                if (buildSourceModifiedDate.getTime() > sourceFileModifiedDate.getTime()) {
                    return next();
                }

                fse.copy(sourceFilePath, buildSourceFilePath, next);
            }, callback);
        }]
    }, function (err) {
        callback(err);
    });
};

ProjectBuilder._getListOfSourceFiles = function (directory, callback) {
    async.auto({
        files: function (callback) {
            fs.readdir(directory, callback);
        },
        source_file_lists: ['files', function (results, callback) {
            function toListOfSourceFiles (file, callback) {
                var filePath = directory + '/' + file;

                if (fs.lstatSync(filePath).isDirectory()) {
                    ProjectBuilder._getListOfSourceFiles(filePath, function (err, subFiles) {
                        if (err) {
                            return callback(err);
                        }

                        var normalizedFiles = _.map(subFiles, function (subFile) { return file + '/' + subFile; });

                        callback(null, normalizedFiles);
                    });
                } else {
                    callback(null, [file]);
                }
            }

            async.map(results.files, toListOfSourceFiles, callback);
        }]
    }, function (err, results) {
        if (err) {
            callback(err);
        }

        function concatArrays (firstArray, secondArray) {
            return firstArray.concat(secondArray);
        }

        callback(null, _.reduce(results.source_file_lists, concatArrays, []));
    });
};

ProjectBuilder._generateMakefile = function (buildFolderPath, projectConfig, callback) {
    var ravenPath = path.resolve(__dirname) + '/../..';

    var makefileTemplateFile = RAVEN_TEMPLATE_PATH + '/makefile.template';
    var makefile = buildFolderPath + '/Makefile';

    async.auto({
        makefile_template_buffer: function (callback) {
            fs.readFile(makefileTemplateFile, callback);
        },
        makefile: ['makefile_template_buffer', function (results, callback) {
            var makefileTemplate = _.template(results.makefile_template_buffer.toString());
            var makefileContent = makefileTemplate({
                raven_path: path.normalize(ravenPath),
                target_name: projectConfig.name
            });

            fs.writeFile(makefile, makefileContent, callback);
        }]
    }, function (err) {
        return callback(err);
    });
};

ProjectBuilder._runMakefile = function (buildFolderPath, callback) {
    var command = 'make -C ' + buildFolderPath;

    ChildProcess.exec(command, function (err, stdout) {
        if (err) {
            return callback(err);
        }

        callback(null, stdout);
    });
};

module.exports = ProjectBuilder;
