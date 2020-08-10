const WavEncoder = require('wav-encoder')
const fs = require('fs')

const express = require('express')
const http = require('http')
const path = require('path')

const app = express()

app.use('/', express.static(path.join(__dirname, 'public')))

const port = 3000
server = http.createServer(app).listen(port, function () {
    console.log('Example app listening on port 3000')
})

// WebSocket サーバを起動
const socketio = require('socket.io')
const io = socketio.listen(server)

// Convert byte array to Float32Array
const toF32Array = (buf) => {
    const buffer = new ArrayBuffer(buf.length)
    const view = new Uint8Array(buffer)
    for (var i = 0; i < buf.length; i++) {
        view[i] = buf[i]
    }
    return new Float32Array(buffer)
}

// data: Float32Array
// sampleRate: number
// filename: string
const exportWAV = (data, sampleRate, filename) => {
    const audioData = {
        sampleRate: sampleRate,
        channelData: [data]
    }
    WavEncoder.encode(audioData).then((buffer) => {
        fs.writeFile(filename, Buffer.from(buffer), (e) => {
            if (e) {
                console.log(e)
            } else {
                console.log(`Successfully saved ${filename}`)
            }
        })
    })
}

// クライアントが接続したときの処理
io.on('connection', (socket) => {
    let sampleRate = 48000
    let buffer = []

    // 録音開始の合図を受け取った時の処理
    // 録音開始の合図。サンプリング周波数を受け取る。
    socket.on('start', (data) => {
        console.log('start', data)
        sampleRate = data.sampleRate
        console.log(`Sample Rate: ${sampleRate}`)
    })

    // 録音中のPCMデータを受け取るAPI
    // PCM データを受信したときの処理
    socket.on('send_pcm', (data) => {
        console.log('send_pcm')

        const itr = data.values()
        const buf = new Array(data.length)

        for (var i = 0; i < buf.length; i++) {
            buf[i] = itr.next().value
        }
        buffer = buffer.concat(buf)
    })

    // 録音停止の合図を受け取ったときの処理
    // 録音停止の合図を受け取るAPI。
    // 受信した音声を public/wav の下に保存する。
    socket.on('stop', (data, ack) => {
        const f32array = toF32Array(buffer)
        const filename = `public/wav/${String(Date.now())}.wav`

        console.log('stop')
        console.log(f32array)
        console.log('data')
        console.log(data)

        exportWAV(f32array, sampleRate, filename)
        ack({
            filename: filename
        })
    })
})