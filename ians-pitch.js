const fs = require('fs')
const WavDecoder = require('wav-decoder')
const Pitchfinder = require("pitchfinder");

// see below for optional constructor parameters.
const detectPitch = new Pitchfinder.YIN();

const buffer = fs.readFileSync('iancow.wav');
const decoded = WavDecoder.decode(buffer)
.then(data => {
  const float32Array = data.channelData[0]; // get a single channel of sound
  // const pitch = detectPitch(float32Array); // null if pitch cannot be identified
  let frequencies = Pitchfinder.frequencies(detectPitch, float32Array, {
    tempo: 500, // in BPM, defaults to 120
    quantization: 4, // samples per beat, defaults to 4 (i.e. 16th notes)
  });

  frequencies = frequencies.filter(freq => {
    if (typeof freq === 'number') {
      return freq < 10000
    }
    return false
  })

  console.log(frequencies)

}) // get audio data from file using `wav-decoder`