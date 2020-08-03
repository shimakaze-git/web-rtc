// Compatibility shim
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
console.log(navigator.getUserMedia);

// PeerJS object
// シグナリングサーバに接続する
// const skywayKey = '6165842a-5c0d-11e3-b514-75d3313b9d05'
const skywayKey = '0908cc9c-9af9-45b1-bcff-933df1f43f77'
var peer = new Peer({
    key: skywayKey,
    debug: 3
});
console.log(peer);
console.log(peer.id);

peer.on('open', function () {
    $('#my-id').text(peer.id);
});

// Receiving a call
// （受信後の処理）相手からビデオを送られてきたら、自分のビデオを相手に送る
peer.on('call', function (call) {
    // Answer the call automatically (instead of prompting user) for demo purposes
    call.answer(window.localStream);
    step3(call);
});
peer.on('error', function (err) {
    alert(err.message);
    // Return to step 2 if error occurs
    step2();
});

// Click handlers setup
$(function () {
    // （発進後の処理）ブラウザの発進ボタンがクリックされたら、自分のビデオ相手に送る
    $('#make-call').click(function () {
        // Initiate a call!
        var call = peer.call($('#callto-id').val(), window.localStream);

        step3(call);
    });

    $('#end-call').click(function () {
        window.existingCall.close();
        step2();
    });

    // Retry if getUserMedia fails
    $('#step1-retry').click(function () {
        $('#step1-error').hide();
        step1();
    });

    // Get things started
    step1();
});

function step1() {
    // Get audio/video stream

    // カメラとマイクを起動し、自分のビデオを表示する
    navigator.getUserMedia({
        audio: true,
        video: true
    }, function (stream) {
        // Set your video displays
        // $('#my-video').prop('src', URL.createObjectURL(stream));
        // video.srcObject = stream;
        $('#my-video').prop('srcObject', stream);

        window.localStream = stream;
        step2();
    }, function () {
        $('#step1-error').show();
    });
}

function step2() {
    $('#step1, #step3').hide();
    $('#step2').show();
}

function step3(call) {
    // Hang up on an existing call if present
    if (window.existingCall) {
        window.existingCall.close();
    }

    // Wait for stream on the call, then set peer video display
    // 相手のビデオを表示する
    call.on('stream', function (stream) {
        // $('#their-video').prop('src', URL.createObjectURL(stream));
        $('#their-video').prop('srcObject', stream);
    });

    // UI stuff
    window.existingCall = call;
    $('#their-id').text(call.peer);
    call.on('close', step2);
    $('#step1, #step2').hide();
    $('#step3').show();
}

// https://www.slideshare.net/rotsuya/intro-webrtcppt