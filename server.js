const express = require('express');
const app = express();
const path = require('path');

const fs = require('fs')
const WavDecoder = require('wav-decoder')
const Pitchfinder = require("pitchfinder");


app.use(express.static(path.join(__dirname)));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + 'index.html'));
});

app.get('/test', (req, res) => {
  const detectPitch = new Pitchfinder.AMDF();
  const buffer = fs.readFileSync('./audio/Rising-Sai-Clear.wav');

  const decoded = WavDecoder.decode(buffer)
  .then(data => {


    const float32Array = data.channelData[0]; // get a single channel of sound
    // const pitch = detectPitch(float32Array); // null if pitch cannot be identified

    // mike's new way;
    const detectors = [detectPitch, Pitchfinder.AMDF()];
    let moreAccurateFrequencies = Pitchfinder.frequencies(detectors, float32Array, {
      tempo: 500, // in BPM, defaults to 120
      quantization: 8, // samples per beat, defaults to 4 (i.e. 16th notes)
    }).map(freq => Math.round(freq));

    const results = [];

    moreAccurateFrequencies.forEach(freq => {
      // console.log('freq', freq, 'results', results)
      if (typeof freq !== 'number' || freq > 1000 || isNaN(freq)) {
          if (!results.length) {
              results.push(0);
          } else {
              results.push(results[results.length - 1])
          }
      } else {
          results.push(freq);
      }
    })

    // moreAccurateFrequencies = moreAccurateFrequencies.filter(freq => {
    //   if (typeof freq === 'number') {
    //     return freq < 10000
    //   }
    //   return false
    // }).map(freq => Math.round(freq))
    console.log(results.length)
     res.send(results)

    // ian's original:
    // 500 bpm = 8.33 beats per second
    // quantization = 4 --> 33.32 samples per second

    // let frequencies = Pitchfinder.frequencies(detectPitch, float32Array, {
    //   tempo: 500, // in BPM, defaults to 120
    //   quantization: 16, // samples per beat, defaults to 4 (i.e. 16th notes)
    // });

    // frequencies = frequencies.filter(freq => {
    //   if (typeof freq === 'number') {
    //     return freq < 10000
    //   }
    //   return false
    // }).map(freq => Math.round(freq))

    //  res.send(frequencies)

  }) // get audio
})

app.listen(process.env.PORT || 8080)
