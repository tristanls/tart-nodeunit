/*

default.js - default tart-nodeunit reporter

The MIT License (MIT)

Copyright (c) 2010 Caolan McMahon
Copyright (c) 2013 Dale Schumacher, Tristan Slominski

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

*/
"use strict";

/**
 * Module dependencies
 */

var AssertionError = require('../assert.js').AssertionError;
var fs = require('fs');
var nodeunit = require('../nodeunit');
var path = require('path');
var tart = require('tart-tracing');
var track = require('../track.js');
var utils = require('../utils.js');

/**
 * Reporter info string
 */

exports.info = "Default tests reporter";

/**
 * Run all tests within each module, reporting the results to the command-line.
 *
 * @param {Array} files
 * @api public
 */

exports.run = function (files, options, callback) {

    options = options || {
        error_prefix: "\u001B[31m",
        error_suffix: "\u001B[39m",
        ok_prefix: "\u001B[32m",
        ok_suffix: "\u001B[39m",
        bold_prefix: "\u001B[1m",
        bold_suffix: "\u001B[22m",
        assertion_prefix: "\u001B[35m",
        assertion_suffix: "\u001B[39m"
    };

    var error = function (str) {
        return options.error_prefix + str + options.error_suffix;
    };
    var ok    = function (str) {
        return options.ok_prefix + str + options.ok_suffix;
    };
    var bold  = function (str) {
        return options.bold_prefix + str + options.bold_suffix;
    };
    var assertion_message = function (str) {
        return options.assertion_prefix + str + options.assertion_suffix;
    };

    var start = new Date().getTime();
    var tracker = track.createTracker(function (tracker) {
        if (tracker.unfinished()) {
            console.log('');
            console.log(error(bold(
                'FAILURES: Undone tests (or their setups/teardowns): '
            )));
            var names = tracker.names();
            for (var i = 0; i < names.length; i += 1) {
                console.log('- ' + names[i]);
            }
            console.log('');
            console.log('To fix this, make sure all tests call test.done()');
            process.reallyExit(tracker.unfinished());
        }
    });

    var opts = {
        testspec: options.testspec,
        testFullSpec: options.testFullSpec,
        moduleStart: function (name) {
            console.log('\n' + bold(name));
        },
        testDone: function (name, assertions) {
            tracker.remove(name);

            if (!assertions.failures()) {
                console.log('✔ ' + name);
            }
            else {
                console.log(error('✖ ' + name) + '\n');
                assertions.forEach(function (a) {
                    if (a.failed()) {
                        a = utils.betterErrors(a);
                        if (a.error instanceof AssertionError && a.message) {
                            console.log(
                                'Assertion Message: ' +
                                assertion_message(a.message)
                            );
                        }
                        console.log(a.error.stack + '\n');
                    }
                });
            }
        },
        done: function (assertions, end) {
            var end = end || new Date().getTime();
            var duration = end - start;
            if (assertions.failures()) {
                console.log(
                    '\n' + bold(error('FAILURES: ')) + assertions.failures() +
                    '/' + assertions.length + ' assertions failed (' +
                    assertions.duration + 'ms)'
                );
            }
            else {
                console.log(
                   '\n' + bold(ok('OK: ')) + assertions.length +
                   ' assertions (' + assertions.duration + 'ms)'
                );
            }

            if (callback) callback(assertions.failures() ? new Error('We have got test failures.') : undefined);
        },
        testStart: function(name) {
            tracker.put(name);
        },
        testReady: function (test) {
            var tracing = tart.tracing();
            test.dispatch = tracing.dispatch;
            test.eventLoop = tracing.eventLoop;
            test.sponsor = tracing.sponsor;
        }
    };

    if (files && files.length) {
        var paths = files.map(function (p) {
            return path.join(process.cwd(), p);
        });
        nodeunit.runFiles(paths, opts);
    } else {
        nodeunit.runModules(files, opts);
    }
};