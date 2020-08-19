const Memo = require('./mongo').Memo;

// function Publisher

module.exports = function socket(socket) {

    // Memo
    Memo.find(function (err, items) {
        if (err) {
            console.log('err', err);
        }
        console.log('items', items)

        // 接続したユーザにメモのデータを送る。
        socket.emit('create', items);
    });

    const save_broadcast = function (obj, event, data) {
        console.log(obj)
        obj.save(function (err) {
            if (err) {
                return;
            }
            // 他のクライアントにイベントを伝えるためにbroadcastで送信する。
            socket.broadcast.json.emit(event, data);
        });
    }

    // createイベントを受信した時、データベースにMemoを追加する。
    // memoDataは{text:String,position:{left:Number,top:Number}}の型
    socket.on('create', function (memoData) {
        //モデルからインスタンス作成
        var memo = new Memo(memoData);
        console.log('memo', memo)

        // データベースに保存。
        memo.save(function (err) {
            if (err) {
                return;
            }
            socket.broadcast.json.emit('create', [memo]);
            socket.emit('create', [memo]);
        });
    });

    // moveイベントを受信した時、Memoのpositionをアップデートする。
    socket.on('move', function (data) {
        console.log('data', data)
        console.log('data._id', data._id)

        // データベースから_idが一致するデータを検索
        Memo.findOne({
            _id: data._id
        }, function (err, memo) {
            if (err || memo === null) {
                return;
            }
            memo.position = data.position;
            save_broadcast(memo, 'move', data)
        })
    })

    // update-textイベントを受信した時、Memoのtextをアップデートする。
    socket.on('update-text', function (data) {
        Memo.findOne({
            _id: data._id
        }, function (err, memo) {
            if (err || memo === null) {
                return;
            }
            memo.text = data.text;
            // memo.save();
            save_broadcast(memo, 'update-text', data)
        });
    });


    // removeイベントを受信した時、データベースから削除する。
    socket.on('remove', function (data) {
        Memo.findOne({
            _id: data._id
        }, function (err, memo) {
            if (err || memo === null) {
                return;
            }
            memo.remove(function (err) {
                if (err) {
                    return;
                }
                // 他のクライアントにイベントを伝えるためにbroadcastで送信する。
                socket.broadcast.json.emit('remove', data);
            });
        });
    });

    socket.on('disconnect', function (data) {
        console.log('socket disconnected!!');
    })


    // const socketControllerPaths = glob.sync(`${process.cwd()}/socket/*.js`);

    // load socket methods
    // socketControllerPaths.forEach(socketControllerPath => {
    //     require(socketControllerPath).register(socket);
    // });

    // publisher関連のmethodsを登録
    const publisher = require('./publisher');
    publisher.register(socket)
};