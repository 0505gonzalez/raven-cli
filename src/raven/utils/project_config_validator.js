'use strict';

var assert = require('assert-plus');
var Joi = require('joi');

function ProjectConfigValidator() {}

ProjectConfigValidator.validate = function (projectConfig, callback) {
    assert.object(projectConfig);
    assert.func(callback);

    var projectConfigSchema = Joi.object().keys({
        name: Joi.string().regex(/^[a-zA-Z\_]+$/, 'Must contain only letters and underscores')
    });

    Joi.validate(projectConfig, projectConfigSchema, callback);
};

module.exports = ProjectConfigValidator;
