var test = require('tape');
var assertNoError = require('assert-no-error');
var SpotifyResolve = require('../index');
var url = require('url');
var https = require('https');

var testCases = [
  {
    name: 'One album',
    createOpts: undefined,
    opts: 'spotify:album:3HJ4C0poaEMEg8u56sfr02',
    expectationCheckers: checkAlbum
  },

  {
    name: 'Multiple heterogeneous resources',
    createOpts: undefined,
    opts: [
      'spotify:track:6TiCkACNmrC80bCJ3K2a4U',
      'spotify:track:3lOHeRgeA3oCyxxHl6sVsa',
      'spotify:artist:099tLNCZZvtjC7myKD0mFp',
      'spotify:track:41uWkGOCpz0CA5vJ1nIKI6',
      'spotify:album:3HJ4C0poaEMEg8u56sfr02'
    ],
    expectationCheckers: [
      checkTrack,
      checkTrack,
      checkArtist,
      checkTrack,
      checkAlbum
    ]    
  },

  {
    name: 'Bad resource URIs',
    createOpts: undefined,
    opts: [
      'spotify:track:6TiCkACNmrC80bCJ3K2a4U',
      'spotify:what:3lOHeRgeA3oCyxxHl6sVsa',
      'spotify:artist:099tLNCZZvtjC7myKD0mFp',
      'spotify:track:thisisnotreal',
      'spotify:album:3HJ4C0poaEMEg8u56sfr02'
    ],
    expectationCheckers: [
      checkTrack,
      checkUndefined,
      checkArtist,
      checkUndefined,
      checkAlbum
    ]
  },

  {
    name: 'Unfindable resource URIs',
    createOpts: undefined,
    opts: [
      'spotify:track:zTiCkACNmrC80bCJ3K2a4U',
      'spotify:track:zlOHeRgeA3oCyxxHl6sVsa'
    ],
    expectationCheckers: [
      checkUndefined,
      checkUndefined
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
      checkTrack,
      checkTrack,
      checkArtist,
      checkTrack,
      checkAlbum
    ]
  },

  // {
  //   name: 'Use access token',
  //   createOpts: {
  //     accessToken: config.accessToken
  //   },
  //   opts: [
  //     'spotify:track:6TiCkACNmrC80bCJ3K2a4U',
  //     'spotify:track:3lOHeRgeA3oCyxxHl6sVsa',
  //     'spotify:artist:099tLNCZZvtjC7myKD0mFp',
  //     'spotify:track:41uWkGOCpz0CA5vJ1nIKI6',
  //     'spotify:album:3HJ4C0poaEMEg8u56sfr02'
  //   ],
  //   expectationCheckers: [
  //     checkTrack,
  //     checkTrack,
  //     checkArtist,
  //     checkTrack,
  //     checkAlbum
  //   ]    
  // },

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

function checkAlbum(t, album) {
  t.equal(typeof album.name, 'string', 'album has a name.');
  t.equal(typeof album.album_type, 'string', 'Album has an album_type.');
  t.ok(Array.isArray(album.artists), 'Album has artists.');
  t.equal(typeof album.external_ids, 'object', 'Album has external_ids.');
  // TODO: Jillions of other properties.
}

function checkArtist(t, artist) {
  t.equal(typeof artist.name, 'string', 'artist has a name.');
  t.equal(typeof artist.href, 'string', 'artist has an href.');
  t.equal(typeof artist.external_urls, 'object', 'artist has external_urls.');
}

function checkTrack(t, track) {
  t.equal(typeof track.name, 'string', 'track has a name.');
  t.equal(typeof track.href, 'string', 'track has an href.');
  t.equal(typeof track.album, 'object', 'track has an album.');  
  t.ok(Array.isArray(track.artists), 'track has artists.');
}

function checkUndefined(t, thing) {
  t.equal(thing, undefined, 'Entry is undefined.');
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
