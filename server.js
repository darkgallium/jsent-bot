/*
 * jsent-bot, a Discord bot that alert people when new grades are online on the school intranet.
 *
 * Copyright (C) 2019, darkgallium
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

const process = require('process');
const config = require('./config.json');
const logger = require('./log.js');
const ENT = require('./ent.js');

const Discord = require('discord.js');
const client = new Discord.Client();

function crawl() {

	let e = new ENT.ENT(config.credentials.login, config.credentials.password);
	let d = new Date();

	if (!config.scheduler || (d.getHours() >= config.scheduler.startHour && d.getHours() < config.scheduler.endHour)) {

		e.crawl((diff) => {

			if (diff.length > 1) {
				logger.log.info(`${diff.length} new results are available!`);

				let resultsString = "";
				for (const item of diff) {
					resultsString += `Une nouvelle note de **${item.name} (${item.type})** est disponible sur l\'ENT.\n`;
				}

				for (const channel of config.announcement_channels) {
					client.channels.get(channel).send(`@everyone ${resultsString}Consultez-les au lien suivant : ${config.results_url}`);
				}

			}

			if (diff.length == 1) {
				logger.log.info(`A new result is available!`);

				for (const channel of config.announcement_channels) {
					client.channels.get(channel).send(`@everyone Une nouvelle note de **${diff[0].name} (${diff[0].type})** est disponible sur l\'ENT.\nConsultez-là au lien suivant : ${config.results_url}`);
				}

			}

			else {
				logger.log.info("Nothing changed.");
			}

		});

	}

}

client.on('ready', () => {
	logger.log.info(`Logged in as ${client.user.tag}!`);

	if (config.presence) {
		if (config.presence.activity) { client.user.setActivity(config.presence.activity); }
		if (config.presence.status) { client.user.setStatus(config.presence.status); }
	}

	setInterval(() => {
		crawl();
	}, config.crawl_interval);

});

// This is used to gracefully exit the server when SIGINT is emitted, e.g when your systemd service stops.

process.on('SIGINT', function() {
	client.destroy();
	process.exit(0);
});

client.login(config.token);
