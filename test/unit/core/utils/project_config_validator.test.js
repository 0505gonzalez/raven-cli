'use strict';

var chai = require('chai');
var expect = chai.expect;

var ProjectConfigValidator = require('../../../../src/core/utils/project_config_validator');

describe('ProjectConfigValidator', function () {
    it('should return successfully if name has only letters and underscores', function (done) {
        ProjectConfigValidator.validate({
            name: 'sample_name_with_underscores'
        }, function (err) {
            expect(err).to.be.null;
            done();
        });
    });

    it('should return error if name has spaces', function (done) {
        ProjectConfigValidator.validate({
            name: 'sample name with spaces'
        }, function (err) {
            expect(err).to.be.an('error');
            done();
        });
    });

    it('should return error if name has numbers', function (done) {
        ProjectConfigValidator.validate({
            name: 'sample123'
        }, function (err) {
            expect(err).to.be.an('error');
            done();
        });
    });

    it('should return error if name has special character', function (done) {
        ProjectConfigValidator.validate({
            name: 'sample?'
        }, function (err) {
            expect(err).to.be.an('error');
            done();
        });
    });
});
