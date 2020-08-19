const sys = require('sys')
const redis = require('redis');
const CHANNEL = require('./channel');

const {
    redis: redisConf = {}
} = require('./config');

const subscriber = redis.createClient(redisConf.port, redisConf.host);
subscriber.subscribe(CHANNEL.MESSAGE_CHANNEL);
subscriber.on("error", function (err) {
    sys.debug(err);
});


exports.register = (emitter) => {
    console.log('emitter', emitter)
    subscriber.on('message', (channel, message) => {
        const jsonText = JSON.parse(message)

        // emitter.to(CHANNEL.MESSAGE_RECEIVER).emit(jsonText);
        // emitter.broadcast.json.emit(CHANNEL.MESSAGE_RECEIVER, jsonText)
        emitter.emit(CHANNEL.MESSAGE_RECEIVER, jsonText)
    })
}