import express, { Application, ErrorRequestHandler } from "express";
import Heimdall from "./services/heimdall";

import * as errors from "http-errors";
import * as cookie from "cookie-parser";
import * as cors from "cors";

class Server {
  private application: Application = express();
  private port: string = process.env.PORT || "8080";
  private origin: string = process.env.ORIGIN || "localhost";
  private heimdall: Heimdall = new Heimdall();

  constructor() {
    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.application.use(
      cors.default({
        origin: this.origin,
      })
    );
    this.application.use(log.middleware());
    this.application.use(express.json());
    this.application.use(
      express.urlencoded({
        extended: false,
      })
    );
    this.application.use(cookie.default());
  }

  routes() {
    this.application.use("/events", require("./routes/events").default);
    this.application.use("/", require("./routes/tld").default);

    this.application.use((_request, _response, next) => {
      next(errors.default(404));
    });

    this.application.use(((error, _request, response, next) => {
      const status = error.status || 500;
      if (process.env.DEBUG) {
        response
          .status(status)
          .send(
            `<h1>${status}</h1><p>${
              error.stack.split("\n").join("<br>") || ""
            }</p>`
          );
      } else {
        response.status(status).send(`<h1>${status}</h1>`);
      }
    }) as ErrorRequestHandler);
  }

  watch() {
    this.application.listen(this.port);
    log.info(`[SERVER]: Successfully start at ${this.origin}:${this.port}`);
    this.heimdall.start();
  }
}

export default Server;
