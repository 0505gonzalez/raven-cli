'use strict';

var fs = require('fs');
var chai = require('chai');
var expect = chai.expect;
var TestSuiteUtil = require(PROJECT_PATH + '/test/utils/test_suite_util');
var ProjectCreator = require(PROJECT_PATH + '/src/core/project_creator');

describe('ProjectCreator', function () {

    var PROJECT_NAME = 'project_creator_test';
    var PROJECT_DIRECTORY = TestSuiteUtil.OUTPUT_DIR + '/' + PROJECT_NAME;

    before(function (done) {
        TestSuiteUtil.setupOutputFolder(done);
    });

    before(function (done) {
        ProjectCreator.createNewProject({
            project_name: PROJECT_NAME,
            project_directory: PROJECT_DIRECTORY
        }, done);
    });

    it('Should create a folder with project name', function (done) {
        fs.exists(PROJECT_DIRECTORY, function (exists) {
            expect(exists).to.be.true;
            done();
        });
    });

    it('Should create a raven.json file', function (done) {
        fs.readFile(PROJECT_DIRECTORY + '/raven.json', function (err, ravenJSONContent) {
            if (err) {
                return done(err);
            }

            var ravenConfigFile = JSON.parse(ravenJSONContent.toString());

            expect(ravenConfigFile.name).to.equal(PROJECT_NAME);

            done();
        });
    });

    it('Should create a src folder', function (done) {
        fs.exists(PROJECT_DIRECTORY + '/src', function (exists) {
            expect(exists).to.be.true;
            done();
        });
    });

    it('Shuold create a main c file with the project name', function (done) {
        fs.readFile(PROJECT_DIRECTORY + '/src/' + PROJECT_NAME + '.c', function (err, sourceFileContent) {
            if (err) {
                return done(err);
            }

            var sourceFileContentStr = sourceFileContent.toString();

            expect(sourceFileContentStr.indexOf('Hello World!')).to.be.at.least(0);

            done();
        });
    });

});
