/*
* The MIT License (MIT)
*
* Product:      fs-capture
* Description:  Captures a folder and/or file, based on a path.
*
* Copyright (c) 2016-2019 Steven Agyekum (Burnett01) <agyekum@posteo.de>
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

'use strict'

var Promise = require('bluebird')
var fs = Promise.promisifyAll(require('fs'))

var CAP_ENGINE = { }

/*
 * Method:      Handler
 * Description: Handles all the interaction
 *
 * Arguments:   @path     = String
 *              @options  = Object (optional)
 *              @cb       = Closure (optional)
*/

CAP_ENGINE.Handler = function (path, options, cb) {
  if (typeof options === 'function') {
    cb = options
    options = { }
  }

  options = Object.assign({ extension: '', sort: 2 }, options)

  var paths = [ ]

  switch (options.sort) {
    case 1:
      paths = [ path + options.extension ]
      if (options.extension !== '') {
        paths.push(path)
      }
      break
    case 2:
      paths = [ path ]
      if (options.extension !== '') {
        paths.push(path + options.extension)
      }
      break
  }

  return CAP_ENGINE.Processor(paths)
    .then(function (results) {
      if (cb) { return cb(null, results) }
      return results
    })
    .catch(function (err) {
      if (cb) { return cb(err, null) }
      return err
    })
}

/*
 * Method:      Processor
 * Description: Processing a path based on possibilities
 *
 * Arguments:   @possibilities = Array
*/

CAP_ENGINE.Processor = function (possibilities) {
  return Promise.map(possibilities, function (path) {
    return fs.statAsync(path)
      .then(function (stat) {
        return {
          path: path,
          stats: stat,
          type: (stat.isFile()) ? 1 : 2
        }
      })
      /* Recover from failure */
      .catch({ code: 'ENOENT' }, function () {
        return false
      })
  })
  .filter(function (stat) {
    return !(stat === false)
  })
}

module.exports = CAP_ENGINE.Handler
