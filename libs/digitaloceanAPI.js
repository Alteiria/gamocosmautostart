import got from "got";

const instance = got.extend({
    prefixUrl: 'https://api.digitalocean.com/v2',
    responseType: 'json',
    resolveBodyOnly: true
});

export async function getSnapshots(token) {
    return(await instance("snapshots", {
        headers: {
            Authorization: "Bearer " + token
        }
    }));
}

export async function deleteSnapshot(token, snapshotID) {
    return(await instance("snapshots/" + snapshotID, {
        method: "DELETE",
        headers: {
            Authorization: "Bearer " + token
        }
    }));
}