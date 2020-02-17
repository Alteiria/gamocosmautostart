import got from "got";

const instance = got.extend({
    prefixUrl: 'https://gamocosm.com/servers/',
    responseType: 'json',
    resolveBodyOnly: true
});

export async function getStatus(serverId, apiKey) {
    return(await instance(serverId + "/api/" + apiKey + "/status"));
}

export async function startServer(serverId, apiKey) {
    return(await instance.post(serverId + "/api/" + apiKey + "/start"));
}

export async function stopServer(serverId, apiKey) {
    return(await instance.post(serverId + "/api/" + apiKey + "/stop"));
}

export async function resumeServer(serverId, apiKey) {
    return(await instance.post(serverId + "/api/" + apiKey + "/resume"));
}