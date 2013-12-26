# tart-nodeunit

Adapter for `nodeunit` testing ([tart](https://github.com/organix/tartjs) module)

## Contributors

[@dalnefre](https://github.com/dalnefre), [@tristanls](https://github.com/tristanls)

## Overview

Adapter for `nodeunit` testing ([tart](https://github.com/organix/tartjs) module)

  * [Usage](#usage)
  * [Tests](#tests)
  * [Documentation](#documentation)
  * [Sources](#sources)

## Usage

To programmatically use the default reporter:

```javascript
"use strict";

var reporter = require('tart-nodeunit').reporters.default;
reporter.run(['directories/containing/tests']);
```

To run the below example run:

    npm run test

```javascript
"use strict";

var test = module.exports = {};

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
```

## Tests

    npm test

## Documentation

`tart-nodeunit` is an extension for running `nodeunit` tests in the context of [Tiny Actor Run-Time](https://github.com/organix/tartjs).

**Testing API**

  * [test.dispatch()](#testdispatch)
  * [test.eventLoop(\[control\])](testeventloopcontrol)
  * [test.sponsor(behavior)](#testsponsorbehavior)

### test.dispatch()

  * Return: _Effect_ or `false`. Effect of dispatching the next `event` or `false` if no events exists for dispatch.

### test.eventLoop([control])

  * `control`: _Object_ _(Default: `undefined`)_ Optional overrides.
    * `count`: _Number_ _(Default: `undefined`)_ Maximum number of events to dispatch, or unlimited if `undefined`.
    * `fail`: _Function_ `function (exception) {}` Function called to report exceptions thrown from an actor behavior. Exceptions are thrown by default. _(Example: `function (exception) {/*ignore exceptions*/}`)_.
    * `log`: _Function_ `function (effect) {}` Function called with every effect resulting from an event dispatch.
  * Return: _Boolean_ `true` if event queue is exhausted, `false` otherwise.

Dispatch events in a manner provided by `control`. 

By default, calling `tracing.eventLoop()` with no parameters dispatches all events in the event queue.

```javascript
var test = module.exports = {};
test["dispatch delivers limited number of events"] = function (test) {
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
```

### test.sponsor(behavior)

  * `behavior`: _Function_ `function (message) {}` Actor behavior to invoke every time an actor receives a message.
  * Return: _Function_ `function (message) {}` Actor reference in form of a capability that can be invoked to send the actor a message.

Creates a new (traceable) actor and returns the actor reference in form of a capability to send that actor a message.

```javascript
var test = module.exports = {};
test["sponsor creates an actor"] = function (test) {
    test.expect(2);

    var actor = test.sponsor(function (message) {  // create
        test.ok(message);
    });
    actor(true);  // send

    test.ok(test.eventLoop());
    test.done();
};
```

## Sources

  * [Tiny Actor Run-Time (JavaScript)](https://github.com/organix/tartjs)
