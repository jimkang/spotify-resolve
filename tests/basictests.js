var test = require('tape');
var assertNoError = require('assert-no-error');
var SpotifyResolve = require('../index');
var url = require('url');
var https = require('https');
var checkers = require('./checkers');
var defaultRequest = require('request');

var testCases = [
  {
    name: 'One album',
    createOpts: {request: defaultRequest},
    opts: 'spotify:album:3HJ4C0poaEMEg8u56sfr02',
    expectationCheckers: checkers.checkAlbum
  },

  {
    name: 'Multiple heterogeneous resources',
    createOpts: {request: defaultRequest},
    opts: [
      'spotify:track:6TiCkACNmrC80bCJ3K2a4U',
      'spotify:track:3lOHeRgeA3oCyxxHl6sVsa',
      'spotify:artist:099tLNCZZvtjC7myKD0mFp',
      'spotify:track:41uWkGOCpz0CA5vJ1nIKI6',
      'spotify:album:3HJ4C0poaEMEg8u56sfr02'
    ],
    expectationCheckers: [
      checkers.checkTrack,
      checkers.checkTrack,
      checkers.checkArtist,
      checkers.checkTrack,
      checkers.checkAlbum
    ]    
  },

  {
    name: 'Bad resource URIs',
    createOpts: {request: defaultRequest},
    opts: [
      'spotify:track:6TiCkACNmrC80bCJ3K2a4U',
      'spotify:what:3lOHeRgeA3oCyxxHl6sVsa',
      'spotify:artist:099tLNCZZvtjC7myKD0mFp',
      'spotify:track:thisisnotreal',
      'spotify:album:3HJ4C0poaEMEg8u56sfr02'
    ],
    expectationCheckers: [
      checkers.checkTrack,
      checkers.checkUndefined,
      checkers.checkArtist,
      checkers.checkUndefined,
      checkers.checkAlbum
    ]
  },

  {
    name: 'Unfindable resource URIs',
    createOpts: {request: defaultRequest},
    opts: [
      'spotify:track:zTiCkACNmrC80bCJ3K2a4U',
      'spotify:track:zlOHeRgeA3oCyxxHl6sVsa'
    ],
    expectationCheckers: [
      checkers.checkUndefined,
      checkers.checkUndefined
    ]
  },

  {
    name: 'Custom request function',
    createOpts: {
      request: customRequestFunction
    },
    opts: [
      'spotify:track:6TiCkACNmrC80bCJ3K2a4U',
      'spotify:track:3lOHeRgeA3oCyxxHl6sVsa',
      'spotify:artist:099tLNCZZvtjC7myKD0mFp',
      'spotify:track:41uWkGOCpz0CA5vJ1nIKI6',
      'spotify:album:3HJ4C0poaEMEg8u56sfr02'
    ],
    expectationCheckers: [
      checkers.checkTrack,
      checkers.checkTrack,
      checkers.checkArtist,
      checkers.checkTrack,
      checkers.checkAlbum
    ]
  },

  {
    name: 'No URIs',
    createOpts: {request: defaultRequest},
    opts: [],
    expectationCheckers: []
  },

  {
    name: 'No params',
    createOpts: {request: defaultRequest},
    opts: undefined,
    expectationCheckers: []
  }
];

testCases.forEach(runTest);

function runTest(testCase) {
  test(testCase.name, basicTest);

  function basicTest(t) {
    var spResolve = SpotifyResolve(testCase.createOpts);
    spResolve(testCase.opts, checkResult);

    function checkResult(error, result) {
      assertNoError(t.ok, error, 'No error while calling spotifyResolve.');
      // console.log(JSON.stringify(result, null, '  '));
      if (Array.isArray(testCase.expectationCheckers)) {
        for (var i = 0; i < testCase.expectationCheckers.length; ++i) {
          testCase.expectationCheckers[i](t, result[i]);
        }
      }
      else {
        testCase.expectationCheckers(t, result);
      }
      t.end();
    }
  }
}

function customRequestFunction(opts, callback) {
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
