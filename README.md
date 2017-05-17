# fs-capture

[![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/demo.html?gist=bc50ea2bea3e8dc1969e72572646354a) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/Burnett01/fs-capture/master/LICENSE) [![Build Status](https://travis-ci.org/Burnett01/fs-capture.svg?branch=master)](https://travis-ci.org/Burnett01/fs-capture) [![npm version](https://badge.fury.io/js/fs-capture.svg?ver=88)](https://badge.fury.io/js/fs-capture)
[<img src="https://cdn.rawgit.com/feross/standard/master/badge.svg" align="right" />](https://github.com/feross/standard)


Captures a folder and/or file, based on a path.

We've all been to that point where we want to query a file/folder in a convenient way.

Perhaps a file and a folder share the same name and sometimes we don't even know the extension beforehand.

And what if we just want to gather those files/folders in a specific order?

<br>

**Here comes fs-capture into play!**


A simple module based on its tiny capture-engine, featuring a [promised](https://github.com/petkaantonov/bluebird) asynchronous control-flow.

Read the explanation: [Explanation](#explanation)

---

# Table of contents

* [API Reference](#api-reference)
  * [Arguments](#arguments)
* [Default options](#defopt)
* [Setup](#setup)
* [Explanation](#explanation)
* [Examples](#examples)
  * [Example (callback)](#example-callback)
  * [Example (promises)](#example-promises) (recommended)
* [Flows](#flows)
* [Important notes](#important-notes)
* [Todo](#todo)
* [How to install](#how-to-install)
* [Unit-Tests](#unit-tests)
  * [Test-case: Default](../master/test/test.default.js)
  * [Make](#make)
  * [NPM](#npm)
* [Contributing](#contributing)
* [License](#license)

---

## API Reference

Capture Engine:

```javascript
capture(
    String target,
    [Object {
        extension: String='',
        sort: int=type
    } options],
	[function(class ErrorClass err, Array results) Handler]
) -> function|Promise

```

**Arguments:** <a id="arguments"></a>

| Argument | Description |
| ------ | ----------- |
| target   | A path that points to a directory or file |
| options | An object with supplied options (optional) |
| callback | A nodeback (err, results) |
|  | 1st = Error || null |
|  | 2nd = Array || [ ] |

---

**Default options:** <a id="defopt"></a>

By default the capture-processor is going check for a directory first.

Since directory-names normally do not contain an extension (suffix), 
it is safe to assume that there are less zero-extension 
files than directories in a real-world scenario.

However. You can simply change this behaviour to get the desired results.


```javascript
{
    extension: '',        // (String)  any
    sort: 2,              // (int)     1 = File | 2 = Directory
}
```

| Option | Description |
| ------ | ----------- |
| extension   | A string that contains a suffix '.js' (optional) [bound to `sort`] |
| sort | A integer of 1 = File or 2 = Folder (optional) [bound to `extension`] |

<hr style="border:1px solid grey;color:red;" />

> **Important!** The ```sort``` option does only work in conjunction with the ```extension``` option! [read more](#explanation)

---

## Setup

fs-capture can be easily set up.

```javascript
var capture = require('fs-capture')
```

---

## Explanation

Assume we have the following directory: ```/home/steven/```

Inside that directory we have a folder called ```code``` and a file called ```code.txt```

Based on our input ```{ sort: 1 }```, we want to catch the file first.

```javascript
capture('/home/steven/code', { extension: '.txt', sort: 1 }, 
  function (err, results) {

    if (err) { return console.log(err) }

    console.log(results) 
    
    /* 
    Results
    [ 
        { path: '/home/steven/code.txt', stats: copy of fs.stat, type: 1 },
        { path: '/home/steven/code', stats: copy of fs.stat, type: 2 }
    ]
    */
})
```

As you can see we caught the file as specified.

If we hadn't specified the order, the capture-processor would've returned the folder first.

> Remember: By default it is going to look for a directory first. ([read more](#api-reference))

---

## Examples

### Example (callback)

Catch a directory and file called 'dog' in default order

```javascript
capture('/home/steven/dog', function (err, results) {

  if (err) { return console.log(err) }

  console.log(results) 
  
  /* 
  Results
  [ 
      { path: '/home/steven/dog', stats: copy of fs.stat, type: 2 },
      { path: '/home/steven/dog.txt', stats: copy of fs.stat, type: 1 }
  ]

  Now do stuff with results
  */

})
```

Check the next example to get an impression on how to use options.

### Example (promises)

Catch a directory and file called 'dog' in default order.

Get all results:

```javascript
capture('/home/steven/dog')
.then(function (results) {
    // do something with all results
})
.catch(function (err) {
    // do error handling
})
```

Get all results (2nd approach):

```javascript
capture('/home/steven/dog').all() //same as above
```

Get results one by one:

```javascript
capture('/home/steven/dog')
.each(function (result) {
  // do something for each result
})
.catch(function (err) {
  // do error handling
})
```

Filter the results:

```javascript
capture('/home/steven/dog')
.filter(function (result) {
  return !(result.type == 2)
})
.then(function (results) {
  // do something for each result
})
.catch(function (err) {
  // do error handling
})
```

There is a lot you can archive with promises.

Some of them:
+ .all
+ .props
+ .any
+ .some
+ .map
+ .reduce
+ .filter
+ .each
+ .mapSeries
+ .race

Check Bluebirds [API-Reference](http://bluebirdjs.com/docs/api-reference.html) for more.

---

### Flows

There are atleast 5 flows available to be used with the callback or promises:

```javascript
capture('/home/steven/dog')
// Captures a folder OR file by the name of dog
```

```javascript
capture('/home/steven/dog.txt')
// Captures a folder OR file by the name of dog.txt
```

```javascript
capture('/home/steven/dog', { extension: '.txt' })
// Captures a folder AND file by the name of dog and dog.txt
```

```javascript
capture('/home/steven/dog', { extension: '.txt', sort: 1 })
// Captures a file AND folder by the name of dog and dog.txt sorted by the file
```

```javascript
capture('/home/steven/dog', { extension: '.txt', sort: 2 })
// Captures a file AND folder by the name of dog and dog.txt sorted by folder
// This works the same as flow 3 thus redundant
```

[...] to be continued

Once you got your results you may want to do more: [Check promises](#example-promises)

---

### Important notes

 * fs-capture **does not(!)** read, search nor traverse the supplied ```target```. 
  
  It simply checks whether a file/folder exists by grabbing their stats. Check [.stat()](https://nodejs.org/api/fs.html#fs_fs_fstat_fd_callback)


 * An error of type ``ENOENT`` will be supressed by the capture-processor, when file and folder are not found.

  Instead an empty Array is forwarded to the 2nd parameter of the nodeback.

  When using Promises, the ``.catch()`` handler will not be fired on ``ENOENT``.

  Such as with the callback, an empty array is returned. It is up to the client to handle that empty array.

  <strong>Any other error will not be supressed and forwarded/thrown.</strong>

  This is intentional due to the way of how a file/folder is processed. 

  Soon a custom error-handler ontop of Promises (or an option) will be added, to have the client catch that error.


* The ```sort``` option does only work in conjunction with the ```extension``` option,

  since with the ```extension``` option we are telling the capture-proccessor to check for an additional file/folder.

  There is no sense in sorting a single result.

---

### Todo

* Add ```captureSync()``` if needed. Quite redundant in favour of promises.
* Improvements

---

## How to install:

Use `npm install fs-capture` 

---

## Unit-Tests

The testing-framework used in this module is [Mocha](https://github.com/mochajs/mocha) with the BDD / TDD assertion library [Chai](https://github.com/chaijs/chai).

Various tests are performed to make sure this module runs as smoothly as possible.

To get an overview of a test, simply consume its source.

* test/test.default.js `Performs 18 tests` | [Source](../master/test/test.default.js)

Output using [Mocha](https://github.com/mochajs/mocha) `list` reporter:   

<img src="https://i.imgur.com/rleyVGa.png" />

Default reporter: `spec`

Any other reporter:  ``make test REPORTER=nyan``

### Make

```make test```

### NPM

```npm test```

<br />

Once executed, an entire testing-filestructure will be created for you. Up to 3 empty folders and files are put into ```test/tmp/```, prior to running the tests.
If you don't need that structure anymore, simply delete by running ```make clean```

---

## Contributing

You're very welcome and free to contribute. Thank you.

---

## License

[MIT](../master/LICENSE.MD)
