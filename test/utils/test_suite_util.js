'use strict';

var fs = require('fs');
var fse = require('fs-extra');
var async = require('async');
var assert = require('assert-plus');

function TestSuiteUtil() {}

TestSuiteUtil.OUTPUT_DIR = PROJECT_PATH + '/test_out';

TestSuiteUtil.setupOutputFolder = function (callback) {
    assert.func(callback);

    async.auto({
        delete_current_output_folder: function (callback) {
            fse.remove(TestSuiteUtil.OUTPUT_DIR, callback);
        },
        create_output_dir: ['delete_current_output_folder', function (results, callback) {
            fs.mkdir(TestSuiteUtil.OUTPUT_DIR, callback);
        }]
    }, function (err) {
        return callback(err);
    });
};

module.exports = TestSuiteUtil;
