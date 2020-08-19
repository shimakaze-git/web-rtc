# Supervisor Settings

[Supervisor によるプロセス管理](https://debug-life.net/entry/989)

## 最低限の設定項目

- inet_http_server - TCP ソケットで listen する HTTP サーバーの設定。
- supervisord - supervisord プロセスに関する設定。
- rpcinterface:supervisor
- supervisorctl
- program:x - supervisord 管理下で動作させるプログラムの設定。

# Redis Sentinel

Redis サーバの死活監視/通知および自動フェイルオーバー機能を提供する管理サーバ(redis-sentinel)

- [Redis Sentinel で自動フェイルオーバー](https://qiita.com/wellflat/items/8935016fdee25d4866d9)
- [インメモリ KVS の Redis について](https://rest-term.com/archives/2898/)

## Redis tools App

- Redis コマンド
- Redis Sentinel
- Redis Live
- Redis Faina
- Redis Sampler
- redis-top
- Nagios プラグイン
- Zabbix テンプレート
- Munin プラグイン
- Cacti プラグイン

# Cluster

## Cluster の仕組み

- [Node.js の Cluster をセットアップして、処理を並列化・高速化する](https://postd.cc/setting-up-a-node-js-cluster/)
- [Node.js Cluster+Socket.IO+Redis によるリアルタイム通知システム](https://ameblo.jp/principia-ca/entry-11645942977.html)

![clusterの仕組み](20110513031854.png)

## ベンチマーク

10000 リクエストを並列 30 でベンチマーク

```
$ ab -n 10000 -c 30 http://127.0.0.1/
$ ab -n 10000 -c 30 http://127.0.0.1:3000/
```

### 接続済みソケット共有型

- v0.11.2 から Unix 系(非 Windows)プラットフォームのデフォルト
- マスタープロセスはラウンドロビン方式でワーカープロセスに接続済みソケットを渡す
- 接続後のクライアントとの送受信はワーカープロセスが行う
- どのワーカープロセスに割り振るかはマスタープロセスが決定
- cluster.schedulingPolicy = cluster.SCHED_RR を指定する
- もしくは環境変数 NODE_CLUSTER_SCHED_POLICY に rr を指定する

### リスニングソケット共有型

- v0.11.2 から Windows 系プラットフォームのデフォルト
- マスタープロセスは初期化時にリスニングソケットを準備するのみ
- どのワーカープロセスに割り振るかは OS カーネルが決定(マスタープロセスは関与しない)
- クライアントとのやり取りはワーカープロセスが直接行う
- cluster.schedulingPolicy = cluster.SCHED_NONE を指定する
- もしくは環境変数 NODE_CLUSTER_SCHED_POLICY に none を指定する
