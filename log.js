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
const winston = require('winston');

let file_opts = { filename: config.log_file };

if (config.log_maxsize) {
  file_opts["maxsize"] = config.log_maxsize;
}

const log = winston.createLogger({
  level: config.log_level,
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.File(file_opts)
  ]
});

exports.log = log;
