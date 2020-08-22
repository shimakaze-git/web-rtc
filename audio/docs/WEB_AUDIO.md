# Web Audio API

Web Audio API は、Web ブラウザ上で音を生成・処理・再生するための API

Web ブラウザでの音の再生は、<audio> 要素 が有名ですが、再生しかできない。
生成・処理（周波数フィルタ、歪み処理、立体音響など）を行うには Web Audio API が必要になる。

# AudioContext

AudioContext はすべての音の再生を管理する。
Web Audio API を使って音を出すには、一つ以上の `Source` を作成し、 `AudioContext` が提供する `Destination` に接続する.

`Source` と `Destination` は直接接続することも可能ですが、中間に音を処理する `AudioNode` をはさむことができます。

```
AudioContext.

[ Source ] --> [ AudioNode ] --> [ Destination ]
```

# 音の再生

はじめに、Source と Destination を直接つなげて、音を再生する。
Source では、WAV、MP3、AAC、OGG などの音声ファイルがサポートされており、ブラウザごとにサポートする音声フォーマットは異なります。

```
AudioContext.

[ Source ] --> [ Destination ]
```

[play.html](./src/play.html)

# 音のボリューム変更

# 音のフェードイン・フェードアウト

# 音のフィルタ適用

# 単音の生成

# 音のグラフのプロット

# 三角波・矩形波・鋸波

# クラス一覧
