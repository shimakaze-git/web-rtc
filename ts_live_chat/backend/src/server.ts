import * as express from 'express';
import * as socketIo from 'socket.io';
import { ChatEvent } from './constants';
import { ChatMessage } from './types';
import { createServer, Server } from 'http';

import * as cors from 'cors';

export class SocketIOServer {
  public static readonly PORT: number = 8080;
  private _app: express.Application;
  private server: Server;
  private io: SocketIO.Server;
  private port: string | number;

  constructor() {
    this._app = express();
    this.port = process.env.PORT || SocketIOServer.PORT;

    //options for cors midddleware
    // const options: cors.CorsOptions = {
    //   allowedHeaders: [
    //     'Origin',
    //     'X-Requested-With',
    //     'Content-Type',
    //     'Accept',
    //     'X-Access-Token',
    //   ],
    //   credentials: true,
    //   methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
    //   origin: API_URL,
    //   preflightContinue: false,
    // };

    // this._app..use(cors(options));

    this._app.use(cors());
    this._app.options('*', cors());

    this.server = createServer(this._app);

    this.initSocket();
    this.listen();
  }

  private initSocket(): void {
    this.io = socketIo(this.server);
  }

  private listen(): void {
    this.server.listen(this.port, () => {
      console.log('Running server on port %s', this.port);
    });

    this.io.on(ChatEvent.CONNECT, (socket: any) => {
      console.log('Connected client on port %s.', this.port);

      socket.on(ChatEvent.MESSAGE, (m: ChatMessage) => {
        console.log('[server](message): %s', JSON.stringify(m));
        this.io.emit('message', m);
      });

      socket.on(ChatEvent.DISCONNECT, () => {
        console.log('Client disconnected');
      });
    });
  }

  get app(): express.Application {
    return this._app;
  }
}
