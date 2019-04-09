# jsent-bot

A simple discord.js bot that issues a message in given channels when a new grade is available on my engineer school intranet (though it should work elsewhere with minor modifications to the code).


## Running your own instance

* Install a recent version (>6.0.0) of node.js and npm on the server.
* Clone this repository on any folder of the server.
* Customise the `config.json.template` file according to your needs and rename it `config.json`.
* Install the dependencies: `npm install`.
* Run the bot: `node server.js`

## Configuring it as a systemd service

Here is a template of a systemd service for jsent-bot.
It should be placed in `/etc/systemd/system/jsent-bot.service`.

```INI
[Unit]
Description=jsent-bot
After=network.target

[Service]
Type=simple
User=jsent-bot # it's better to setup a dedicated user to run the app
WorkingDirectory=/opt/jsent-bot/ # the working directory is the one in which the repo was cloned
ExecStart=/usr/bin/node /opt/jsent-bot/server.js # update the path to server.js according to your setup
Restart=always
KillSignal=SIGINT # important! allows the bot to stop gracefully when you stop it via the systemd command

[Install]
WantedBy=multi-user.target
```

After you copied the file to the systemd folder, make sure to reload the systemd daemon (`sudo systemd daemon-reload`) and then you'll be able to use the service.

## Disclaimer

The quality of code may seem terrible if you are used to node.js but that's my first project. I'm open to any kind of suggestions, specific remarks or rants about this project in the issues section. Feel free to contribute !
