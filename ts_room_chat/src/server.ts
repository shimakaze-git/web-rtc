import * as express from 'express';
import * as socketIo from 'socket.io';
import * as path from 'path';

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
  private dirname: string = process.cwd();

  private chat: any;

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

    this.initWeb();
    this.initSocket();
    this.listen();
  }

  private initWeb(): void {
    this._app.use('/', express.static(path.join(this.dirname, 'public')));
  }

  private initSocket(): void {
    this.io = socketIo(this.server);
  }

  private toServer(socket: any): void {
    let name = '';
    let room = '';

    // S08. client_to_server_personalイベント・データを受信し、送信元だけに送信する
    socket.on('client_to_server_personal', (m: ChatMessage) => {
      console.log('m', m);
      // console.log('socket', socket);

      name = m.author;
      console.log('socket.id', socket.id);

      let personalMessage = 'あなたは、' + name + 'さんとして入室しました。';
      console.log('personalMessage', personalMessage);

      // console.log('this.io', typeof this.io);
      // socket.send('test');

      this.chat
        .to(socket.id)
        .emit('server_to_client', { message: personalMessage });
      // this.io
      //   .to(socket.id)
      //   .emit('server_to_client', { message: personalMessage });
    });

    // roomへの入室は、「socket.join(room名)」
    socket.on('client_to_server_join', (m: ChatMessage) => {
      room = m.message;
      socket.join(room);
    });

    // client_to_serverイベント・データを受信する
    socket.on('client_to_server', (m: ChatMessage) => {
      // S06. server_to_clientイベント・データを送信する
      // this.io.sockets.emit('server_to_client', { message: data.message });

      // this.io.emit('server_to_client', { message: m.message });
      // this.io.to(room).emit('server_to_client', { message: m.message });
      this.chat.to(room).emit('server_to_client', { message: m.message });
    });

    // S07. client_to_server_broadcastイベント・データを受信し、送信元以外に送信する
    socket.on('client_to_server_broadcast', (m: ChatMessage) => {
      console.log('m', m);
      // console.log('socket.broadcast', socket.broadcast.emit);

      // socket.broadcast.to(roomName).emit('message', data);
      socket.broadcast.emit('server_to_client', { message: m.message });
    });

    // disconnectイベント
    socket.on(ChatEvent.DISCONNECT, () => {
      console.log('Client disconnected');

      if (name == 'undefined') {
        console.log('未入室のまま、どこかへ去っていきました。');
      } else {
        let endMessage = name + 'さんが退出しました。';
        // this.io.sockets.emit('server_to_client', { value: endMessage });

        this.chat.to(room).emit('server_to_client', { message: endMessage });
        // this.io.to(room).emit('server_to_client', { message: endMessage });
      }
    });

    // console.log('this.io', this.io.to);
  }

  private listen(): void {
    this.server.listen(this.port, () => {
      console.log('Running server on port %s', this.port);
    });

    this.chat = this.io.of('/chat').on(ChatEvent.CONNECT, (socket: any) => {
      console.log('Connected client on port %s.', this.port);
      this.toServer(socket);

      socket.on(ChatEvent.MESSAGE, (m: ChatMessage) => {
        console.log('[server](message): %s', JSON.stringify(m));

        // this.io.emit('message', m);
        this.chat.emit('message', m);
      });
    });

    // 占い機能
    let fortune = this.io
      .of('/fortune')
      .on(ChatEvent.CONNECT, (socket: any) => {
        let id = socket.id;

        // 運勢の配列からランダムで取得してアクセスしたクライアントに送信する
        let fortunes = ['大吉', '吉', '中吉', '小吉', '末吉', '凶', '大凶'];
        let selectedFortune =
          fortunes[Math.floor(Math.random() * fortunes.length)];

        let todaysFortune =
          '今日のあなたの運勢は… ' + selectedFortune + ' です。';
        fortune.to(id).emit('server_to_client', { message: todaysFortune });
      });

    console.log('fortune', typeof fortune);
  }

  get app(): express.Application {
    return this._app;
  }
}
