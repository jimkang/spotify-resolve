var test = require('tape');
var assertNoError = require('assert-no-error');
var SpotifyResolve = require('../index');
var checkers = require('./checkers');
var defaultRequest = require('request');
var getClientCredentials = require('get-spotify-client-credentials');
var config = require('./config');

var testCases = [
  {
    name: 'Use bearer token',
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
    name: 'Get playlists',
    opts: [
      'spotify:playlist:2rt3nNo9JVSWeH4IeMILrh',
      'spotify:playlist:6PeY74K2tQ78rZTtn0BLBF'
    ],
    expectationCheckers: [checkers.checkPlaylist, checkers.checkPlaylist]
  }
];

testCases.forEach(runTest);

function runTest(testCase) {
  test(testCase.name, basicTest);

  function basicTest(t) {
    getClientCredentials(
      {
        clientId: config.clientId,
        clientSecret: config.clientSecret,
        request: defaultRequest
      },
      useCreds
    );

    function useCreds(error, token) {
      assertNoError(t.ok, error, 'No error while getting credentials.');

      var spResolve = SpotifyResolve({
        request: defaultRequest,
        bearerToken: token
      });
      spResolve(testCase.opts, checkResult);

      function checkResult(error, result) {
        assertNoError(t.ok, error, 'No error while calling spotifyResolve.');
        // console.log(JSON.stringify(result, null, '  '));
        if (Array.isArray(testCase.expectationCheckers)) {
          for (var i = 0; i < testCase.expectationCheckers.length; ++i) {
            testCase.expectationCheckers[i](t, result[i]);
          }
        } else {
          testCase.expectationCheckers(t, result);
        }
        t.end();
      }
    }
  }
}
