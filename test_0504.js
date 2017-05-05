const PitchAnalyzer = require('./pitch');
const context = new (window.AudioContext || window.webkitAudioContext)();
const detectPitch = require('detect-pitch');

console.log(PitchAnalyzer);

let pitch = new PitchAnalyzer(44100); 
let sourceNode;
var audioBuffer;

function getData() {
	sourceNode = context.createBufferSource();

	let promise = new Promise(function(resolve, reject) {

		var request = new XMLHttpRequest();

		request.open('GET', 'sandwich.mp3', true);

		request.responseType = 'arraybuffer';

		request.onload = function() {
			var audioData = request.response;

			context.decodeAudioData(audioData, function(buffer) {
				sourceNode.buffer = buffer;
				console.log('SOURECE NODE', sourceNode);

				sourceNode.connect(context.destination);
				console.log('before resolve')
				resolve(sourceNode);
				console.log('after resolve');
			},

			function(e) { 
				console.log('error' + e.err); 
				reject();
			});
		}
		console.log('end', request);
		request.send();
	});

	promise.then(sourceNode => {
		audioBuffer = sourceNode.buffer.getChannelData(0);
		console.log('in the promise chain: ', audioBuffer);
		console.log('is this an array? \n', Array.isArray(audioBuffer))
		console.log(typeof audioBuffer)
		pitch.input(audioBuffer);
		pitch.process();

		let tone = pitch.findTone();
		console.log(tone.freq); 
	});
};

getData();

console.log('audioBuffer: ', audioBuffer);


// pitch.input(sourceNode.start(0));


