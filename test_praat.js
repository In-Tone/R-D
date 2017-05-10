var praatScript = require('praat-script');


function test(){
   return praatScript([
    'Create Sound as pure tone: "tone", 1, 0, 0.1, 44100, 440, 0.2, 0.01, 0.01' + '\r\n' +
    'Play'
    ]).run(function(err) {
        if (err) {
        console.error(err);
        }
        else {

        console.log('Success!');
        }
    });

}

test();
