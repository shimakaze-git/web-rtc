$(function () {
    'use strict'
    // socket_io.ioのサーバに接続
    const socket = io.connect('http://' + location.host + '/');
    console.log('socket', socket);

    // createイベントを受信した時、html上にメモを作成する
    socket.on('create', function (memoData) {
        memoData.forEach(function (data) {
            createMemo(data);
        });
    });

    // update-textイベントを受信した時、メモのテキストを更新する。
    socket.on('update-text', function (data) {
        $('#' + data._id).find('.text').val(data.text);
    });

    // moveイベントを受信した時、メモの位置をアニメーションさせる。
    socket.on('move', function (data) {
        $('#' + data._id).animate(data.position);
    });

    // removeイベントを受信した時、メモを削除する。
    socket.on('remove', function (data) {
        removeMemo(data._id);
    });

    // createボタンが押された時、新規メモを作成するようにcreateイベントを送信する。
    $('#create-button').click(function () {
        var memoData = {
            text: '',
            position: {
                left: 50,
                top: 200
            }
        };
        socket.emit('create', memoData);
    });

    const createMemo = function (memoData) {
        const id = memoData._id
        const old = $('#' + id)
        if (old.length !== 0) {
            return;
        }

        const element =
            $('<div class="memo"/>')
            .attr('id', id)
            .append($('<div class="settings">')
                .append('<a href="#" class="remove-button">☓</a>')
            )
            .append($('<div/>')
                .append($('<textarea class="text"/>')
                    .val(memoData.text)
                )
            ).css({
                left: memoData.position.left,
                top: memoData.position.top
            });

        element.hide().fadeIn();
        $('#field').append(element);

        // メモをドラッグした時、moveイベントを送る。
        // (jQuery UIを使用)
        element.draggable({
            stop: function (e, ui) {
                const pos = {
                    left: ui.position.left,
                    top: ui.position.top
                };

                console.log('pos', pos)
                socket.emit('move', {
                    _id: id,
                    position: pos
                });
            }
        });

        // テキストが変更された場合、update-textイベントを送る。
        const $text = element.find('.text');
        $text.keyup(function () {
            socket.emit('update-text', {
                _id: id,
                text: $text.val()
            });
        });

        // ☓ボタンを押した場合removeイベントを送る
        element.find('.remove-button').click(function () {
            socket.emit('remove', {
                _id: id
            });
            removeMemo(id);
            return false;
        });
    }

    const removeMemo = function (id) {
        $('#' + id).fadeOut('fast').queue(function () {
            $(this).remove();
        });
    };

    // サーバからmessage:receiveイベントが送信されたとき
    socket.on('message:receive', function (data) {
        console.log('data', data)
        $('#list').prepend($('<div/>').text(data.text))
    })

    // sendボタンがクリックされた時
    $('#send').click(function () {
        var text = $('#input').val()
        if (text !== '') {
            //サーバにテキストを送信
            // message
            socket.emit('message:publisher', {
                text: text
            })
            // $('#list').prepend($('<div/>').text(text))
            $('#input').val('')
        }
    })
})