import { startServer, getStatus, resumeServer } from "./gamocosmWrapper.js";
import mc from "minecraft-protocol";
import proxyTCP from "node-tcp-proxy";

function getServerStatus(serverData) {
    return new Promise((resolve, reject) => {
        getStatus(serverData.id, serverData.key).then(result => {
            if (result.server && result.minecraft && result.ip && result.status == null)
                result.status = "up";
            else if (result.server && !result.minecraft && result.ip && result.status == null)
                result.status = "paused";
            else if (!result.server && result.status == null && !result.minecraft && result.ip == null)
                result.status = "down";
            else if (!result.server && !result.minecraft && result.ip != null && result.status == null)
                result.status = "broken";
            resolve(result);
        });
    });
}

function checkUntilServerIsUp(serverData, mcServer) {
    const loopUntilServerIsUp = setInterval(() => {
        getServerStatus(serverData)
            .then(result => {
                switch (result.status) {
                    case "up":
                        mcServer.close();
                        mcServer.on('close', () => {
                            setTimeout(() => {
                                const proxyToNewDO = proxyTCP.createProxy(serverData.port, result.ip, 25565);
                                checkUntilServerIsDown(serverData, proxyToNewDO);
                            }, 5000);
                            clearInterval(loopUntilServerIsUp);
                        });
                        break;
                    case "paused":
                        resumeServer(serverData.id, serverData.key);
                        break;
                }
            });
    }, 5000);
}

function checkUntilServerIsDown(serverData, proxyToNewDO) {
    const loopUntilServerIsDown = setInterval(() => {
        getServerStatus(serverData)
            .then(result => {
                if (result.status == "down") {
                    if (proxyToNewDO)
                        proxyToNewDO.end();
                    clearInterval(loopUntilServerIsDown);
                    setTimeout(() => {
                        launchSkeletonServer(serverData);
                    }, 5000);
                }
            });
    }, 5000);
}

function launchSkeletonServer(serverData) {
    const mcServer = mc.createServer({
        "online-mode": serverData.onlinemode,
        encryption: serverData.onlinemode,
        host: "0.0.0.0",
        port: serverData.port,
        beforePing: function (res, client) {
            res.version.name = "The server is offline!";
            res.version.protocol = 0;
            res.description.text = "§cThe Minecraft server " + serverData.name
                + " is offline!\n§6If you want to launch it please join it.";
        },
        maxPlayers: 0
    });

    mcServer.on("login", function (client) {
        let isServerNeededToStart = true;
        getServerStatus(serverData)
            .then(result => {
                switch (result.status) {
                    case "down":
                        if (isServerNeededToStart) {
                            isServerNeededToStart = false;
                            console.log("starting the server " + serverData.name + " because someone joined it!");
                            startServer(serverData.id, serverData.key);
                            checkUntilServerIsUp(serverData, mcServer);
                        }
                        break;
                    case "paused":
                        resumeServer(serverData.id, serverData.key);
                        checkUntilServerIsUp(serverData, mcServer);
                        break;
                }
            });
        const reasonKick = {
            text: "Hello §b" + client.username + "§r!\n§cThe Minecraft server "
                + serverData.name + " is not ready yet!\n§rPlease come back in less than 3 minutes."
        };
        client.write("kick_disconnect", { reason: JSON.stringify(reasonKick) });
    });
}

export default function (serverData) {
    getServerStatus(serverData)
        .then(result => {
            switch (result.status) {
                case "up":
                    const proxyToNewDO = proxyTCP.createProxy(serverData.port, result.ip, 25565);
                    checkUntilServerIsDown(serverData, proxyToNewDO);
                    break;
                case "starting":
                case "preparing":
                case "broken":
                case "down":
                    launchSkeletonServer(serverData);
                    break;
                case "paused":
                    resumeServer(serverData.id, serverData.key);
                    launchSkeletonServer(serverData);
                    break;
                case "saving":
                    checkUntilServerIsDown(serverData);
                    break;
            }
        });
}