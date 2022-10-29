import {fetch} from "./util.js";
import {search} from "./search.js";

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
    // fetch token from top secret gist
    const res = await fetch("https://gist.githubusercontent.com/giorgi-o/bf8cf3261914c48bb46b4a50a1966434/raw");
    token = res.body.split('\n', 1)[0];

    // test token
    const testReq = await search("damn kendrick lamar", {limit: 1, types: "albums", includeTop: true});
    if(!testReq) throw Error("Apple music anonymous token is invalid! Please create a GitHub issue at giorgi-o/node-apple-music.");
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

