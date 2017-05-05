var constraints = {};

console.log("HELLO");

navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
  /* use the stream */
}).catch(function(err) {
  /* handle the error */
});