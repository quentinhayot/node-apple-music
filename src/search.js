import {doRequest} from "./util.js";

export const search = async (term, options={}) => {
    const params = {
        term: term,
        types: options.types || "songs,albums,artists,playlists",
        limit: options.limit || 25,
        l: options.lang || "en-us"
    };

    if(options.includeTop !== false) params["with"] = "serverBubbles"; // include top results

    const req = await doRequest(`/v1/catalog/${options.countryCode || "us"}/search`, params, options);

    if(!req.body) return null;
    if(options.returnReq) return req;

    const json = JSON.parse(req.body);
    if(options.returnJson) return json;

    if(!json.results) return json;
    const results = {};
    for(const [type, data] of Object.entries(json.results))
        results[type] = data.data;
    return results;
}

export const suggestions = async (term, options={}) => {
    const params = {
        term: term,
        types: options.types || "songs,albums,artists",
        kinds: options.kinds || "terms,topResults",
        limit: options.limit || 10,
        l: options.lang || "en-us"
    };

    const req = await doRequest(`/v1/catalog/${options.countryCode || "us"}/search/suggestions`, params, options);

    if(!req.body) return null;
    if(options.returnReq) return req;

    const json = JSON.parse(req.body);
    if(options.returnJson) return json;

    return json.results?.suggestions || json;
}
