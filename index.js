var splitArray = require('split-array');
var queue = require('d3-queue').queue;
var parseSpotifyUriToObject = require('./parse-spotify-uri-to-object');
var callNextTick = require('call-next-tick');
var pluck = require('lodash.pluck');

var apiInfoForTypes = {
  track: {
    endpoint: 'https://api.spotify.com/v1/tracks',
    relevantResultProperty: 'tracks',
    limit: 50
  },
  artist: {
    endpoint: 'https://api.spotify.com/v1/artists',
    relevantResultProperty: 'artists',
    limit: 50
  },
  album: {
    endpoint: 'https://api.spotify.com/v1/albums',
    relevantResultProperty: 'albums',
    limit: 20
  },
  playlist: {
    isPlaylist: true,
    limit: 1
  }
};

function SpotifyResolve(createOpts) {
  var request;
  var bearerToken;

  if (createOpts) {
    request = createOpts.request;
    bearerToken = createOpts.bearerToken;
  }

  return spotifyResolve;

  function spotifyResolve(opts, done) {
    var uris;
    var parsedURIsByType = {
      track: [],
      artist: [],
      album: [],
      playlist: []
    };

    if (Array.isArray(opts)) {
      uris = opts;
    }
    else if (opts) {
      uris = [opts];
    }
    else {
      callNextTick(done);
      return;
    }

    uris.forEach(sortParsedURIByType);

    var q = queue();

    for (var type in parsedURIsByType) {
      if (parsedURIsByType[type].length > 0) {
        if (type === 'playlist') {
          parsedURIsByType[type].forEach(queueResolvePlaylist);
        }
        else {
          q.defer(resolveIds, type, pluck(parsedURIsByType[type], 'id'));
        }
      }
    }

    q.awaitAll(arrangeResultsInOrder);

    function queueResolvePlaylist(parsedURI) {
      q.defer(resolvePlaylist, parsedURI);
    }

    function resolveIds(type, ids, done) {
      var apiInfo = apiInfoForTypes[type];
      var idGroups = splitArray(ids, apiInfo.limit);
      var resolveQueue = queue(5);
      idGroups.forEach(queueResolveBatch);
      resolveQueue.awaitAll(done);

      function queueResolveBatch(ids) {
        resolveQueue.defer(resolveBatch, apiInfo, ids);
      }
    }

    function sortParsedURIByType(uri) {
      var uriObject = parseSpotifyUriToObject(uri);
      if (uriObject.type in parsedURIsByType) {
        parsedURIsByType[uriObject.type].push(uriObject);
      }
    }

    function arrangeResultsInOrder(error, resultGroupsForTypes) {
      var objectsByURI = {};

      if (error) {
        done(error);
      }
      else if (!resultGroupsForTypes) {
        done(error, []);
      }
      else {
        resultGroupsForTypes.forEach(storeResultGroups);
        var finalResults = uris.map(getResolvedObjectForURI);

        if (!Array.isArray(opts)) {
          if (finalResults.length > 0) {
            finalResults = finalResults[0];
          }
          else {
            finalResults = undefined;
          }
        }
        done(error, finalResults);
      }

      function storeResultGroups(resultGroups) {
        if (resultGroups) {
          resultGroups.forEach(storeResults);
        }
      }

      function storeResults(results) {
        if (results) {
          results.forEach(storeResult);
        }
      }

      function storeResult(result) {
        if (result && result.uri) {
          objectsByURI[result.uri] = result;
        }
      }

      function getResolvedObjectForURI(uri) {
        return objectsByURI[uri];
      }
    }
  }

  function resolveBatch(apiInfo, ids, done) {
    var reqOpts = {
      method: 'GET',
      url: apiInfo.endpoint + '?ids=' + ids.join(','),
      json: true
    };

    if (bearerToken) {
      reqOpts.headers = {
        Authorization: 'Bearer ' + bearerToken
      };
    }

    request(reqOpts, passResults);

    function passResults(error, response, results) {
      if (error) {
        done(error);
      }
      else if (response.statusCode === 401) {
        var unauthorizedError = new Error('Authorization Error: received status code ' + response.statusCode);
        unauthorizedError.name = response.statusCode;
        done(unauthorizedError, response);
      }
      else {
        done(error, results[apiInfo.relevantResultProperty]);
      }
    }
  }

  function resolvePlaylist(uriObject, done) {
    var reqOpts = {
      method: 'GET',
      url: 'https://api.spotify.com/v1/users/' + uriObject.user + '/playlists/' + uriObject.id,
      json: true
    };

    if (bearerToken) {
      reqOpts.headers = {
        Authorization: 'Bearer ' + bearerToken
      };
    }

    request(reqOpts, passResults);

    function passResults(error, response, playlistObject) {
      if (error) {
        done(error);
      }
      else {
        // storeResultGroups expects arrays of arrays.
        done(error, [[playlistObject]]);
      }
    }
  }

}

module.exports = SpotifyResolve;
