$(function () {
    'use strict'
    // socket_io.ioのサーバに接続
    const socket = io.connect('http://' + location.host + '/');

    // サーバからmessageイベントが送信されたとき
    socket.on('message', function (data) {
        console.log('data', data)
        $('#list').prepend($('<div/>').text(data.text))
    })

    // sendボタンがクリックされた時
    $('#send').click(function () {
        var text = $('#input').val()
        if (text !== '') {
            //サーバにテキストを送信
            socket.emit('message', {
                text: text
            })
            $('#list').prepend($('<div/>').text(text))
            $('#input').val('')
        }
    })
})