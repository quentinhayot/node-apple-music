import {fetch} from "./util.js";

let token;
export const getToken = () => token;

export const setToken = (jwt) => {
    const decoded = decodeToken(jwt);
    if(!decoded) throw Error("Invalid apple music token!");

    const expiresAt = new Date(decoded.exp * 1000);
    if(expiresAt < new Date()) throw Error("Apple music token already expired!");

    token = jwt;
}

export const fetchToken = async () => {
    // fetch apple music homepage
    const req = await fetch("https://music.apple.com/", {
        followRedirects: true
    });

    // find config json
    const configSearch = req.body.match(/<meta name="desktop-music-app\/config\/environment" content="(.*)">/);
    if(!configSearch) throw Error("Could not find apple music config in website HTML!");

    // extract token
    const config = JSON.parse(decodeURIComponent(configSearch[1]));
    token = config.MEDIA_API.token;
    return token;
}

const decodeToken = (jwt) => {
    try {
        if(!jwt) return null;

        const splits = jwt.split(".");
        if(splits.length !== 3) return null;

        const payload = Buffer.from(splits[1], "base64").toString("utf8");
        return JSON.parse(payload);
    } catch(e) {
        return null;
    }
}

