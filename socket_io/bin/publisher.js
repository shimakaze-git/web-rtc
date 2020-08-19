const sys = require('sys')
const redis = require('redis');
const CHANNEL = require('./channel');

const {
    redis: redisConf = {}
} = require('./config');

const publisher = redis.createClient(redisConf.port, redisConf.host);
publisher.on("error", function (err) {
    sys.debug(err);
});

exports.register = (socket) => {
    // MESSAGE_RECEIVER: 'message:receive',
    // MESSAGE_PUBLISHER: 'message:publisher',

    socket.on(CHANNEL.MESSAGE_PUBLISHER, function (data) {
        // 念の為dataの値が正しいチェック
        console.log(data, typeof data.text)
        if (data && typeof data.text === 'string') {

            console.log('publisher', publisher)
            const jsonText = JSON.stringify({
                text: data.text
            })
            // redisにpublish
            publisher.publish(CHANNEL.MESSAGE_CHANNEL, jsonText)

            // publisher.publish(CHANNEL.MESSAGE_CHANNEL, {
            //     text: data.text,
            // })

            // メッセージを投げたクライアント以外全てのクライアントにメッセージを送信する
            // socket.broadcast.json.emit(CHANNEL.MESSAGE_RECEIVER, {
            //     text: data.text,
            // });

            // socket.broadcast.emit(CHANNEL.MESSAGE_RECEIVER, {
            //     text: data.text,
            // });

            // socket.emit(CHANNEL.MESSAGE_RECEIVER, {
            //     text: data.text,
            // });
        }
    })
}