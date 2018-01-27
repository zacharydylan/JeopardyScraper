var cron = require('cron').CronJob;
var fs = require('fs');
var request = require('request');
var path = require('path');
var express = require('express');
var exec = require('child_process').exec;

var app = express();

app.listen(3000, function(){
    console.log('Waiting to run Jeopardy jobs.')
});

new cron('00 40 11 * * 1-5', function() {
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
}, null, true, 'America/New_York');

new cron('00 50 11 * * 1-5', function() {
    function fromDir(startPath,filter,callback){

        //console.log('Starting from dir '+startPath+'/');
        var f = new RegExp(filter)

        if (!fs.existsSync(startPath)){
            console.log("no dir ",startPath);
            return;
        }

        var files=fs.readdirSync(startPath);
        for(var i=0;i<files.length;i++){
            var filename=path.join(startPath,files[i]);
            if (f.test(filename)) callback(filename);
        };
    };

    fromDir(__dirname,/\.mp4$/,function(filename){
        var r = new RegExp(/\/(Jeopardy.+)$/);
        var q = new RegExp(/mp4(-.+)$/);
        var e = r.exec(filename);
        var file = e[1];
        var s = new RegExp(q.exec(file)[1]);
        file = file.replace(s, '').replace(/\s/, '');
        fs.renameSync(filename, path.join(__dirname, 'downloads', file))
    });
}, null, true, 'America/New_York');
