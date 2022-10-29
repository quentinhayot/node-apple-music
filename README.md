# node-apple-music

Simple, powerful and flexible library with no dependencies to search and fetch music data from Apple Music, no account needed.

## Installing

```
npm i node-apple-music
```

## Usage

### Authenticating

Before interacting with the library, you need to either fetch or provide an access token.

```js
// Fetch and remember an anonymous access token
const token = await fetchToken();

// Provide an access token
setToken(token);
```

You only need to call one or the other, and the library will use the token for all subsequent requests.

In theory you could also use an official Apple Music developer token, but I haven't tested this.


### Fetching by ID

```js
await fetchSong(576655098);

{
    id: "576655098",
    type: "songs",
    href: "/v1/catalog/us/songs/576655098?l=en-US",
    attributes: {
        name: "The Lazy Song",
        url: "https://music.apple.com/us/album/the-lazy-song/576654788?i=576655098",
        artistName: "Bruno Mars",
        albumName: "Doo-Wops & Hooligans",
        durationInMillis: 189110,
        releaseDate: "2010-10-04",
        artwork: {
            url: "https://is5-ssl.mzstatic.com/image/thumb/Music114/v4/52/b1/45/52b1452b-229e-78db-231b-7b43fa0077cc/075679956491.jpg/{w}x{h}bb.jpg",
            width: 1425,
            height: 1425,
            // ...
        },
        discNumber: 1,
        trackNumber: 5,
        isrc: "USAT21206919",
        genreNames: ["Pop", "Music"],
        // ...and more!
    },
    relationships: {
        albums: {
            href: "/v1/catalog/us/songs/576655098/albums?l=en-US",
            data: [{...}] // album object
        },
        artists: {
            href: "/v1/catalog/us/songs/576655098/artists?l=en-US",
            data: [{...}] // artist objects
        }
    }
}
```

Too see the complete list of available fields, check out the [Apple Music API docs](https://developer.apple.com/documentation/applemusicapi/songs/attributes).

`fetchAlbum()`, `fetchArtist()` and `fetchPlaylist()` work the same way.

These functions can also take a second `options` parameter, with the following attributes:
* `fetchArtists`: include additional artist data. For `fetchSong()` and `fetchAlbum()` only, defaults to `true`.
* `fetchAlbum`: include additional album data. For `fetchSong()` only, defaults to `true`.

To fetch data about other object types, such as music videos or record labels, use `fetchMetadata()`.

To fetch by ISRCs or UPCs, you can use `fetchIsrc()` and `fetchUpc()`.

To fetch additional data using an `href`, use `doRequest()`.

### Searching

```js
await search("the lazy song");

{
    top: [{...}, ...],
    song: [{...}, ...],
    album: [{...}, ...],
    artist: [{...}, ...],
    playlist: [{...}, ...]
}
```

You can also pass an `options` object as the second argument, with the following properties:
* `types`: a comma-separated list of types to search for, defaults to `"songs,albums,artists,playlists"`
* `limit`: how many of each type to fetch, defaults to `25`
* `includeTop`: fetch top results across all types, defaults to `true`

`suggestions()` can be used to fetch search suggestions:

```js
await suggestions("the lazy");

[
    {kind: "terms", searchTerm: "the lazy song"},
    {kind: "terms", searchTerm: "bruno mars the lazy song"},
    {kind: "terms", searchTerm: "the lazys"},
    {kind: "topResults", content: {...}}, // track object
    {kind: "topResults", content: {...}},
    // ...
]
```

### Additional info

Artwork URLs are not ready to use as-is, you need to pass the artwork object to `formatArtworkUrl()`:

```js
formatArtworkUrl(song.attributes.artwork);
formatArtworkUrl(song.attributes.artwork, {size: 1000, format: "webp"});
```

Most functions take an `options` parameter. In addition to function-specific options, here are the options that they all support:
* `countryCode`: country code to use. Defaults to `"us"`.
* `lang`: request language. Doesn't seem to change anything, use `countryCode` instead. Defaults to `"en-US"`.
* `noAuth`: Don't throw an error when trying to do a request without having an access token. Defaults to `false`.
* `returnReq`: return the raw request object, with the HTTP status code, headers and unparsed body.
* `returnJson`: return the unmodified JSON sent by Apple Music.
* `params`: dictionary of additional url-encoded parameters to include in the request
* `headers`: dictionnary of additional headers to include in the request


