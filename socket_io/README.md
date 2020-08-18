# Supervisor Settings

[Supervisor によるプロセス管理](https://debug-life.net/entry/989)

## 最低限の設定項目

- inet_http_server - TCP ソケットで listen する HTTP サーバーの設定。
- supervisord - supervisord プロセスに関する設定。
- rpcinterface:supervisor
- supervisorctl
- program:x - supervisord 管理下で動作させるプログラムの設定。
