// all my homies hate node-fetch
import https from "https";
import {getToken} from "./auth.js";

export const fetch = (url, options={}) => {
    return new Promise(async (resolve) => {
        const resp = await download(url, options);
        if(!resp) return resolve(null);

        if(options.followRedirects && resp.statusCode > 300 && resp.statusCode < 400)
            return resolve(await fetch((new URL(resp.headers.location, url)).href, options));

        const res = {
            statusCode: resp.statusCode,
            headers: resp.headers
        };

        let chunks = [];
        resp.on('data', (chunk) => chunks.push(chunk));
        resp.on('end', () => {
            res.body = Buffer.concat(chunks).toString(options.encoding || "utf8");
            resolve(res);
        });

        resp.on('error', err => {
            console.error(`Response from ${url.substring(0, 100)} errored:`);
            console.error(err);
            resolve(null);
        });
    });
}

export const download = (url, options={}) => {
    return new Promise((resolve) => {
        const req = https.request(url, {
            method: options.method || "GET",
            headers: options.headers || {},
            timeout: options.timeout
        }, resolve);
        req.write(options.body || "");
        req.end();
        req.on('error', err => {
            console.error(`Request to ${url.substring(0, 100)} errored:`);
            console.error(err);
            resolve(null);
        });
        req.on('timeout', () => {
            console.error(`Request to ${url.substring(0, 100)} timed out`);
            req.destroy();
        });
    });
}

export const doRequest = async (url, params={}, options={}) => {
    const token = options.token || getToken();
    if(!token && !options.noAuth) throw new Error("I don't have a token to use! Did you call fetchToken()?");

    url = new URL(url, "https://api.music.apple.com");

    for(const [key, value] of Object.entries({...params, ...options.params}))
        url.searchParams.set(key, `${value}`);

    return await fetch(url, {
        headers: {
            "Authorization": `Bearer ${token}`,
            origin: "https://music.apple.com",
            ...options.headers
        },
        ...options.fetchOptions
    });
}

export const formatArtworkUrl = ({url, width, height}, options={}) => {
    width = options.width || options.size || width;
    height = options.height || options.size || height;

    if(options.format) { // can be jpg, png, webp, gif, tiff, bmp, eps
        const lastPeriod = url.lastIndexOf('.');
        url = url.substring(0, lastPeriod + 1) + options.format;
    }

    return url.replace("{w}", width).replace("{h}", height);
}
