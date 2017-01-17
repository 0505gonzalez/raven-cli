'use strict';

var fs = require('fs');
var fse = require('fs-extra');
var chai = require('chai');
var expect = chai.expect;
var async = require('async');
var TestSuiteUtil = require(PROJECT_PATH + '/test/utils/test_suite_util');
var ProjectCreator = require(PROJECT_PATH + '/src/core/project_creator');
var ProjectBuilder = require(PROJECT_PATH + '/src/core/project_builder');

describe('ProjectBuilder', function () {

    var PROJECT_NAME = 'project_builder_test';
    var PROJECT_DIRECTORY = TestSuiteUtil.OUTPUT_DIR + '/' + PROJECT_NAME;

    beforeEach(function (done) {
        TestSuiteUtil.setupOutputFolder(done);
    });

    beforeEach(function (done) {
        ProjectCreator.createNewProject({
            project_name: PROJECT_NAME,
            project_directory: PROJECT_DIRECTORY
        }, done);
    });

    describe('Building from scratch', function () {

        beforeEach(function (done) {
            ProjectBuilder.build({ project_directory: PROJECT_DIRECTORY }, done);
        });

        it('Should create a build folder', function (done) {
            fs.exists(PROJECT_DIRECTORY + '/build', function (exists) {
                expect(exists).to.be.true;
                done();
            });
        });

        it('Should create Makefile', function (done) {
            fs.exists(PROJECT_DIRECTORY + '/build/Makefile', function (exists) {
                expect(exists).to.be.true;
                done();
            });
        });

        it('Should create src folder', function (done) {
            fs.exists(PROJECT_DIRECTORY + '/build/src', function (exists) {
                expect(exists).to.be.true;
                done();
            });
        });

        it('Should copy source files over to src folder', function (done) {
            fs.exists(PROJECT_DIRECTORY + '/build/src/' + PROJECT_NAME + '.c', function (exists) {
                expect(exists).to.be.true;
                done();
            });
        });

        it('Should generate .gba file', function (done) {
            fs.exists(PROJECT_DIRECTORY + '/build/' + PROJECT_NAME + '_mb.gba', function (exists) {
                expect(exists).to.be.true;
                done();
            });
        });

        afterEach(function (done) {
            ProjectBuilder.clean({ project_directory: PROJECT_DIRECTORY }, done);
        });
    });

    describe('Building using existing build folder', function () {

        beforeEach(function (done) {
            ProjectBuilder.build({ project_directory: PROJECT_DIRECTORY }, done);
        });

        it('Should replace makefile when project config changes', function (done) {
            var makefile = PROJECT_DIRECTORY + '/build/Makefile';

            async.auto({
                makefile_stats: function (callback) {
                    fs.stat(makefile, callback);
                },
                timeout: ['makefile_stats',  function (results, callback) {
                    setTimeout(callback, 1000);
                }],
                build: ['timeout', function (results, callback) {
                    ProjectBuilder.build({ project_directory: PROJECT_DIRECTORY }, callback);
                }],
                new_makefile_stats: ['build', function (results, callback) {
                    fs.stat(makefile, callback);
                }]
            }, function (err, results) {
                if (err) {
                    return done(err);
                }

                var makefileModifiedDate = new Date(results.makefile_stats.mtime);
                var newMakefileModifiedDate = new Date(results.new_makefile_stats.mtime);

                expect(newMakefileModifiedDate.getTime()).to.be.above(makefileModifiedDate.getTime());
                done();
            });
        });

        it('Should create file in build source folder if it was created in project source folder', function (done) {
            async.auto({
                new_source_file: function (callback) {
                    fs.writeFile(PROJECT_DIRECTORY + '/src/new.c', '', callback);
                },
                build: ['new_source_file', function (results, callback) {
                    ProjectBuilder.build({ project_directory: PROJECT_DIRECTORY }, callback);
                }],
                build_source_file_exists: ['build', function (results, callback) {
                    fs.exists(PROJECT_DIRECTORY + '/build/src/new.c', function (exists) {
                        return callback(null, exists);
                    });
                }]
            }, function (err, results) {
                if (err) {
                    return done(err);
                }

                expect(results.build_source_file_exists).to.be.true;

                done();
            });
        });

        it('Should delete file in build source folder if it was deleted in project source folder', function (done) {
            async.auto({
                new_source_file: function (callback) {
                    fs.writeFile(PROJECT_DIRECTORY + '/src/delete.c', '', callback);
                },
                build: ['new_source_file', function (results, callback) {
                    ProjectBuilder.build({ project_directory: PROJECT_DIRECTORY }, callback);
                }],
                build_source_file_exists_before_removing: ['build', function (results, callback) {
                    fs.exists(PROJECT_DIRECTORY + '/build/src/delete.c', function (exists) {
                        return callback(null, exists);
                    });
                }],
                delete_new_source_file: ['build_source_file_exists_before_removing', function (results, callback) {
                    fse.remove(PROJECT_DIRECTORY + '/src/delete.c', callback);
                }],
                second_build: ['delete_new_source_file', function (results, callback) {
                    ProjectBuilder.build({ project_directory: PROJECT_DIRECTORY }, callback);
                }],
                build_source_file_exists_after_removing: ['second_build', function (results, callback) {
                    fs.exists(PROJECT_DIRECTORY + '/build/src/delete.c', function (exists) {
                        return callback(null, exists);
                    });
                }],
            }, function (err, results) {
                if (err) {
                    return done(err);
                }

                expect(results.build_source_file_exists_before_removing).to.be.true;
                expect(results.build_source_file_exists_after_removing).to.be.false;

                done();
            });
        });

        it('Should update file in build source folder if it was modified in project source folder', function (done) {
            this.timeout(3000);
            
            var sourceFile = PROJECT_DIRECTORY + '/src/' + PROJECT_NAME + '.c';
            var buildSourceFile = PROJECT_DIRECTORY + '/build/src/' + PROJECT_NAME + '.c';

            async.auto({
                source_file_content: function (callback) {
                    fs.readFile(sourceFile, callback);
                },
                build_source_file_stats: function (callback) {
                    fs.stat(buildSourceFile, callback);
                },
                first_timeout: ['build_source_file_stats', function (results, callback) {
                    setTimeout(callback, 1000);
                }],
                update_source_file: ['build_source_file_stats', 'source_file_content', 'first_timeout', function (results, callback) {
                    var updatedFileContent = results.source_file_content.toString().replace('Hello', 'Goodbye');

                    fs.writeFile(sourceFile, updatedFileContent, callback);
                }],
                second_timeout: ['update_source_file', function (results, callback) {
                    setTimeout(callback, 1000);
                }],
                build: ['second_timeout', function (results, callback) {
                    ProjectBuilder.build({ project_directory: PROJECT_DIRECTORY }, callback);
                }],
                new_build_source_file_stats: ['build', function (results, callback) {
                    fs.stat(buildSourceFile, callback);
                }]
            }, function (err, results) {
                if (err) {
                    return done(err);
                }

                var modifiedDateBeforeFileEdit = new Date(results.build_source_file_stats.mtime);
                var modifiedDateAfterFileEdit = new Date(results.new_build_source_file_stats.mtime);

                expect(modifiedDateAfterFileEdit.getTime()).to.be.above(modifiedDateBeforeFileEdit.getTime());

                done();
            });
        });

        it('Should not update file in build source folder if it was not modified in project source folder', function (done) {
            var buildSourceFile = PROJECT_DIRECTORY + '/build/src/' + PROJECT_NAME + '.c';

            async.auto({
                build_source_file_stats: function (callback) {
                    fs.stat(buildSourceFile, callback);
                },
                build: ['build_source_file_stats', function (results, callback) {
                    ProjectBuilder.build({ project_directory: PROJECT_DIRECTORY }, callback);
                }],
                new_build_source_file_stats: ['build', function (results, callback) {
                    fs.stat(buildSourceFile, callback);
                }]
            }, function (err, results) {
                if (err) {
                    return done(err);
                }

                var modifiedDateBeforeBuild = new Date(results.build_source_file_stats.mtime);
                var modifiedDateAfterBuild = new Date(results.new_build_source_file_stats.mtime);

                expect(modifiedDateAfterBuild.getTime()).to.equal(modifiedDateBeforeBuild.getTime());

                done();
            });
        });

        after(function (done) {
            ProjectBuilder.clean({ project_directory: PROJECT_DIRECTORY }, done);
        });
    });

    describe('Cleaning project', function () {
        it ('should delete the build folder', function (done) {
            async.auto({
                build: function (callback) {
                    ProjectBuilder.build({ project_directory: PROJECT_DIRECTORY }, function () {
                        setTimeout(function () { return callback(); }, 1700);
                    });
                },
                clean: ['build', function (results, callback) {
                    ProjectBuilder.clean({ project_directory: PROJECT_DIRECTORY }, callback);
                }],
                build_exists: ['clean', function (results, callback) {
                    fs.exists(PROJECT_DIRECTORY + '/build', function (exists) {
                        return callback(null, exists);
                    });
                }]
            }, function (err, results) {
                if (err) {
                    return done(err);
                }

                expect(results.build_exists).to.be.false;

                done();
            });
        });
    });
});
