// クロスブラウザ定義
// navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

const socket = io.connect()
let processor = null
let localstream = null

let num = 0

// サンプリング周波数
let sampleRate = 0

// 期間
let duration = 0.0

// 長さ
let length = 0

// AudioContextはすべての音声の再生を管理
let context = null

// バッファーサイズ
let bufferSize = 1024

// 録画するかどうかのフラグ
let recordingFlg = false

// 録音データ
let audioData = []

// キャンバス
let canvasElm = document.getElementById('canvas')
let canvasContext = canvasElm.getContext('2d')

// 音声解析
let audioAnalyser = null

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

// 解析用処理
function analyseVoice() {
    let fsDivN = context.sampleRate / audioAnalyser.fftSize;
    let spectrums = new Uint8Array(audioAnalyser.frequencyBinCount);

    audioAnalyser.getByteFrequencyData(spectrums);
    canvasContext.clearRect(0, 0, canvasElm.width, canvasElm.height);

    canvasContext.beginPath();

    for (let i = 0, len = spectrums.length; i < len; i++) {
        // canvasにおさまるように線を描画
        let x = (i / len) * canvasElm.width;
        let y = (1 - (spectrums[i] / 255)) * canvasElm.height;

        if (i === 0) {
            canvasContext.moveTo(x, y);
        } else {
            canvasContext.lineTo(x, y);
        }

        let f = Math.floor(i * fsDivN);
        // index -> frequency;

        // 500 Hz単位にy軸の線とラベル出力
        if ((f % 500) === 0) {
            let text = (f < 1000) ? (f + ' Hz') : ((f / 1000) + ' kHz');
            // Draw grid (X)
            canvasContext.fillRect(x, 0, 1, canvasElm.height);
            // Draw text (X)
            canvasContext.fillText(text, x, canvasElm.height);
        }
    }

    canvasContext.stroke();

    // x軸の線とラベル出力
    let textYs = ['1.00', '0.50', '0.00'];
    for (var i = 0, len = textYs.length; i < len; i++) {
        let text = textYs[i];
        let gy = (1 - parseFloat(text)) * canvasElm.height;
        // Draw grid (Y)
        canvasContext.fillRect(0, gy, canvasElm.width, 1);
        // Draw text (Y)
        canvasContext.fillText(text, 0, gy);
    }
}

// 録音バッファ作成（録音中自動で繰り返し呼び出される）
let onAudioProcess = function (e) {
    if (!recordingFlg) return;

    // 音声データ
    let inputdata = e.inputBuffer.getChannelData(0);

    if (!num) {
        // バッファに格納されたPCMデータのチャンネルの数をintegerで返す
        num = e.inputBuffer.numberOfChannels;
        floatData = new Array(num);

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

    var bufferData = new Float32Array(bufferSize);
    for (var i = 0; i < bufferSize; i++) {
        bufferData[i] = inputdata[i];
    }
    audioData.push(bufferData);

    // console.log('audioData', audioData)

    // 波形を解析
    analyseVoice()
}

function handleSuccess(stream) {
    console.log('stream')

    localstream = stream

    // var source = context.createBufferSource();
    const input = context.createMediaStreamSource(stream);
    processor = context.createScriptProcessor(bufferSize, 1, 1);

    // window.dotnsf_hack_for_mozzila = input;
    input.connect(processor)
    // processor.connect(context.destination)

    processor.onaudioprocess = onAudioProcess;
    processor.connect(context.destination);

    // 音声解析関連
    audioAnalyser = context.createAnalyser();
    audioAnalyser.fftSize = 2048;
    frequencyData = new Uint8Array(audioAnalyser.frequencyBinCount);
    timeDomainData = new Uint8Array(audioAnalyser.frequencyBinCount);
    input.connect(audioAnalyser);
}

function startRecording() {

    // $('#recBtn').css('display', 'none');
    // $('#stopBtn').css('display', 'block');

    console.log('start recording')

    // AudioContextはすべての音声の再生を管理
    context = new window.AudioContext()

    // サンプリング周波数を start を指定してサーバに送信
    socket.emit('start', {
        'sampleRate': context.sampleRate
    })

    recordingFlg = true
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
    processor.disconnect()
    processor.onaudioprocess = null
    processor = null

    localstream.getTracks().forEach((track) => {
        track.stop()
    })

    // socket.emit('stop', '', (res) => {
    //     console.log(`Audio data is saved as ${res.filename}`)
    // })
}

function create_signal_waveform() {
    // $('#recBtn').css( 'display', 'block' );
    // $('#stopBtn').css( 'display', 'none' );

    if (processor) {
        processor.disconnect()
        processor.onaudioprocess = null
        processor = null

        localstream.getTracks().forEach((track) => {
            track.stop()
        })

        let audioBuffer = context.createBuffer(num, length, sampleRate);
        // console.log('audioBuffer', audioBuffer)

        for (var i = 0; i < num; i++) {
            audioBuffer.getChannelData(i).set(floatData[i]);
        }

        // .これを再生する
        console.log(audioBuffer);
        let source = context.createBufferSource();

        source.buffer = audioBuffer; //. オーディオデータの実体（AudioBuffer インスタンス）
        source.loop = false; //. ループ再生するか？
        source.loopStart = 0; //. オーディオ開始位置（秒単位）
        source.loopEnd = audioBuffer.duration; //. オーディオ終了位置（秒単位）
        source.playbackRate.value = 1.0; //. 再生速度＆ピッチ

        source.connect(context.destination);

        //. for lagacy browsers
        source.start(0);
        source.onended = function (event) {
            //. イベントハンドラ削除
            source.onended = null;
            document.onkeydown = null;
            num = 0;
            duration = 0.0;
            length = 0;

            //. オーディオ終了
            source.stop(0);

            console.log('audio stopped.');
        };

        //. floatData[] （の先頭の一部）をグラフ描画する
        let dotnum = 1024;
        let ctx = document.getElementById('myChart').getContext('2d');
        let labels = [];
        let datasets = [];
        let colors = ["rgba( 255, 0, 0, 0.4 )", "rgba( 0, 0, 255, 0.4 )"];

        for (let i = 0; i < dotnum; i++) {
            labels.push("" + (i + 1));
        }

        for (let i = 0; i < num; i++) {
            datasets.push({
                label: "data " + i,
                data: floatData[i].slice(1024, 1024 + dotnum),
                backgroundColor: colors[i % 2]
            });
        }

        let myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
            }
        });
    }
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