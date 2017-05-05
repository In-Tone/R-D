const PitchAnalyzer = require('./pitch');
const context = new (window.AudioContext || window.webkitAudioContext)();
const detectPitch = require('detect-pitch');

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

// javascriptNode.onaudioprocess = function () {
//     // get the average for the first channel
//     var array = new Float32Array(analyser.frequencyBinCount);
//     analyser.getFloatFrequencyData(array);
//     console.log("sourceNode", sourceNode.buffer);
//     var data = sourceNode.buffer.getChannelData(0);
//     /* Create a new pitch detector */
//     var pitchOne = new PitchAnalyzer(44100);
//     console.log("data", data);
//     /* Copy samples to the internal buffer */
//     // pitchOne.input(sourceNode.buffer.getChannelData(0).slice(1000,10000));
//     var n = 1001;
//     var i = 1;
//     while (n < data.length && i < 50000) {
//         pitchOne.input(data.slice(n-1000, n));
//         /* Process the current input in the internal buffer */
//         pitchOne.process();
//         console.log("pitchOne instance", pitchOne);
//         var toneOne = pitchOne.findTone();
//         if (toneOne === null) {
//             console.log('No tone found!');
//         } else {
//             console.log('Found a toneOne, frequency:', toneOne.freq, 'volume:', toneOne.db);
//         }
//         n = n+1000;
//         i++;
//     }
// }


function getData() {
	sourceNode = context.createBufferSource();

	let promise = new Promise(function(resolve, reject) {

		var request = new XMLHttpRequest();

		request.open('GET', 'marcCow.wav', true);

		request.responseType = 'arraybuffer';

		request.onload = function() {
			var audioData = request.response;

			context.decodeAudioData(audioData, function(buffer) {
				sourceNode.buffer = buffer;
				// console.log('SOURECE NODE', sourceNode);

				// sourceNode.connect(context.destination);
				console.log('before resolve')
				resolve(sourceNode);
				// console.log('after resolve');
			},

			function(e) { 
				// console.log('error' + e.err); 
				reject();
			});
		}
		// console.log('end', request);
		request.send();
	});

	promise.then(sourceNode => {
		audioBuffer = sourceNode.buffer.getChannelData(0);
		// console.log('in the promise chain: ', audioBuffer);

		let increment = audioBuffer.length / 4096; 

		let n = increment + 1;

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


		let unique = abbreviated.filter(elem => {
			if (elem !== null) return elem
		});

		// console.log('the result: ',semiresult);
		console.log('an abbreviated set: ',abbreviated);
		console.log('unique results: ',unique)


		let roundDown = unique.map(num => Math.floor(num));

		// DO AUTOCORRELATE ON ROUNDOWN

		console.log(roundDown.join(' '));

		console.log(semiresult.map(num => Math.floor(num)).join(' '));

		let result = semiresult.map(num => Math.floor(num));

		acf = autocorrelation(result)
		console.log('autocorrelated', acf)

		let graphThis = acf.map(num => Math.floor(num * 100)).join(' ');

		console.log(graphThis);


	});
};

getData();

console.log('audioBuffer: ', audioBuffer);


// pitch.input(sourceNode.start(0));


