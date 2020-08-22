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

音のボリューム変更を行うには、 `Source` と `Destination` の間に `GainNode` を追加します。

```
AudioContext.

[ Source ] --> [ GainNode ] --> [ Destination ]
```

```javascript
// サウンドの再生
const playSound = (buffer) => {
  // Source
  const source = context.createBufferSource();
  source.buffer = buffer;

  // GainNode
  const gainNode = context.createGain();
  gainNode.gain.value = 0.1; // ボリュームを小さく
  source.connect(gainNode);

  // Destination
  gainNode.connect(context.destination);

  // Sourceの再生
  source.start(0);
};
```

# 音のフェードイン・フェードアウト

音のフェードイン・フェードアウトを行うには、 `linearRampToValueAtTime()` を使います。
`setTimeout` を使うこともできますが、正確なスケジューリングはできません

```
linearRampToValueAtTime(value, time)
・value: 設定値
・startTime: 時間
```

10 秒でフェードインするには、 `GainNode` に以下の設定を追加

```javascript
// 音のフェードイン (10秒で0→1)
let currTime = context.currentTime;
gainNode.gain.linearRampToValueAtTime(0, currTime);
gainNode.gain.linearRampToValueAtTime(1, currTime + 10);
```

# 音のフィルタ適用

音のフィルタ適用を行うには、 `Source` と `Destination` の間に `BiquadFilterNode` を配置します。

```
AudioContext.

[ Source ] --> [ BiquadFilterNode ] --> [ Destination ]
```

以下のフィルタがサポートされています。

- ローパスフィルタ : 特定周波数より下を通す。それ以上は減衰する。
- ハイパスフィルタ : 特定周波数より上を通す。それ以下は減衰する。
- バンドパスフィルタ : 特定周波数の範囲を通す。それ以外は減衰する。
- ローシェルフフィルタ : 特定周波数より下を増幅または減衰させる。
- ハイシェルフフィルタ : 特定周波数より上を増幅または減衰させる。
- ピーキングフィルタ : 特定周波数の範囲を増幅、減衰させる。
- ノッチフィルタ : 特定周波数の範囲を減衰させる。
- オールパスフィルタ : すべての周波数を通し位相特性だけを回転させる

全てのフィルタは `Gain、周波数、クォリティファクタ` をパラメータとして指定することができます。
`Gain` はローシェルフフィルタやピーキングフィルタなどの一部のフィルタにのみ影響します。
`周波数` によりカットオフ周波数が決まり、 `クォリティファクタ` により特性のなだらかさが変化します。

```javascript
// サウンドの再生
const playSound = (buffer) => {
  // Source
  const source = context.createBufferSource();
  source.buffer = buffer;

  // BiquadFilter
  const filter = context.createBiquadFilter();
  filter.type = 'lowpass'; // ローパスフィルタ
  filter.frequency.value = 440; // クォリティファクタ (440HZ)
  source.connect(filter);

  // Destination
  filter.connect(context.destination);

  // Sourceの再生
  source.start(0);
};
```

# 単音の生成

音の生成の簡単な例として、基準音の「ラ」音（440Hz）の単音を生成します。

- create_sound.html

```html
<script type="text/javascript">
  // AudioContextの生成
  const context = new AudioContext();

  // サウンドの生成
  const createSound = (func, duration) => {
    let sampleRate = context.sampleRate; // サンプリングレート
    let dt = 1 / sampleRate; // 時間刻み

    let buffer = context.createBuffer(1, sampleRate * duration, sampleRate);
    let data = buffer.getChannelData(0); // バッファ配列の生成

    for (let i = 0; i < data.length; i++) {
      data[i] = func(dt * i);
    }

    return buffer;
  };

  // サウンドの再生
  const playSound = (buffer) => {
    // Source
    const source = context.createBufferSource();
    source.buffer = buffer;

    // Destination
    source.connect(context.destination);

    // Sourceの再生
    source.start(0);
  };

  // メイン
  (async () => {
    // サウンドの生成
    let func = (t) => {
      return Math.sin(2 * Math.PI * 440 * t);
    };
    const buffer = createSound(func, 10);

    // サウンドの再生
    playSound(buffer);
  })().catch((err) => console.error(err));
</script>
```

以下の関数 `func` が、基準音の「ラ」音（440Hz）の単音を表す数式です。

```javascript
let func = (t) => {
  return Math.sin(2 * Math.PI * 440 * t);
};
```

AudioContext.createBuffer() でバッファを生成します。

```
createBuffer(numOfChannels, length, sampleRate)
・numOfChannels: チャネル数
・length: バッファのフレーム数
・sampleRate: サンプリングレート(1 秒あたりのフレーム数:22050〜96000)
```

buffer.getChannelData(0) でバッファ配列を取得し、編集します。

# 音のグラフのプロット

生成した単音を解析するため、グラフのプロットを行います。

- 時間グラフ: 指定した数式を表すグラフ。横軸は時間[ms]、縦軸は数式の解。
- 周波数グラフ: 音を構成する周波数成分の分布を表すグラフ。横軸は周波数[Hz]、縦軸は音圧

音のグラフのプロットを行うには、 `Source` と `Destination` の間に `AnalyserNode` を配置します。

```
AudioContext.

[ Source ] --> [ AnalyserNode ] --> [ Destination ]
```

- graph.html

```html
<canvas id="graph0" width="256" height="256"></canvas>
<canvas id="graph1" width="256" height="256"></canvas>

<script type="text/javascript">
  // AudioContextの生成
  const context = new AudioContext();

  // AnalyzerNode
  let analyzer;

  // サウンドの生成
  const createSound = (func, duration) => {
    let sampleRate = context.sampleRate; // サンプリングレート
    let dt = 1 / sampleRate; // 時間刻み
    let buffer = context.createBuffer(1, sampleRate * duration, sampleRate);
    let data = buffer.getChannelData(0); // バッファ配列の生成
    for (let i = 0; i < data.length; i++) {
      data[i] = func(dt * i);
    }
    return buffer;
  };

  // サウンドの再生
  const playSound = (buffer) => {
    // Source
    const source = context.createBufferSource();
    source.buffer = buffer;

    // AnalyzerNode
    analyser = new AnalyserNode(context, { smoothingTimeConstant: 0.9 });
    source.connect(analyser);

    // Destination
    analyser.connect(context.destination);

    // Sourceの再生
    source.start(0);
  };

  const plotGraph = (id, mode) => {
    // コンテキストの取得
    const canvasctx = document.getElementById(id).getContext('2d');

    // 描画更新
    function drawGraph() {
      // 背景の描画
      canvasctx.fillStyle = '#ffffff';
      canvasctx.fillRect(0, 0, 256, 256);
      canvasctx.strokeStyle = '#999999';
      canvasctx.strokeRect(0, 0, 256, 256);

      // グラフの描画
      const data = new Uint8Array(256);
      if (mode == 0) {
        //時間グラフ
        analyser.getByteTimeDomainData(data);
        canvasctx.strokeStyle = '#f29737';
        canvasctx.beginPath();
        canvasctx.moveTo(0, 256 - data[0]);
        for (var i = 1; i < 256; ++i) {
          canvasctx.lineTo(i, 256 - data[i]);
        }
        canvasctx.stroke();
      } else {
        //周波数グラフ
        analyser.getByteFrequencyData(data);
        for (var i = 0; i < 256; ++i) {
          canvasctx.fillStyle = '#f29737';
          canvasctx.fillRect(i, 256 - data[i], 1, data[i]);
        }
      }
    }

    // 描画更新ループ
    setInterval(drawGraph, 100);
  };

  // メイン
  (async () => {
    // サウンドの生成
    let func = (t) => {
      return Math.sin(2 * Math.PI * 880 * t);
    };
    const buffer = createSound(func, 10);

    // サウンドの再生
    playSound(buffer);

    // グラフのプロット
    plotGraph('graph0', 0);
    plotGraph('graph1', 1);
  })().catch((err) => console.error(err));
</script>
```

sin 関数による「ラ」音(440Hz)

```javascript
let func = (t) => {return Math.sin(2 _ Math.PI _ 440 \* t)}
```

cos 関数による「ラ」音(440Hz)

```javascript
let func = (t) => {
  return Math.cos(2 * Math.PI * 440 * t);
};
```

cos 関数で実行した場合は、開始時に「プツッ」という小さなクラック音が入ります。
これは「t = 0」で振動の最大から開始しているためと考えられます。
初期位相をずらすことで問題を解決することができます。

1 オクターヴ上の「ラ」音(880Hz)

```javascript
let func = (t) => {
  return Math.sin(2 * Math.PI * 880 * t);
};
```

# 三角波・矩形波・鋸波

三角波、矩形波、鋸波は、昔からデジタルシンセサイザーにおいて標準で使われている波形です。

## 三角波

三角波は、直線で表せる波形の中では、もっとも正弦波に近い「丸い」音の出るものの一つです。この効果は、特に低域で顕著になることから、ゲーム機ではベース音に使用されることが多くなります。

```javascript
const func = (t) => {
  return t % (1 / 440) < 1 / 440 / 2
    ? 2 * ((t % (1 / 440)) / (1 / 440))
    : 2 - 2 * ((t % (1 / 440)) / (1 / 440));
};
```

## 矩形波

矩形波は、基音と、その奇数倍の周波数を持つ正弦波の和で、クラリネットが持つ波形に、近いと言われます。

```javascript
const func = (t) => {
  return t % (1 / 440) < 1 / 440 / 2 ? 1 : 0;
};
```

## 鋸波

音に、その整数倍音を順に重ねていくと、鋸の波形に近づいていきます。これは、弦楽アンサンブルの音色に似ているとされており、実際にこの波形を少し加工するだけで、ストリングスに近い音色を簡単に得ることができます。

```javascript
const func = (t) => {
  return ((t % (1 / 440)) / (1 / 440) - 0.5) * 2;
};
```

# クラス一覧

## オーディオグラフ

- AudioContext: オーディオコンテクスト。
- AudioNode: オーディオノード。
- AudioParam: オーディオパラメータ。

## 音源

- OscillatorNode: sin 波、矩形波、鋸波、三角波などの音源ノード。
- PeriodicWave: 周期波形。
- AudioBuffer: オーディオバッファ。
- AudioBufferSourceNode: オーディオバッファの音源ノード。
- MediaElementAudioSourceNode: audio 要素と video 要素の音源ノード。
- MediaStreamAudioSourceNode: ストリームの音源ノード。

## フィルタ

- BiquadFilterNode: フィルタを適用するノード。
- ConvolverNode: 線形畳み込みを適用するノード。
- DelayNode: 遅延を適用するノード。
- DynamicsCompressorNode: 一定レベル以上の音量を宣言するノード。
- GainNode: 音量を指定するノード。
- WaveShaperNode: 非線形ディストーション処理を実現するノード。

## 出力先

- AudioDestinationNode: 音源の最終的な出力先を表すノード。
- MediaStreamAudioDestinationNode: オーディオデータをストリーム形式で出力するノード。

## 解析と可視化

- AnalyserNode: オーディオデータの周波数情報、時間情報をリアルタイムに提供。

## チャンネルの分割と結合

- ChannelSplitterNode: チャンネルの分割を行うノード。
- ChannelMergerNode: チャンネルの結合を行うノード。

## 立体音響

- AudioListener: リスナの位置と向きを表す。
- PannerNode： 音源の位置、移動速度、向きを表すパンを指定するノード。

## カスタムオーディオデータ

- ScriptProcessorNode: JavaScript による直接オーディオデータの生成、処理、解析を行うノード。
- AudioProcessingEvent: ScriptProcessorNode への入力データが処理可能な状態になった時に発生するイベント。

## オンライン / バックグラウンド処理

- OfflineAudioContext: オーディオコンテキストの一種。オーディオデータをハードウェアにレンダリングしない点が AudioContext クラスと異なる。
- OfflineAudioCompletionEvent: OfflineAudioContext のレンダリングが完了した時に発生するイベント。
