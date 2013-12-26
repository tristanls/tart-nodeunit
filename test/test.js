/*

test.js - test script

The MIT License (MIT)

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

var tartNodeunit = require('../index.js');

var test = module.exports = {};

test["eventLoop delivers all messages and returns `true`"] = function (test) {
    test.expect(3);

    var first = function first(message) {
        test.equal(message, 'first');
        this.self('second');
        this.behavior = second;
    };
    var second = function second(message) {
        test.equal(message, 'second');
        this.behavior = boom;
    };
    var boom = function boom(message) {
        throw new Error('Should not be called!');
    };

    var actor = test.sponsor(first);
    actor('first');
    
    test.ok(test.eventLoop());
    test.done();
};

test["sponsor creates an actor"] = function (test) {
    test.expect(2);

    var actor = test.sponsor(function (message) {  // create
        test.ok(message);
    });
    actor(true);  // send

    test.ok(test.eventLoop());
    test.done();
};

test["eventLoop delivers limited number of events"] = function (test) {
    test.expect(4);

    var actor = test.sponsor(function (message) {  // create
        test.ok(message);
        this.self(message + 1);  // send
    });
    actor(1);  // send

    var done = test.eventLoop({ count: 3 });
    test.strictEqual(done, false);
    test.done();
};

test["dispatch dispatches a single event"] = function (test) {
    test.expect(3);

    var value;

    var actor = test.sponsor(function (message) {
        test.ok(message);
        value = message;
        this.self(message + 1);
    });
    actor(1); // send

    var effect = test.dispatch();
    test.notStrictEqual(effect, false);
    test.equal(value, 1);
    test.done();
};

test["example from tart-tracing exercises all actor primitives"] = function (test) {
    test.expect(4);

    var oneTimeBeh = function oneTimeBeh(message) {
        test.equal(message, 'bar');
        var child = this.sponsor(createdBeh); // create
        child('foo'); // send
        this.behavior = becomeBeh; // become
    };
    var createdBeh = function createdBeh(message) {
        test.equal(message, 'foo');
    };
    var becomeBeh = function becomeBeh(message) {
        test.equal(message, 'baz');
    };

    var actor = test.sponsor(oneTimeBeh);  // create
    actor('bar');  // send
    actor('baz');  // send

    test.ok(test.eventLoop());
    test.done();
};
