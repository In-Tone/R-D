var detectPitch = require('detect-pitch')

const context = new (window.AudioContext || window.webkitAudioContext)();

let audioBuffer;
let sourceNode;
let analyserNode;

// load the sound
setupAudioNodes();
loadSound('sandwich.mp3');	

function setupAudioNodes() {
    // create a buffer source node
    sourceNode = context.createBufferSource();
    // and connect to destination
    sourceNode.connect(context.destination);
    analyserNode = context.createAnalyser();
    sourceNode.connect(analyserNode)
    analyserNode.fftSize = 2048; // size of fft used to determine the freq domain
}

function loadSound(url) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    // When loaded decode the data
    request.onload = function() {

        // decode the data
        context.decodeAudioData(request.response, function(buffer) {
            // when the audio is decoded play the sound
             playSound(buffer);

        });
    }
    request.send();
}


function playSound(buffer) {
	console.log('buffer type', buffer.length)
    sourceNode.buffer = buffer;
    console.log('sourceNode.buffer', sourceNode.buffer)
    sourceNode.start(0);
}