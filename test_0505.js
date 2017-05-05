const PitchAnalyzer = require('./pitch');
const context = new (window.AudioContext || window.webkitAudioContext)();
const detectPitch = require('detect-pitch');
const timeseries = require("timeseries-analysis");
const autocorrelation = require('autocorrelation').autocorrelation;


console.log(PitchAnalyzer);

let pitch = new PitchAnalyzer(44100); 
let sourceNode;
var audioBuffer;
var javascriptNode;
var acf;


// loadSound("sandwich.mp3");
function setupAudioNodes() {

    javascriptNode = context.createScriptProcessor(2048, 1, 1);

    javascriptNode.connect(context.destination);

}
setupAudioNodes();

// function getData() {
// 	sourceNode = context.createBufferSource();

// 	let promise = new Promise(function(resolve, reject) {

// 		var request = new XMLHttpRequest();

// 		request.open('GET', 'marcCow.wav', true);

// 		request.responseType = 'arraybuffer';

// 		request.onload = function() {
// 			var audioData = request.response;

// 			context.decodeAudioData(audioData, function(buffer) {
// 				sourceNode.buffer = buffer;
// 				resolve(sourceNode);
// 			},

// 			function(e) { 
// 				reject();
// 			});
// 		}
// 		request.send();
// 	});

// 	promise.then(sourceNode => {
// 		audioBuffer = sourceNode.buffer.getChannelData(0);

// 		let increment = audioBuffer.length / 4096; 

// 		let n = increment + 1;

// 		let semiresult = [];
// 		let abbreviated = ['abbreviated:'];

// 		while (n < audioBuffer.length) {
// 			let testBuffer = audioBuffer.slice(n - increment, n);
// 			pitch.input(testBuffer);
// 			pitch.process();

// 			var tone = pitch.findTone();
// 			semiresult.push(tone);

// 			if (tone !== abbreviated[abbreviated.length - 1]) {
// 				abbreviated.push(tone)
// 			}
// 			n += increment;
// 		}

// 		// let unique = abbreviated.filter(elem => {
// 		// 	if (!isNaN(elem)) return elem;
// 		// }).map(num => Math.floor(num));
// 		let unique = abbreviated.map(elem => {
// 			if (elem === null) {
// 				return 0
// 			} else {
// 				return Math.floor(elem)
// 			}
// 		}).slice(1); // the `.slice(1)` because the abbreviated function is all messed up

// 		console.log(unique);
// 		return unique;
// 	});
// };

// let frequencies = getData();


//##########################################################################################################//
//##########################################################################################################//
//																																																					//
//																					TIME SERIES ANALYSIS																						//
//																																																					//
//##########################################################################################################//
//##########################################################################################################//

// EVERYTHING IS BUILD ON THE PROMISE CHAIN...

function getData() {
	sourceNode = context.createBufferSource();

	let promise = new Promise(function(resolve, reject) {

		var request = new XMLHttpRequest();

		request.open('GET', 'marcOW.wav', true);

		request.responseType = 'arraybuffer';

		request.onload = function() {
			var audioData = request.response;

			context.decodeAudioData(audioData, function(buffer) {
				sourceNode.buffer = buffer;
				resolve(sourceNode);
			},

			function(e) { 
				reject();
			});
		}
		request.send();
	});

	promise.then(sourceNode => {
		// audio data is made using a sampling rate of 44,100 Hz.
		audioBuffer = sourceNode.buffer.getChannelData(0);
		console.log(audioBuffer.length)
		console.log(audioBuffer)
		// the increment is our BIN: 
		// we pass our bin to `pitch.js`s `findTone()` function`
		// according to Mark's paper, a good bin for a low-freq speaker needs to have ~150 samples in it; for high-freq speaker, ~45; hence the hardcoding
		// in THIS case, the 150 is relative to Mark's cow.wav sample
		let increment = 128;
		// let increment = 256;
		// let increment = audioBuffer.length / 4096; 
			// in this increment is ~33; 
		// Collaborator's Zero's suggestion
		// let n = increment * 2 + 1;
		let n = increment;

		let semiresult = [];
		let abbreviated = ['abbreviated:'];

		while (n < audioBuffer.length) {
			let testBuffer = audioBuffer.slice(n - increment, n);
			pitch.input(testBuffer);
			pitch.process();

			var tone = pitch.findTone();
			semiresult.push(tone);

			if (tone !== abbreviated[abbreviated.length - 1]) {
				abbreviated.push(tone)
			}
			n += increment;
		}
		// replace `abbreviated` with `semiresult` for working with *all* data points
		let unique = abbreviated.map(elem => {
			if (elem === null) {
				return 0
			} else {
				return Math.floor(elem)
			}
		}).slice(1) // the `.slice(1)` because the abbreviated function is all messed up
			.map((num, i, array) => {
				if (num === 0 && i !== 0 && i !== array.length - 1) {
					return num = (array[i-1] + array[i + 1]) / 2
				} else {
					return num
				}
			}); 

		console.log(unique);
		return unique;
	})
		.then(numSet => {
			return numSet.map((num, i) => [i+1, num]);
		})
		.then(dataSet => {
			let t = new timeseries.main(dataSet)
			// let dataUrl = t.smoother({ period: 500}).noiseData().smoother({ period: 2 }).smoother({ period: 2 }).chart();
			let pureData = t.chart();
			console.log(pureData);
		});
};

getData();

