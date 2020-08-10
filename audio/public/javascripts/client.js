const socket = io.connect()
let processor = null
let localstream = null

function startRecording() {

    console.log('start recording')

    // AudioContextはすべての音声の再生を管理
    context = new window.AudioContext()

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
    }).then((stream) => {
        console.log('stream')

        localstream = stream
        const input = this.context.createMediaStreamSource(stream)
        processor = context.createScriptProcessor(4096, 1, 1)

        input.connect(processor)
        processor.connect(context.destination)

        processor.onaudioprocess = (e) => {
            const voice = e.inputBuffer.getChannelData(0)
            console.log(voice.buffer)
            socket.emit('send_pcm', voice.buffer)
        }
    }).catch((e) => {
        console.log(e)
    })
}

function stopRecording() {
    console.log('stop recording')
    processor.disconnect()
    processor.onaudioprocess = null
    processor = null

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