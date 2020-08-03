'use strict';

// ビデオのみをストリーミング
// 引数にはメディアを取得するために何を指定することができる
// 音声のみがデフォルトで無効になっているため動画のみ
const mediaStreamConstraints = {
    // video: true,
    video: {
        width: {
            min: 1280
        },
        height: {
            min: 720
        }
    }
};

// ストリームが配置されるビデオ要素
// Video element where stream will be placed.
const localVideo = document.querySelector('video');

// ビデオで再生されるローカルストリーム
// Local stream that will be reproduced on the video.
let localStream;

// MediaStreamを動画要素に追加することで成功を処理
function gotLocalMediaStream(mediaStream) {
    // getUserMediaの呼び出しで成功した場合はMediaStreamが返される
    // srcObject属性を介してメディア要素で使用できる

    localStream = mediaStream;
    localVideo.srcObject = mediaStream;

    console.log(localStream.getVideoTracks()[0]);
}

// エラーメッセージと共にコンソールにメッセージを記録することにより、エラーを処理
function handleLocalMediaStreamError(error) {
    console.log('navigator.getUserMedia error: ', error);
}

// メディアストリームを初期化
// getUserMedia()呼び出しに続いて、ブラウザーはユーザーにカメラへのアクセス許可を要求
navigator.mediaDevices.getUserMedia(mediaStreamConstraints)
    .then(gotLocalMediaStream).catch(handleLocalMediaStreamError);

// 成功した場合、MediaStreamが返されます。これは、srcObject属性を介してメディア要素で使用できます。