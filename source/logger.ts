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

  info(message: string) {
    if (!process.env.DEBUG) {
      return;
    }
    this.logger.info(message);
  }

  http(message: string) {
    if (!process.env.DEBUG) {
      return;
    }
    this.logger.http(message);
  }

  debug(message: string) {
    if (!process.env.DEBUG) {
      return;
    }
    this.logger.debug(message);
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
