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

// load the specified sound
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

            // get freq data in an array:



        }, onError);
    }
    request.send();
}


function playSound(buffer) {
    console.log('inside playSound')
    sourceNode.buffer = buffer;
    console.log('sourceNode.buffer', sourceNode.buffer)
    sourceNode.start(0);
}

// log if an error occurs
function onError(e) {
    console.log(e);
}

window.log = () => {
  const bufferLength = analyserNode.frequencyBinCount // half of the fft size
  console.log(bufferLength)
  const dataArray = new Float32Array(bufferLength)
  analyserNode.getFloatFrequencyData(dataArray)
  console.log('dataArray', dataArray)
}