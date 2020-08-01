var webrtc = {};
(function (webrtc) {
    // 事前準備（共通）1 ~ 3

    // 1. video要素が必要
    var body = document.getElementsByTagName('body')[0];

    // localvideo
    var localVideo = document.createElement('video');
    localVideo.autoplay = true;

    // remotevideo
    var remoteVideo = document.createElement('video');
    remoteVideo.autoplay = true;

    var receiveSdpInput = document.createElement('textarea');
    receiveSdpInput.value = "ここにはSDPを貼り付けてね";
    var candidatesInput = document.createElement('textarea');
    candidatesInput.value = "ここにはCandidateを貼り付けてね";

    body.appendChild(localVideo);
    body.appendChild(remoteVideo);
    body.appendChild(receiveSdpInput);
    body.appendChild(candidatesInput);

    // 2. Peerを生成
    // Googleが提供しているSTUNサーバを使う
    // Simple Traversal of UDP through NATs (STUN): NAT越えの方法としてRFC3489で定められた標準的な仕組み

    // 外部のSTUNサーバに対してクライアントが一度接続し、
    // グローバルIPとマッピングされたポート番号を記憶しておくことで、
    // そのデータを使ってPeerは相手のマシンを特定することができる
    var peer = new webkitRTCPeerConnection({
        "iceServers": [{
            "url": "stun:stun.l.google.com:19302"
        }]
    });

    // 3. メディアに接続(カメラ
    // メディアに接続しvideo要素に内容を表示する
    navigator.webkitGetUserMedia({
            video: true,
            audio: false
        },
        function (stream) {
            console.log('stream', stream)

            // MediaStreamをsrcObjectで与えることで
            // カメラの画像video要素で閲覧できる

            // window.URL.createObjectURLはGoogle Chromeで廃止された
            // localVideo.src = window.URL.createObjectURL(stream);
            localVideo.srcObject = stream;

            // Peerにストリームを接続
            peer.addStream(stream);
        },
        function (err) {
            console.log(err);
        }
    );

    // --- 接続対象へSDPを送受信し、セッションを確立させる
    // Session Description Protocol (SDP):
    // 各ブラウザの情報(セッションが含むメディアの種類、IPアドレス、ポート番号などなど)を示し、文字列で表現される

    // 本来ならばシグナリングサーバーを用意して接続対象を選びSDPを送信するという手順になるが、
    // 用意が面倒なので手動でやる
    // 4 ~ 7

    // 4. Offer生成: 端末A
    // 接続対象へSDPを送信する(今回はconsole.logに出力するだけ
    var createOffer = function () {
        peer.createOffer(function (sdp) {
            peer.setLocalDescription(sdp,
                function () {
                    // 本来ならばこのタイミングでシグナリングサーバーへ自分のSDPを送信する
                    console.log(sdp);
                },
                function (err) {
                    console.log(err);
                }
            );
            // コピーしやすいように文字列化
            console.log(JSON.stringify(sdp));
        });
    };
    webrtc.createOffer = createOffer;

    // 5. Offerを受信: 端末B
    // SDPを受信する(手順4. で生成したSDPをコピーしテキストエリアに入力する.
    // その後、Developer Toolsのコンソールから下記関数を実行する
    var receiveSdp = function () {
        // コンソールから値を渡すようにしたかったが、自動文字変換が走ってうまくいかないので左側のテキストエリアに記載して値を取る
        var sdp = receiveSdpInput.value;
        sdp = JSON.parse(sdp);
        var remoteSdp = new RTCSessionDescription(sdp);
        peer.setRemoteDescription(remoteSdp,
            function () {
                if (remoteSdp.type === "offer") {
                    console.log("receive offer");
                }
                if (remoteSdp.type === "answer") {
                    console.log("receive answer");
                }
            },
            function (err) {
                console.log(err);
            }
        );
    };
    webrtc.receiveSdp = receiveSdp;

    // 7. Answerを受信: 端末A
    // SDPを受信する(手順6. で生成したSDPをコピーしテキストエリアに入力する. その後、Developer Toolsのコンソールから5で定義した下記関数を実行する
    // webrtc.receiveSdp()


    // --- ストリームの共有
    peer.onaddstream = function (event) {
        console.log('onaddstream event', event);
        remoteVideo.src = window.webkitURL.createObjectURL(event.stream);
    };
    // 通常は1経路ずつやりとりするが、手動では辛いので配列に入れていっぺんに共有する
    var candidates = [];
    peer.onicecandidate = function (event) {
        console.log('onicecandidate event', event);
        candidates.push(event.candidate);
    };

    // 8. candidateの出力: 端末A
    var displayCandidates = function () {
        // コピーしやすいように文字列化
        console.log(JSON.stringify(candidates));
    };
    webrtc.displayCandidates = displayCandidates;

    // 9. candidateの受信: 端末B
    var receiveCandidates = function () {
        var candidates = candidatesInput.value; // コンソールから値を渡すようにしたかったが、自動文字変換が走ってうまくいかないので右側のテキストエリアに記載して値を取る
        candidates = JSON.parse(candidates);

        for (var i = 0, l = candidates.length; i < l; i++) {
            if (candidates[i]) {
                var candidate = new RTCIceCandidate(candidates[i]);
                peer.addIceCandidate(candidate);
            } else {
                console.log("no candidate");
            }
        }
    };
    webrtc.receiveCandidates = receiveCandidates;

    // 10. candidateの出力: 端末B
    // 8.と同様の手順

    // 11. candidateの受信: 端末A
    // 9.と同様の手順


})(webrtc);