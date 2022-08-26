import { Response, Request } from "express";
import { v4 as uuid4 } from "uuid";

const _headers = {
  "Content-Type": "text/event-stream",
  Connection: "keep-alive",
  "Cache-Control": "no-cache",
};

class Client {
  uuid: string;
  private request: Request;
  private response: Response;

  constructor(request: Request, response: Response) {
    this.uuid = uuid4();
    this.request = request;
    this.response = response;

    response.set(_headers).flushHeaders();
  }

  send(data: { [key: string]: any }) {
    const _data = `data: ${JSON.stringify(data)}\n\n`;
    this.response.write(_data);
  }
}

class Broadcaster {
  private clients: { [key: string]: Client } = {};
  constructor() {}

  add(subscriber: { request: Request; response: Response }): string {
    const client = new Client(subscriber.request, subscriber.response);
    const uuid = client.uuid;

    this.clients[uuid] = client;
    subscriber.request.on("close", () => {
      delete this.clients[uuid];
    });

    return uuid;
  }

  send(data: { [key: string]: any }, uuid: string) {
    this.clients[uuid].send(data);
  }

  broadcast(data: { [key: string]: any }, uuid?: string) {
    Object.entries(this.clients).forEach(([_uuid, client], _index) => {
      client.send(data);
    });
  }
}

export default Broadcaster;
