function parseSpotifyUriToObject(uri) {
  var uriObject = {};
  var parts = uri.split(':');
  if (parts.length > 2) {
    parts = parts.slice(1); // Drop initial 'spotify' in URI.
    if (parts.length % 2 === 0) {
      for (var i = 0; i < parts.length; i += 2) {
        uriObject.type = parts[i];
        uriObject.id = parts[i + 1];
      }
    }
    return uriObject;
  }
}

module.exports = parseSpotifyUriToObject;
