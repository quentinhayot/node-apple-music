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
        l: options.lang || "en-us"
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
    }

    return await fetchMetadata("songs", id, options);
}

export const fetchAlbum = async (id, options={}) => {
    const include = [];
    if(options.fetchArtists !== false) include.push("artists");

    options.params = {
        l: options.lang || "en-US",
        "include": include.join(","),
    }

    return await fetchMetadata("albums", id, options);
}

export const fetchArtist = async (id, options={}) => await fetchMetadata("artists", id, options);
export const fetchPlaylist = async (id, options={}) => await fetchMetadata("playlists", id, options);

export const fetchIsrc = async (isrc, options={}) => {
    const params = {
        l: options.lang || "en-US",
        "filter[isrc]": Array.isArray(isrc) ? isrc.join(",") : isrc,
    }

    const req = await doRequest(`/v1/catalog/${options.countryCode || "us"}/songs`, params, options);

    if(!req.body) return null;
    if(options.returnReq) return req;

    const json = JSON.parse(req.body);
    if(options.returnJson) return json;

    if(!json.data) return json;
    if(Array.isArray(isrc)) return json.data;
    return json.data[0];
}

export const fetchUpc = async (upc, options={}) => {
    const params = {
        l: options.lang || "en-US",
        "filter[upc]": Array.isArray(upc) ? upc.join(",") : upc,
    }

    const req = await doRequest(`/v1/catalog/${options.countryCode || "us"}/albums`, params, options);

    if(!req.body) return null;
    if(options.returnReq) return req;

    const json = JSON.parse(req.body);
    if(options.returnJson) return json;

    if(!json.data) return json;
    if(Array.isArray(upc)) return json.data;
    return json.data[0];
}
