import { SocketIOServer } from './server';

const app = new SocketIOServer().app;

export { app };
