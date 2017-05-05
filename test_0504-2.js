const context = new (window.AudioContext || window.webkitAudioContext)();
const detectPitch = require('detect-pitch');

let n = 2048;

let audioBuffer, 
		sourceNode,
		analyserNode,
		bufferLength,
		dataArray,
		signal;

sourceNode = context.createBufferSource();
sourceNode.connect(context.destination);
analyserNode = context.createAnalyser();
sourceNode.connect(analyserNode);
analyserNode.fftSize = n;

bufferLength = analyserNode.frequencyBinCount
dataArray = new Float32Array(bufferLength);

function loadSound(url) {
	console.log(dataArray)
	console.log(analyserNode)
	console.log(signal);
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    // When loaded decode the data
    request.onload = function() {

        // decode the data
        context.decodeAudioData(request.response, function(buffer) {
            // when the audio is decoded play the sound
             sourceNode.buffer = buffer;
             sourceNode.start(0);
            // get freq data in an array:
        });
    }
    request.send();
    console.log(signal);
}

function logger() {
	console.log(signal);
	console.log('in logger');
	console.log('data array: ', dataArray);
	console.log('fundamental frequency: ', Math.round(n / detectPitch(signal)));
}
loadSound('marcCow.wav');

signal = analyserNode.getFloatFrequencyData(dataArray);

logger();

