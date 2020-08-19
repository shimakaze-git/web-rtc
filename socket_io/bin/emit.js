const emitterConfig = {
    host: '127.0.0.1',
    port: 6379
};
const emitter = require('socket.io-emitter')(emitterConfig);

//全接続へ
// emitter.emit('other_process', 'broadcasting');

//名前空間へ
// emitter.of('/chat').emit('other_process', 'broadcasting to namespace');

//特定のルームへ
// emitter.of('/chat').to('room1').emit('other_process', 'broadcasting to room1');

//特定ユーザー（socketID）へ
// var socketId = 'vikCSpoMsVDmsJFGAAAB';
// emitter.of('/chat').to(socketId).emit('other_process', 'private message');