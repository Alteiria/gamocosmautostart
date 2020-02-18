# [Gamocosm](https://gamocosm.com/) Auto Start ![GitHub stars](https://img.shields.io/github/stars/Alteiria/gamocosmautostart.svg?style=social) [![Docker Cloud Build Status](https://img.shields.io/docker/cloud/build/alteiria/gamocosmautostart.svg)](https://hub.docker.com/r/alteiria/gamocosmautostart) [![Docker Cloud Automated build](https://img.shields.io/docker/cloud/automated/alteiria/gamocosmautostart.svg)](https://hub.docker.com/r/alteiria/gamocosmautostart) ![GitHub package.json version](https://img.shields.io/github/package-json/v/alteiria/gamocosmautostart.svg)
## Description
This project starts a fake Minecraft server that wait for a player to join it then communicate with the Gamocosm API to start the real server and finally redirect the requests to the real server automatically.

## Alteiria is looking for Java developers
Alteiria is a MMORPG server that breaks Minecraft’s boundaries to offer its players innovative and captivating content, without launcher. You may visit our website to learn more about us: https://alteiria.fr/index.en.html.

We are seeking for Java developers, if you are interested into joining the project please consider applying here: https://goo.gl/forms/MSVczguQJkso05T83.

Internally we use GamocosmAutoStart to manage some of our servers :smiley:.

## How to setup the program
1. Copy the file `template.config.toml` to `config.toml`
2. Register on Gamocosm: https://gamocosm.com/users/sign_up
3. Create a new server. (use a simple name without spaces)
4. In the file `config.toml` rename `example` in `[servers.example]` and `name = "example"` to the server name that you used when creating your server on Gamocosm.
5. Head over the "Advanced" tab of Gamocosm's interface.
6. Copy the `API key` then paste it in the `config.toml` file for the `key` field under `[servers.yourServerName]`.
7. In the address URL bar of the Gamocosm interface copy everything **after** `https://gamocosm.com/servers/` then paste it in the `config.toml` file for the `id` field under `[servers.yourServerName]`.
8. You may change the port in the `config.toml` file (optional).
9. Enter the DigitalOcean API key that you used when registering on Gamocosm in the `digitaloceanAPIKey` field in the `config.toml` file.
10. Enter your username and password for the Gamocosm website in the `gamocosmUsername` and `gamocosmPassword` fields in the `config.toml` file. This part is necessary while this bug exists: https://github.com/Gamocosm/Gamocosm/issues/113