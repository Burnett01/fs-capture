/*
* The MIT License (MIT)
*
* Product:      fs-capture
* Description:  Captures a folder and/or file, based on a path.
*
* Copyright (c) Steven Agyekum (Burnett01) <agyekum@posteo.de>
*
* Permission is hereby granted, free of charge, to any person obtaining a copy of this software
* and associated documentation files (the "Software"), to deal in the Software without restriction,
* including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
* and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so,
* subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in all copies
* or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
* TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
* THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
* TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*
*/

var expect = require('chai').expect
var assert = require('assert')
var Promise = require('bluebird')
var fs = require('fs')
var path = require('path')
var captureHandler = require('../lib/fs-capture')

var BasePath = 'test/tmp'

/*
  Some integrity checks before we hook up the rest
*/

describe('fs-capture [INTEGRITY CHECKS]', function () {
  it('verifies whether Object.assign exists', function () {
    assert.ok(('assign' in Object))
  })
  it('verifies native fs constants', function () {
    assert.ok(('F_OK' in fs))
  })
  it('verifies native fs.stat function', function () {
    assert.ok(('stat' in fs))
  })

  /* Now it's safe to assign Promise.promisifyAll */
  fs = Promise.promisifyAll(fs)

  it('verifies promisification of fs.stat (.statAsync) (Bluebird)', function () {
    assert.ok(('statAsync' in fs))
  })
})


/*
  Just a few helpers we need for the initial setup.
  You might want to check the [SETUP] flow below.
*/

var joinBasepath = function (p) {
  return path.join(BasePath, p)
}

var makeDir = function (path) {
  return fs.mkdirAsync(path)
    .catch({ code: 'EEXIST' }, function () {
      return false
    })
}

var touchFile = function (path) {
  return fs.openAsync(path, 'w')
    .then(function (fd) {
      return fs.closeAsync(fd)
    })
}

/*
  Here we define two objects, each holding several
  paths to match against target.

  Since those are in public scope, we can easily reference
  to em later. (check tests below)
*/

var folders = {
  basedir: joinBasepath(''),
  folder1: joinBasepath('folder'),
  folder2: joinBasepath('folder' + '.txt'),
  folder3: joinBasepath('same_name')
}

var files = {
  file1: joinBasepath('file'),
  file2: joinBasepath('file' + '.txt'),
  file3: joinBasepath('same_name' + '.txt')
}

/*
  Since our folders and files are represented by two objects (see above),
  I created this extension to convert them to an array then promise.
  This allows us to call a promise method directly on to them.
  In addition we can continue to use our original objects (check tests below)

  According to ESLint, we should avoid extending the native
  Object prototype (no-extend-native). Thus we gonna safely apply it
  to only the objects scope. http://eslint.org/docs/rules/no-extend-native
*/

var toArrayThenPromise = function () {
  var proxy = Object.keys(this)
  return new Promise(function (resolve) {
    resolve(proxy.map(function (a) {
      return (a in folders) ? folders[a] : files[a]
    }))
  })
}

Object.getPrototypeOf(folders).toArrayThenPromise = toArrayThenPromise
Object.getPrototypeOf(files).toArrayThenPromise = toArrayThenPromise

/*
  Now it's time to set up our test folders and files.

  Take a look at the bloated non-promised-based setup I
  used to deal with earlier:
  https://gist.github.com/Burnett01/fddfd2a54815672f21638896606b10e2
*/

describe('fs-capture [SETUP]', function () {
  it('sets up demo-folders', function (done) {
    folders
      .toArrayThenPromise()
      .each(function (folder) {
        return makeDir(folder)
      })
      .then(function () {
        done()
      })
      .catch(function (err) {
        done(err)
      })
  })

  it('sets up test-files', function (done) {
    files
      .toArrayThenPromise()
      .each(function (file) {
        return touchFile(file)
      })
      .then(function () {
        done()
      })
      .catch(function (err) {
        done(err)
      })
  })
})

/*
  Our folders and files are set-up and we are ready
  to perform some tests on them.
*/

/*     ============= TEST FOLDERS =============     */

describe('fs-capture [FOLDERS]', function () {
  it('captures folder1 based on default option', function (done) {
    expect(captureHandler).to.be.a('function')

    captureHandler(folders.folder1)
      .then(function (results) {
        expect(results).to.be.instanceof(Array)
        expect(results).not.to.be.empty

        expect(results[0]).to.have.deep.property('path', folders.folder1)
        expect(results[0]).to.have.deep.property('type', 2)

        done()
      })
      .catch(function (err) {
        done(err)
      })
  })

  it('captures folder2 based on default option', function (done) {
    expect(captureHandler).to.be.a('function')

    captureHandler(folders.folder2)
      .then(function (results) {
        expect(results).to.be.instanceof(Array)
        expect(results).not.to.be.empty

        expect(results[0]).to.have.deep.property('path', folders.folder2)
        expect(results[0]).to.have.deep.property('type', 2)

        done()
      })
      .catch(function (err) {
        done(err)
      })
  })

  it('captures *folder1 and folder2 based on extension option', function (done) {
    expect(captureHandler).to.be.a('function')

    captureHandler(folders.folder1, { extension: '.txt' })
      .then(function (results) {
        expect(results).to.be.instanceof(Array)
        expect(results).not.to.be.empty

        expect(results[0]).to.have.deep.property('path', folders.folder1)
        expect(results[0]).to.have.deep.property('type', 2)
        expect(results[1]).to.have.deep.property('path', folders.folder2)
        expect(results[1]).to.have.deep.property('type', 2)

        done()
      })
      .catch(function (err) {
        done(err)
      })
  })

  it('captures folder1 and *folder2 based on extension and sort option', function (done) {
    expect(captureHandler).to.be.a('function')

    captureHandler(folders.folder1, { extension: '.txt', sort: 1 })
      .then(function (results) {
        expect(results).to.be.instanceof(Array)
        expect(results).not.to.be.empty

        expect(results[0]).to.have.deep.property('path', folders.folder2)
        expect(results[0]).to.have.deep.property('type', 2)
        expect(results[1]).to.have.deep.property('path', folders.folder1)
        expect(results[1]).to.have.deep.property('type', 2)

        done()
      })
      .catch(function (err) {
        done(err)
      })
  })
})

/*     ============= TEST FILES =============     */

describe('fs-capture [FILES]', function () {
  it('captures file1 based on default option', function (done) {
    expect(captureHandler).to.be.a('function')

    captureHandler(files.file1)
      .then(function (results) {
        expect(results).to.be.instanceof(Array)
        expect(results).not.to.be.empty

        expect(results[0]).to.have.deep.property('path', files.file1)
        expect(results[0]).to.have.deep.property('type', 1)

        done()
      })
      .catch(function (err) {
        done(err)
      })
  })

  it('captures file2 based on default option', function (done) {
    expect(captureHandler).to.be.a('function')

    captureHandler(files.file2)
      .then(function (results) {
        expect(results).to.be.instanceof(Array)
        expect(results).not.to.be.empty

        expect(results[0]).to.have.deep.property('path', files.file2)
        expect(results[0]).to.have.deep.property('type', 1)

        done()
      })
      .catch(function (err) {
        done(err)
      })
  })

  it('captures *file1 and file2 based on extension option', function (done) {
    expect(captureHandler).to.be.a('function')

    captureHandler(files.file1, { extension: '.txt' })
      .then(function (results) {
        expect(results).to.be.instanceof(Array)
        expect(results).not.to.be.empty

        expect(results[0]).to.have.deep.property('path', files.file1)
        expect(results[0]).to.have.deep.property('type', 1)
        expect(results[1]).to.have.deep.property('path', files.file2)
        expect(results[1]).to.have.deep.property('type', 1)

        done()
      })
      .catch(function (err) {
        done(err)
      })
  })

  it('captures file1 and *file2 based on extension and sort option', function (done) {
    expect(captureHandler).to.be.a('function')

    captureHandler(files.file1, { extension: '.txt', sort: 1 })
      .then(function (results) {
        expect(results).to.be.instanceof(Array)
        expect(results).not.to.be.empty

        expect(results[0]).to.have.deep.property('path', files.file2)
        expect(results[0]).to.have.deep.property('type', 1)
        expect(results[1]).to.have.deep.property('path', files.file1)
        expect(results[1]).to.have.deep.property('type', 1)

        done()
      })
      .catch(function (err) {
        done(err)
      })
  })
})

/*     ============= TEST FOLDERS + FILES =============     */

describe('fs-capture [FILE + FOLDER]', function () {
  it('captures folder3 based on default option', function (done) {
    expect(captureHandler).to.be.a('function')

    captureHandler(folders.folder3)
      .then(function (results) {
        expect(results).to.be.instanceof(Array)
        expect(results).not.to.be.empty

        expect(results[0]).to.have.deep.property('path', folders.folder3)
        expect(results[0]).to.have.deep.property('type', 2)

        done()
      })
      .catch(function (err) {
        done(err)
      })
  })

  it('captures file3 based on default option', function (done) {
    expect(captureHandler).to.be.a('function')

    captureHandler(files.file3)
      .then(function (results) {
        expect(results).to.be.instanceof(Array)
        expect(results).not.to.be.empty

        expect(results[0]).to.have.deep.property('path', files.file3)
        expect(results[0]).to.have.deep.property('type', 1)

        done()
      })
      .catch(function (err) {
        done(err)
      })
  })

  it('captures *folder3 and file3 based on extension option', function (done) {
    expect(captureHandler).to.be.a('function')

    captureHandler(folders.folder3, { extension: '.txt' })
      .then(function (results) {
        expect(results).to.be.instanceof(Array)
        expect(results).not.to.be.empty

        expect(results[0]).to.have.deep.property('path', folders.folder3)
        expect(results[0]).to.have.deep.property('type', 2)

        expect(results[1]).to.have.deep.property('path', files.file3)
        expect(results[1]).to.have.deep.property('type', 1)

        done()
      })
      .catch(function (err) {
        done(err)
      })
  })

  it('captures folder3 and *file3 based on extension option', function (done) {
    expect(captureHandler).to.be.a('function')

    captureHandler(folders.folder3, { extension: '.txt', sort: 1 })
      .then(function (results) {
        expect(results).to.be.instanceof(Array)
        expect(results).not.to.be.empty

        expect(results[0]).to.have.deep.property('path', files.file3)
        expect(results[0]).to.have.deep.property('type', 1)
        expect(results[1]).to.have.deep.property('path', folders.folder3)
        expect(results[1]).to.have.deep.property('type', 2)

        done()
      })
      .catch(function (err) {
        done(err)
      })
  })
})
