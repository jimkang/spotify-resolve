function parseSpotifyUriToObject(uri) {
  var uriObject = {};
  var parts = uri.split(':');
  if (parts.length > 2) {
    parts = parts.slice(1); // Drop initial 'spotify' in URI.
    if (parts.length > 1) {
      uriObject.type = parts[parts.length - 2];
      uriObject.id = parts[parts.length - 1];

      if (parts.length > 3 && parts[0] === 'user') {
        uriObject.user = parts[1];
      }
    }
    return uriObject;
  }
}

module.exports = parseSpotifyUriToObject;
