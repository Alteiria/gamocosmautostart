import loadTOMLConfig from "./libs/loadTOMLConfig.js";
import launchSkeletonServer from "./libs/skeletonServer.js";

const configFile = loadTOMLConfig("./config.toml");

Object.keys(configFile.servers).forEach(serverName => {
    console.log("Loading the server " + serverName);
    const serverData = configFile.servers[serverName];
    launchSkeletonServer(serverData);
});