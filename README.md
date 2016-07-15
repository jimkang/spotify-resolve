spotify-resolve
==================

You pass it Spotify URIs (e.g. spotify:album:3HJ4C0poaEMEg8u56sfr02). It gives you back Spotify entities. It figures out what endpoint to call to call it, so you don't have to.

It will also batch resource ids of a given type together so as to make as few requests as possible, while also respecting resource limits per API request.

Installation
------------

    npm install spotify-resolve

Usage
-----

`spotify-resolve` exports a functor you call to create a resolve function you can use to resolve URIs, rather than exporting a resolve function directly:

    var spResolve = require('spotify-resolve')();
    spResolve('spotify:album:3HJ4C0poaEMEg8u56sfr02', logResult);

    function logResult(error, result) {
      if (error) {
        console.log(error);
      }
      else {
        console.log(JSON.stringify(result, null, '  '));
      }
    }

This will print out a [Spotify album object](https://developer.spotify.com/web-api/get-album/).

To get *many* URIs resolved:

    spResolve(
      [
        'spotify:track:6TiCkACNmrC80bCJ3K2a4U',
        'spotify:track:3lOHeRgeA3oCyxxHl6sVsa',
        'spotify:track:41uWkGOCpz0CA5vJ1nIKI6',
        'spotify:album:3HJ4C0poaEMEg8u56sfr02'
      ],
      logResult
    );

This will print out an array of three [Spotify track objects](https://developer.spotify.com/web-api/get-track/) and one [Spotify album object](https://developer.spotify.com/web-api/get-album/).

Plug in your own request library
---------------------------------

By default, it uses [request](https://github.com/request/request) to make http calls. If you want to specify a different http request function to handle that, you can by passing it to the functor. Like `request`, your function needs to:

    - Take an opt object that has `url` and `method` properties.
    - Take a callback that will be passed an error, a response object (can be null), and a parsed JSON body.

Example:

    var http = require('http');

    var SpotifyResolveFunctor = require('spotify-resolve');
    var spResolve = SpotifyResolveFunctor({
      request: myRequestFunction
    });

    spResolve(
      [
        'spotify:track:6TiCkACNmrC80bCJ3K2a4U',
        'spotify:track:3lOHeRgeA3oCyxxHl6sVsa',
        'spotify:track:41uWkGOCpz0CA5vJ1nIKI6',
        'spotify:album:3HJ4C0poaEMEg8u56sfr02'
      ],
      logResult
    );

    function myRequestFunction(opts, callback) {
      var responseString = '';

      var httpOpts = url.parse(opts.url);
      httpOpts.method = opts.method;

      var req = https.request(httpOpts, handleResponseEvents);
      req.on('error', respondToError);
      req.end();

      function handleResponseEvents(res) {
        res.setEncoding('utf8');
        res.on('data', function receiveChunk(chunk) {
          responseString += chunk;
        });
        res.on('end', function endData() {
          callback(null, res, JSON.parse(responseString));
        });
      }

      function respondToError(error) {
        callback(error);
      }
    }

Tests
-----

Run tests with `make test`.

License
-------

The MIT License (MIT)

Copyright (c) 2016 Jim Kang

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the 'Software'), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
