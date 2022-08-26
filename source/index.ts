import dotenv from "dotenv";
dotenv.config();

import Logger from "./logger";
global.log = new Logger();

import Broadcaster from "./services/broadcaster";
global.broadcaster = new Broadcaster();

import Server from "./server";
global.server = new Server();
global.server.watch();

export default global.server;
