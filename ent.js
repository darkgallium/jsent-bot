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

const config = require('./config.json');
const logger = require('./log.js');

const fs = require('fs');
let request = require('request');
let cheerio = require('cheerio');

request = request.defaults({jar: true, followAllRedirects: true});

class ENT {

	constructor(u, p) {
		this.username = u;
		this.password = p;
	}

	connect(callback) {
		let username = this.username;
		let password = this.password;

		request(config.entrypoint_url, function(error, response, html) {

			if (!error) {
				let $ = cheerio.load(html);
				let post_data = {};

				$('input').each(function (index, elt) {
					post_data[$(this).attr('name')] = $(this).val();
				});

				post_data["username"] = username;
				post_data["password"] = password;

				request.post( { url: config.entrypoint_url, form: post_data }, function(error, response, html) {
					if (!error) {

						if (response.statusCode < 400) {
							logger.log.debug("Successfully logged in");
							callback(true);
						}

						else {
							logger.log.error("Error while logging in", { "httpCode": response.statusCode, "error": error});
							callback(false);
						}
					}
				});
			}
		});
	}

	getResultsArray(callback) {
		this.connect(function(connected) {
			if (connected) {

				request(config.results_url, function(error, response, html) {
					if (!error) {
						let $ = cheerio.load(html);
						let grades = [];
						let c;

						$("#portlet-DossierAdmEtu-tab2 tr[style*=\"border-bottom: 0.1em solid #B6CBD6\"]").each(function (index, element) {
							let children = $(this).children();
							let desc = $(children[0]).text();
							let grade = $(children[1]).text();

							let desc_reg = /^\s*([A-Za-z0-9]{5}-[A-Za-z0-9-_]+)\s+-\s+(.*?)\s:\s([A-Z0-9]+)\s*$/;
							let grade_reg = /^\s*(\d+(,|.)\d+ \/ \d+)\s*$/;

							let m1 = desc.match(desc_reg);
							let m2 = grade.match(grade_reg);

							if (m1) {
								c = {
									"code": m1[1],
									"name": m1[2],
									"type": m1[3],
									"grade": null
								}

								if (m2) {
										c["grade"] = m2[1];
								}

								grades.push(c);
							}

						});

						callback(grades);
					}
				});

			}
		});
	}

	crawl(callback) {
		this.getResultsArray(function(curr_grades) {
			let diff = [];

			if (curr_grades) {

				if (fs.existsSync(config.results_file)) {
					let prev_grades_str = fs.readFileSync(config.results_file, "utf-8");
					let prev_grades = JSON.parse(prev_grades_str);


					for (const item_c of curr_grades) {

						let diff_grade = prev_grades.find((item_p) => {
							return item_c.code == item_p.code && item_c.type == item_p.type && item_p.grade == null && item_c.grade != null;
						});

						if (diff_grade) {
							diff.push(diff_grade);
						}

					}

					if (diff.length > 0) {
						logger.log.debug("Diff length is > 0", { diff: diff })
					}

				}

				let curr_grades_str = JSON.stringify(curr_grades);
				fs.writeFileSync(config.results_file, curr_grades_str, "utf-8");

			}

			callback(diff);

		});
	}

}

exports.ENT = ENT
