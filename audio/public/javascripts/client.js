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