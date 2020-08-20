const socket = io.connect()
let processor = null
let localstream = null

let num = 0

// サンプリング周波数
let sampleRate = 0

// 期間
let duration = 0.0

// AudioContextはすべての音声の再生を管理
context = new window.AudioContext()

function send_pcm(voice) {
    // socket.emit('send_pcm', voice.buffer)
}

function availableData(arr) {
    var b = false;
    for (var i = 0; i < arr.length && !b; i++) {
        b = (arr[i] != 0);
    }
    return b;
}

function handleSuccess(stream) {
    console.log('stream')

    localstream = stream

    // var source = context.createBufferSource();
    const input = context.createMediaStreamSource(stream);
    processor = context.createScriptProcessor(1024, 1, 1);

    // window.dotnsf_hack_for_mozzila = input;
    input.connect(processor)
    // processor.connect(context.destination)

    processor.onaudioprocess = function (e) {
        // 音声データ
        let inputdata = e.inputBuffer.getChannelData(0);

        if (!num) {
            // バッファに格納されたPCMデータのチャンネルの数をintegerで返す
            num = e.inputBuffer.numberOfChannels;
            floatData = new Array(num);

            console.log('num', num)

            for (var i = 0; i < num; i++) {
                floatData[i] = [];
            }
            sampleRate = e.inputBuffer.sampleRate;
        }

        // let float32Array = e.inputBuffer.getChannelData(0);
        let float32Array = inputdata
        if (availableData(float32Array)) {
            duration += e.inputBuffer.duration;
            length += e.inputBuffer.length;

            for (var i = 0; i < num; i++) {
                float32Array = e.inputBuffer.getChannelData(i);
                Array.prototype.push.apply(floatData[i], float32Array);
            }
        }

        // 音声データを送る
        send_pcm(inputdata)
    }
    processor.connect(context.destination);
}

function startRecording() {

    // $('#recBtn').css('display', 'none');
    // $('#stopBtn').css('display', 'block');

    console.log('start recording')

    // AudioContextはすべての音声の再生を管理
    // context = new window.AudioContext()

    // サンプリング周波数を start を指定してサーバに送信
    socket.emit('start', {
        'sampleRate': context.sampleRate
    })

    // getUserMedia を使用してマイクにアクセスします。

    // アクセス後は processor.onaudioprocess
    // にコールバック関数を指定することで、リアルタイムに音声を取得し、
    // send_pcm を指定してサーバに送信
    navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
    }).then(handleSuccess).catch((e) => {
        console.log(e)
    })
}

function stopRecording() {
    // $('#recBtn').css( 'display', 'block' );
    // $('#stopBtn').css( 'display', 'none' );

    console.log('stop recording')
    if (processor) {
        processor.disconnect()
        processor.onaudioprocess = null
        processor = null
    }

    // processor.disconnect()
    // processor.onaudioprocess = null
    // processor = null

    localstream.getTracks().forEach((track) => {
        track.stop()
    })

    socket.emit('stop', '', (res) => {
        console.log(`Audio data is saved as ${res.filename}`)
    })
}

let localMediaStream = null

let video = document.querySelector('video')
let canvas = document.querySelector('canvas')
let ctx = canvas.getContext('2d')

function hasGetUserMedia() {
    // Note: Opera builds are unprefixed.
    return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia || navigator.msGetUserMedia);
}

function startProcess() {

    function success(stream) {
        // video.src = window.URL.createObjectURL(stream)
        video.srcObject = stream
        localMediaStream = stream

        video.onloadedmetadata = function (e) {
            // Ready to go. Do some stuff.
        }
    }

    function fallback(e) {
        video.src = 'fallbackvideo.webm'
        console.log('Reeeejected!', e)
    }

    if (hasGetUserMedia()) {
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || window.navigator.mozGetUserMedia

        navigator.getUserMedia({
                video: true,
                audio: false
            },
            success,
            fallback
        )

    } else {
        alert('getUserMedia() is not supported in your browser');
    }
}

// スナップショットの取得
function snapshot() {
    if (localMediaStream) {
        ctx.drawImage(video, 0, 0, 200, 150)
        document.querySelector('img').src = canvas.toDataURL('image/webp')
    }
}