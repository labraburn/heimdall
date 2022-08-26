import * as winston from "winston";
import * as morgan from "morgan";

class Logger {
  private logger: winston.Logger;

  error(message: string) {
    this.logger.error(message);
  }

  warn(message: string) {
    this.logger.warn(message);
  }

  help(message: string) {
    this.logger.help(message);
  }

  data(message: string) {
    this.logger.data(message);
  }

  info(message: string) {
    this.logger.info(message);
  }

  debug(message: string) {
    if (!process.env.DEBUG) {
      return;
    }
    this.logger.debug(message);
  }

  prompt(message: string) {
    this.logger.prompt(message);
  }

  http(message: string) {
    this.logger.http(message);
  }

  verbose(message: string) {
    this.logger.verbose(message);
  }

  input(message: string) {
    this.logger.input(message);
  }

  silly(message: string) {
    this.logger.silly(message);
  }

  constructor() {
    winston.addColors({
      error: "red",
      warn: "yellow",
      info: "green",
      http: "magenta",
      debug: "white",
    });

    this.logger = winston.createLogger({
      level: "debug",
      levels: {
        error: 0,
        warn: 1,
        info: 2,
        http: 3,
        debug: 4,
      },
      transports: [new winston.transports.Console()],
      format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
        winston.format.colorize({ all: true }),
        winston.format.printf(
          (info) => `${info.timestamp} ${info.level}: ${info.message}`
        )
      ),
    });
  }

  middleware() {
    return morgan.default(
      ":method :url :status :res[content-length] - :response-time ms",
      {
        stream: {
          write: (message) => {
            this.http(message.trim());
          },
        },
      }
    );
  }
}

export default Logger;
