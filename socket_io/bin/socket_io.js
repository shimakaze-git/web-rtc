module.exports = function socket(socket) {
    // クライアントからmessageイベントを受信した時
    socket.on('message', function (data) {
        // 念の為dataの値が正しいチェック
        console.log(data, typeof data.text)
        if (data && typeof data.text === 'string') {
            // メッセージを投げたクライアント以外全てのクライアントにメッセージを送信する
            socket.broadcast.json.emit('message', {
                text: data.text
            });
        }
    })
}