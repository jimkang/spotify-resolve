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

module.exports = {
  checkAlbum: checkAlbum,
  checkArtist: checkArtist,
  checkTrack: checkTrack,
  checkUndefined: checkUndefined
};
