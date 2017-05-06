const autocorrelation = require('autocorrelation').autocorrelation;
const chroma = require('chroma-js');
let Plotly = require('plotly')('mikeluz', '3vgNiLnEqG8XudnTUhUg');
const fft = require('fft');
const PitchAnalyzer = require('./pitch.js/src/pitch.js');

// var data = [{x:[0,1,2], y:[3,2,1], type: 'bar'}];
// var layout = {fileopt : "overwrite", filename : "simple-node-example"};

// Plotly.plot(data, layout, function (err, msg) {
//     if (err) return console.log(err);
//     console.log(msg);
// });

// create the audio context (chrome only for now)
if (! window.AudioContext) {
    if (! window.webkitAudioContext) {
        alert('no audiocontext found');
    }
    window.AudioContext = window.webkitAudioContext;
}

var context = new AudioContext();

var audioBuffer;
var sourceNode;
var analyser;
var javascriptNode;

// get the context from the canvas to draw on
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

// load the sound
setupAudioNodes();
loadSound("sandwich.mp3");


function setupAudioNodes() {

    // setup a javascript node
    javascriptNode = context.createScriptProcessor(2048, 1, 1);
    // connect to destination, else it isn't called
    javascriptNode.connect(context.destination);


    // setup a analyzer
    analyser = context.createAnalyser();
    analyser.smoothingTimeConstant = 0;
    analyser.fftSize = 4096;

    // create a buffer source node
    sourceNode = context.createBufferSource();
    sourceNode.connect(analyser);
    analyser.connect(javascriptNode);

    sourceNode.connect(context.destination);
}

// load the specified sound
function loadSound(url) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    // When loaded decode the data
    request.onload = function () {

        // decode the data
        context.decodeAudioData(request.response, function (buffer) {
            // when the audio is decoded play the sound
            playSound(buffer);
        }, onError);
    }
    request.send();
}


function playSound(buffer) {
    sourceNode.buffer = buffer;
    // sourceNode.start(0);
    // sourceNode.loop = false;
}

// log if an error occurs
function onError(e) {
    console.log(e);
}

// when the javascript node is called
// we use information from the analyzer node
// to draw the volume
javascriptNode.onaudioprocess = function () {

    // get the average for the first channel
    var array = new Float32Array(analyser.frequencyBinCount);
    analyser.getFloatFrequencyData(array);

    // console.log("sourceNode", sourceNode.buffer);
    // var data = sourceNode.buffer.getChannelData(0);

    /* Create a new pitch detector */
    var pitchOne = new PitchAnalyzer(44100);

    // console.log("data", data);

    /* Copy samples to the internal buffer */
    // pitchOne.input(sourceNode.buffer.getChannelData(0).slice(1000,10000));

    var n = 1001;
    var i = 1;

    var tones = [];
    var vols = [];

    // while (n < data.length && i < 50000) {
    //     pitchOne.input(data.slice(n-1000, n));
    //     /* Process the current input in the internal buffer */
    //     pitchOne.process();
    //     // console.log("pitchOne instance", pitchOne);

    //     var toneOne = pitchOne.findTone();

    //     if (toneOne === null) {
    //         // console.log('No tone found!');
    //         tones.push(0);
    //         vols.push(0);
    //     } else {
    //         // console.log('Found a toneOne, frequency:', toneOne.freq, 'volume:', toneOne.db);
    //         tones.push(toneOne.freq);
    //         vols.push(toneOne.db);
    //     }
    //     n = n+1000;
    //     i++;
    // }
    // console.log("tones.length / tones", tones.length, tones);
    // console.log("vols.length / vols", vols.length, vols);
}

// mic situation

var hpFilter = context.createBiquadFilter();
hpFilter.type = "highpass";
hpFilter.frequency.value = 85;
hpFilter.gain.value = 10;

var lpFilter = context.createBiquadFilter();
lpFilter.type = "lowpass";
lpFilter.frequency.value = 900;
lpFilter.gain.value = 10;

var viz = context.createAnalyser();
viz.fftSize = 2048;

var arrayOne = new Float32Array(viz.frequencyBinCount);
var arrayTwo = new Uint8Array(viz.frequencyBinCount);

function draw() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // ctx.fillStyle = 'rgb(214, 68, 68)';
    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 10;
    ctx.strokeStyle = 'rgb(0, 0, 0)';

    ctx.beginPath();

    var sliceWidth = canvas.width * 1.0 / viz.frequencyBinCount;
    var x = 0;

    for(var i = 0; i < viz.frequencyBinCount; i++) {

        var v = arrayTwo[i] / 128.0;
        var y = v * canvas.height/2;

        if(i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
        
        x += sliceWidth;
    }

    ctx.lineTo(canvas.width, canvas.height/2);
    ctx.stroke();

}

draw();

var constraints = { audio: true, video: false };
navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {

    var mediaRecorder = new MediaRecorder(stream);

    var recording = [];

    mediaRecorder.ondataavailable = function(e) {
        recording.push(e.data);
    };

    var source = context.createMediaStreamSource(stream);
    // viz.getByteTimeDomainData(arrayOne);
    source.connect(lpFilter);
    lpFilter.connect(hpFilter);
    hpFilter.connect(viz);

    var record = document.getElementById("record");
    var stop = document.getElementById("stop");

    var repeatDraw;

    // viz.getByteTimeDomainData(arrayTwo);

    var newArray = new Uint8Array(2048);

    record.onclick = function() {
    viz.connect(context.destination);
        mediaRecorder.start();
        repeatDraw = setInterval(() => {
            // mediaRecorder.requestData();
            viz.getByteTimeDomainData(arrayTwo);
            draw();
        }, 1000);
        record.style.background = "red";
        record.style.color = "black";
    }

    stop.onclick = function() {
    viz.disconnect(context.destination);
      mediaRecorder.requestData();
      mediaRecorder.stop();
      record.style.background = "";
      record.style.color = "";
      clearInterval(repeatDraw);
    }

    mediaRecorder.onstop = function(e) {
      console.log("recorder stopped");

      console.log("arrayOne", arrayOne);

      var clipName = prompt('Enter a name for your sound clip');

      var clipContainer = document.createElement('article');
      var clipLabel = document.createElement('p');
      var audio = document.createElement('audio');
      var deleteButton = document.createElement('button');

      clipContainer.classList.add('clip');
      audio.setAttribute('controls', '');
      deleteButton.innerHTML = "Delete";
      clipLabel.innerHTML = clipName;

      clipContainer.appendChild(audio);
      clipContainer.appendChild(clipLabel);
      clipContainer.appendChild(deleteButton);
      soundClips.appendChild(clipContainer);

      var blob = new Blob(recording, { 'type' : 'audio/ogg; codecs=opus' });
      recording = [];
      var audioURL = window.URL.createObjectURL(blob);
      audio.src = audioURL;

        var reader = new FileReader();
        reader.addEventListener("loadend", function() {
            // while (reader.result.byteLength % 4 !== 0) {
            //     console.log("BAD");

            // }
            var buffer = new Uint8Array(reader.result);

            const findFundamentalFreq = (buffer, sampleRate) => {
                // We use autocorrelation to find the fundamental frequency.

                // In order to correlate the signal with itself (hence the name of the algorithm), we will check two points 'k' frames away.
                // The autocorrelation index will be the average of these products. At the same time, we normalize the values.
                // Source: http://www.phy.mty.edu/~suits/autocorrelation.html

                // the default sample rate, depending on the hardware, is 44100Hz or 48000Hz.
                // a 'k' range between 120 and 650 covers signals ranging from ~70Hz to ~350Hz, which is just a little broader than the average frequency range for human speech (80-260Hz, per Wikipedia).
                var n = 1024, bestR = 0, bestK = -1;
                for(var k = 120; k <= 650; k++){
                    var sum = 0;

                    for(var i = 0; i < n; i++){
                        sum += ((buffer[i] - 128) / 128) * ((buffer[i + k] - 128) / 128);
                    }

                    var r = sum  / (n + k);

                    if(r > bestR){
                        bestR = r;
                        bestK = k;
                    }

                    if(r > 0.95) {
                        // Let's assume that this is good enough and stop right here
                        break;
                    }
                }

                console.log("bestR", bestR);

                if(bestR > 0.0025) {
                    // The period (in frames) of the fundamental frequency is 'bestK'. Getting the frequency from there is trivial.
                    var fundamentalFreq = sampleRate / bestK;
                    return fundamentalFreq;
                }
                else {
                    // We haven't found a good correlation
                    return -1;
                }
            };

            var pitchCon = new PitchAnalyzer(44100);

            var n = 1001;
            var i = 1;

            var tones = [];
            var vols = [];

            while (n < buffer.length && i < 50000) {

                console.log("f0....", findFundamentalFreq(newArray.slice(n-1000, n-99), 44100));
                // console.log("newArray", newArray);
                console.log("f0", findFundamentalFreq(buffer.slice(n-1000, n-99), 44100));

                pitchCon.input(buffer.slice(n-1000, n));
                /* Process the current input in the internal buffer */
                pitchCon.process();
                // console.log("pitchCon instance", pitchCon);

                var toneOne = pitchCon.findTone();

                if (toneOne === null) {
                    console.log('No tone found!');
                    tones.push(300);
                    vols.push(0);
                } else {
                    console.log('Found a toneOne, frequency:', toneOne.freq, 'volume:', toneOne.db);
                    tones.push(toneOne.freq);
                    vols.push(toneOne.db);
                }
                n = n+1000;
                i++;
            }

            var tonesY = function() {
                var array = [];
                for (let i = 0; i < tones.length; i++) {
                    array.push(i);
                }
                return array;
            }

            var data = [{x:tonesY(), y:tones, type: 'tones'}];
            var layout = {fileopt : "overwrite", filename : "tones"};

            Plotly.plot(data, layout, function (err, msg) {
                if (err) return console.log(err);
                console.log(msg);
            });

            console.log('tones', tones);
            console.log('vols', vols);

        });
        reader.readAsArrayBuffer(blob);

      deleteButton.onclick = function(e) {
        var evtTgt = e.target;
        evtTgt.parentNode.parentNode.removeChild(evtTgt.parentNode);
      }
    }

}).catch(function(err) {
    console.log(err);
});

