import {doRequest} from "./util.js";

export const fetchBulkMetadata = async (ids={}, options={}) => {
    let params = {};

    for(const key of ["activities", "albums", "apple-curators", "artists", "curators", "music-videos", "playlists", "songs", "stations", "record-labels"]) {
        if(!ids[key]) continue;
        if(!Array.isArray(ids[key])) ids[key] = [ids[key]];
        params[`ids[${key}]`] = ids[key].join(",");
    }

    // if the last parameter is ids, apple servers ignore it for some reason
    params = {
        ...params,
        platform: options.platform || "web",
        l: options.lang || "en-us",
        ...options.params
    };

    const req = await doRequest(`/v1/catalog/${options.countryCode || "us"}/`, params, options);

    if(!req.body) return null;
    if(options.returnReq) return req;

    const json = JSON.parse(req.body);
    if(options.returnJson) return json;

    return json.data || json;
}

export const fetchMetadata = async (type, id, options={}) => {
    const params = {
        l: options.lang || "en-US",
        ...options.params
    }

    const req = await doRequest(`/v1/catalog/${options.countryCode || "us"}/${type}/${id}`, params, options);

    if(!req.body) return null;
    if(options.returnReq) return req;

    const json = JSON.parse(req.body);
    if(options.returnJson) return json;

    return json.data ? json.data[0] : json;
}

export const fetchSong = async (id, options={}) => {
    const include = [];
    if(options.fetchArtists !== false) include.push("artists");
    if(options.fetchAlbum !== false) include.push("albums");

    options.params = {
        "include": include.join(","),
        ...options.params
    }

    return await fetchMetadata("songs", id, options);
}

export const fetchAlbum = async (id, options={}) => {
    const include = [];
    if(options.fetchArtists !== false) include.push("artists");

    options.params = {
        "include": include.join(","),
        ...options.params
    }

    return await fetchMetadata("albums", id, options);
}

export const fetchArtist = async (id, options={}) => await fetchMetadata("artists", id, options);
export const fetchPlaylist = async (id, options={}) => await fetchMetadata("playlists", id, options);
