import Heimdall from "../source/server";
import Logger from "../source/logger";
import Broadcaster from "../source/services/broadcaster";

declare global {
  var server: Server;
  var broadcaster: Broadcaster;
  var log: Logger;
}
