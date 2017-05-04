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