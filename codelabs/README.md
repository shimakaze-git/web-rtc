# codelabs web-rtc sample

WebRTC の javascript にある API

- `getUserMedia()`：オーディオとビデオをキャプチャします。
- `MediaRecorder`：オーディオとビデオを記録します。
- `RTCPeerConnection`：ユーザー間でオーディオとビデオをストリーミングします。
- `RTCDataChannel`：ユーザー間でデータをストリーミングします。

### WebRTC はどこで使用できるのか

Firefox,Opera,デスクトップと Android の Chrome。
`WebRTC` は、iOS および Android のネイティブアプリでも使用できる。

### シグナリング

WebRTC は `RTCPeerConnection` を使用してブラウザ間でストリーミングデータを通信するが、通信を調整して制御メッセージを送信するメカニズムも必要。

これはシグナリングと呼ばれるプロセスです。
シグナリング方法とプロトコルは、WebRTC によって指定されていない。このコードラボでは、メッセージングに Socket.IO を使用しますが、[多くの代替手段](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/Signaling.md)があります。

### STUN と TURN とは何か

WebRTC は P2P で動作するように設計されているため、ユーザーは可能な限り最も直接的なルートで接続できます。
ただし、WebRTC は実際のネットワークに対応するように構築されています。
クライアントアプリケーションは NAT Gateway と Firewall を通過する必要があり、直接接続が失敗した場合の P2P Network は Fallback が必要です。
このプロセスの一部として、WebRTC API は STUN サーバーを使用してコンピューターの IP アドレスを取得し、TURN サーバーはピアツーピア通信が失敗した場合にリレーサーバーとして機能します。（現実世界の WebRTC は、より詳細に説明しています。）

### WebRTC は安全なのか

暗号化はすべての WebRTC コンポーネントに必須であり、その JavaScript API は安全なオリジン（HTTPS または localhost）からのみ使用できる。シグナリングメカニズムは WebRTC 標準では定義されていないため、安全なプロトコルを使用するようにしてください。

### ここで学ぶこと

- Web カメラからビデオを取得する
- RTCPeerConnection でビデオをストリーミングする
- RTCDataChannel でデータをストリーミングする
- メッセージを交換するためのシグナリングサービスを設定する
- ピア接続とシグナリングを組み合わせる
- 写真を撮って、データチャネルを介して共有する

### サンプルコードと環境構築

[サンプルコード](https://github.com/googlecodelabs/webrtc-web)

Web Server for Chrome をインストールしておく

https://chrome.google.com/webstore/detail/web-server-for-chrome/ofhbbkphhbklhfoeikjpcbhemlocgigb

## Step1

以下を学ぶ

- ウェブカメラからビデオストリームを取得します。
- ストリーム再生を操作します。
- CSS と SVG を使用してビデオを操作します。

## Step2

以下を学ぶ

- WebRTC シム adapter.js を使用して、ブラウザの違いを抽象化します。
- RTCPeerConnection API を使用してビデオをストリーミングします。
- メディアのキャプチャとストリーミングを制御します。

### RTCPeerConnection とは何か

RTCPeerConnection は、WebRTC 呼び出しを行ってビデオとオーディオをストリーミングしてデータを交換するための API。

2 つの RTCPeerConnection オブジェクト（ピアと呼ばれる）間の接続を設定する

### Adapter.js

仕様の変更やプレフィックスの違いからアプリを隔離するためのもの

[adapter.js](https://github.com/webrtc/adapter)

https://codelabs.developers.google.com/codelabs/webrtc-web

[WebRTC in the real world: STUN, TURN and signaling](https://www.html5rocks.com/en/tutorials/webrtc/infrastructure/#what-is-signaling)
