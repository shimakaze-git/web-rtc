const mongoose = require('mongoose');

const hostname = '127.0.0.1:27017';
const databaseUrl =
    process.env.MONGO_DATABASE || 'mongodb://' + hostname;

const config = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // auth: {
    //     "authSource": "admin"
    // },
    user: "root",
    pass: "example01",
    dbName: "myapp",
    useNewUrlParser: true,
    useUnifiedTopology: true
}

// localhostのnode_memo_demoのデータベースに接続。
const db = mongoose.createConnection(databaseUrl, config);

// メモのスキーマを宣言。
const MemoSchema = new mongoose.Schema({
    text: {
        type: String
    },
    position: {
        left: Number,
        top: Number,
    },
});

// スキーマからモデルを生成。
const Memo = db.model('memo', MemoSchema);

module.exports = {
    db: db,
    Memo: Memo,
};