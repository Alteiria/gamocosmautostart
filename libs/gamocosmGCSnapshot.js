import got from "got";
import CookieJar from "tough-cookie";
import cheerio from "cheerio";
import { getSnapshots, deleteSnapshot } from "./digitaloceanAPI.js";

const login = function (username, password) {
    return new Promise((resolve, reject) => {
        const cookieJar = new CookieJar.CookieJar();

        const instance = got.extend({
            prefixUrl: "https://gamocosm.com",
            resolveBodyOnly: true,
            cookieJar
        });

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
                resolve(instance);
            });
        });
    });
};

function getSnapshotSavedID(username, password, serverID) {
    return new Promise((resolve, reject) => {
        login(username, password).then((instance) => {
            instance("servers/" + serverID).then((body) => {
                const loadHTMLBody = cheerio.load(body);
                const savedSnapshotID = loadHTMLBody("#server_remote_snapshot_id").val();
                if (savedSnapshotID.length === 8) {
                    resolve(savedSnapshotID);
                }
                else {
                    throw ("The saved snapshot ID is not the correct size. Abording...")
                }
            });
        });
    });
}

export default function (digitaloceanAPIToken, gamocosmUsername, gamocosmPassword, gamocosmServerName, gamocosmServerID) {
    getSnapshots(digitaloceanAPIToken).then(result => {
        let snapshotList = result.snapshots;
        try {
            getSnapshotSavedID(gamocosmUsername, gamocosmPassword, gamocosmServerID)
                .then(savedSnapshotID => {
                    snapshotList = snapshotList
                        .filter(snapshot => snapshot.name.includes(gamocosmServerName));
                    if (snapshotList.length > 1) {
                        snapshotList = snapshotList
                            .filter(snapshot => snapshot.id != savedSnapshotID);
                        snapshotList.forEach(snapshot => {
                            deleteSnapshot(digitaloceanAPIToken, snapshot.id);
                        });
                    }
                });
        } catch (error) {
            console.log(error);
        }
    });
}