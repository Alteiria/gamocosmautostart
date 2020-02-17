import { startServer, getStatus, resumeServer } from "./gamocosmWrapper.js";
import mc from "minecraft-protocol";
import proxyTCP from "node-tcp-proxy";
import launchSkeletonServer from "./skeletonServer.js";

function checkIfServerUp(serverData, mcServer) {
    getStatus(serverData.id, serverData.key).then(result => {
        console.log(result);
        if (result.server && result.minecraft && result.ip && result.status == null) {
            mcServer.close();
            const proxyToNewDO = proxyTCP.createProxy(serverData.port, result.ip, 25565);
            checkUntilServerDown(serverData, proxyToNewDO);
        }
        else if (result.server && !result.minecraft && result.ip && result.status == null) {
            resumeServer(serverData.id, serverData.key);
            checkUntilServerUp(serverData, mcServer);
        }
    });
}

function checkUntilServerUp(serverData, mcServer) {
    const checkIfServerUp = setInterval(() => {
        getStatus(serverData.id, serverData.key).then(result => {
            if (result.server && result.minecraft && result.ip && result.status == null) {
                mcServer.close();
                const proxyToNewDO = proxyTCP.createProxy(serverData.port, result.ip, 25565);
                checkUntilServerDown(serverData, proxyToNewDO);
                clearInterval(checkIfServerUp);
            }
            else if (result.server && !result.minecraft && result.ip && result.status == null) {
                resumeServer(serverData.id, serverData.key);
            }
        });
    }, 5000);
}

function checkUntilServerDown(serverData, proxyToNewDO) {
    const checkIfServerDown = setInterval(() => {
        getStatus(serverData.id, serverData.key).then(result => {
            console.log(result);
            if (!result.server && !result.minecraft && result.ip == null && result.status == null) {
                proxyToNewDO.end();
                clearInterval(checkIfServerDown);
                launchSkeletonServer(serverData);
            }
        });
    }, 5000);
}

export default function (serverData) {

    const mcServer = mc.createServer({
        "online-mode": true,
        encryption: true,
        host: "0.0.0.0",
        port: serverData.port,
        beforePing: function (res, client) {
            res.version.name = "The server is offline!";
            res.version.protocol = 0;
            res.description.text = "§cThe Minecraft server " + serverData.name + " is offline!\n§6If you want to launch it please join it.";
        },
        maxPlayers: 0
    });

    checkIfServerUp(serverData, mcServer);

    mcServer.on("login", function (client) {
        console.log("someone joined");

        getStatus(serverData.id, serverData.key).then(result => {
            console.log(result);
            if (!result.server && !result.minecraft && result.ip == null && result.status == null) {
                console.log("starting the server!");
                startServer(serverData.id, serverData.key);
                checkUntilServerUp(serverData, mcServer);
            }
            const reasonKick = {
                text: "Hello §b" + client.username + "§r!\n§cThe Minecraft server " + serverData.name + " is not ready yet!\n§rPlease come back in a few seconds..."
            };
            client.write("kick_disconnect", { reason: JSON.stringify(reasonKick) });
        });
    });
}