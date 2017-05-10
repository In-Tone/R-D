const fs = require('fs')
const WavDecoder = require('wav-decoder')
const Pitchfinder = require("pitchfinder");

// see below for optional constructor parameters.
// .YIN is one pitch finding algorithm in the library
const detectPitch = new Pitchfinder.AMDF();


const buffer = fs.readFileSync('./audio/Falling-Chai-Yes.wav');
console.log('og buffer: ', buffer)
// need this to read from the wav file
// WavDecoder converts wav file buffer to an ArrayBuffer
// data.channelData[0] is a Float32Array
// save that to a var and pass into Pitchfinder.frequencies method with instance of Pitchfinder.YIN() and bpm and quantization
const decoded = WavDecoder.decode(buffer)
.then(data => {
  const float32Array = data.channelData[0]; // get a single channel of sound
  // const pitch = detectPitch(float32Array); // null if pitch cannot be identified


  // 500 bpm = 8.33 beats per second
  // quantization = 4 --> 33.32 samples per second
  let frequencies = Pitchfinder.frequencies(detectPitch, float32Array, {
    tempo: 500, // in BPM, defaults to 120
    quantization: 16, // samples per beat, defaults to 4 (i.e. 16th notes)
  });


  console.log('all freqs: ', frequencies)
  // filter out bad data - hacky for now, throws out nulls and high values
  frequencies = frequencies.filter(freq => {
    if (typeof freq === 'number') {
      return freq < 10000
    }
    return false
  }).map(freq => Math.round(freq))

  console.log(frequencies)

}) // get audio data from file using `wav-decoder`
