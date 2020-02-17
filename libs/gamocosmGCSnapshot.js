import got from "got";
import CookieJar from "tough-cookie";
import cheerio from "cheerio";
import { getSnapshots, deleteSnapshot } from "./digitaloceanAPI.js";

const cookieJar = new CookieJar.CookieJar();

const instance = got.extend({
    prefixUrl: "https://gamocosm.com",
    resolveBodyOnly: true,
    cookieJar
});

const login = function (username, password) {
    return new Promise((resolve, reject) => {
        instance("users/sign_in").then(body => {
            const loadHTMLBody = cheerio.load(body);
            const authenticity_token = loadHTMLBody("#new_user > input:nth-child(2)").val();
            instance.post("users/sign_in", {
                form: {
                    "utf8": "✓",
                    "authenticity_token": authenticity_token,
                    "user[email]": username,
                    "user[password]": password,
                    "user[remember_me]": 0,
                    "commit": "Sign+in"
                },
                followRedirect: false
            }).then(() => {
                resolve();
            });
        });
    });
};

function getSnapshotSavedID(username, password, serverID) {
    return new Promise((resolve, reject) => {
        login(username, password).then(() => {
            instance("servers/" + serverID).then((body) => {
                const loadHTMLBody = cheerio.load(body);
                const savedSnapshotID = loadHTMLBody("#server_remote_snapshot_id").val();
                if (savedSnapshotID.length === 8) {
                    resolve(savedSnapshotID);
                }
                else {
                    throw("The saved snapshot ID is not the correct size. Abording...")
                }
            });
        });
    });
}

export default function(digitaloceanAPIToken, gamocosmUsername, gamocosmPassword, gamocosmServerName, gamocosmServerID) {
    getSnapshots(digitaloceanAPIToken).then(result => {
        const snapshotList = result.snapshots;
        try {
            getSnapshotSavedID(gamocosmUsername, gamocosmPassword, gamocosmServerID)
            .then(savedSnapshotID => {
                const snapshotListFiltered = snapshotList
                    .filter(snapshot => snapshot.name.includes(gamocosmServerName))
                    .filter(snapshot => snapshot.id != savedSnapshotID);
                if (snapshotListFiltered.length > 0 && snapshotList > 1) {
                    snapshotListFiltered.forEach(snapshot => {
                        deleteSnapshot(digitaloceanAPIToken, snapshot.id);
                    });
                }
            });
        } catch (error) {
            console.log(error);
        }
    });
}