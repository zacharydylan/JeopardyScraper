var You = require('youtube-dl');
var fs = require('fs');
var request = require('request');
var path = require('path');
var exec = require('child_process').exec;

request('https://www.reddit.com/user/jibjabjrjr.json', function (error, response, body) {
    console.log('error:', error); // Print the error if one occurred
    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    var comments = JSON.parse(body).data.children;
    var r = new RegExp(/Drive \[here\]\((https\:\/\/drive.google.com\/open\?id\=(\S+))\)/)
    var url;
    var title;
    var already = fs.readFileSync('./id.txt', 'utf8');

    comments.forEach(function(a){
        var info = r.exec(a.data.body);
        var bool = false;
        if(info){
            var re = new RegExp(info[2], 'g');
            bool = re.test(already) ? true : false;
            if(!bool){
                url = info[1];
                already = already + info[2] +'\n'
                var command = 'youtube-dl '+url;
                var dir = exec(command, function(err, stdout, stderr) {
                  if (err) {
                    // should have err.code here?
                  }
                  console.log(stdout);
                });

                dir.on('exit', function (code) {
                  fs.writeFileSync('./id.txt', already)
                });
            }
            else{
                console.log('Skipping episode, already have it.')
            }
        }
    })
});
