import loadTOMLConfig from "./libs/loadTOMLConfig.js";
import launchSkeletonServer from "./libs/skeletonServer.js";
import { getStatus, stopServer } from "./libs/gamocosmWrapper.js";
import launchGCSnapshot from "./libs/gamocosmGCSnapshot.js"

const configFile = loadTOMLConfig("./config.toml");

Object.keys(configFile.servers).forEach(serverName => {
    const serverData = configFile.servers[serverName];
    launchSkeletonServer(serverData);
    setInterval(() => { // checkIfServerBrokenState
        getStatus(serverData.id, serverData.key).then(result => {
            if (!result.server && !result.minecraft && result.ip != null && result.status == null) {
                stopServer(serverData.id, serverData.key);
                setTimeout(() => {
                    launchGCSnapshot(configFile.secrets.digitaloceanAPIKey, configFile.secrets.gamocosmUsername,
                        configFile.secrets.gamocosmPassword, serverName, serverData.id);
                }, 1000*60*10);
            }
        });
    }, 5000);
});