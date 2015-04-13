
var config = require('./config')
NODE_ENV = "production"
var apn = require('apn');
var express = require('express');
var multer = require('multer');
var app = express();

var done = false;
var push_token = null;

// File uploading setup for middleware MULTER
app.use(multer({ dest: './uploads/',
    rename: function (fieldname, filename) {
        return filename+Date.now();
    },
    onFileUploadStart: function (file) {
        console.log('Upload started for - ' + file.originalname)
    },
    onFileUploadComplete: function (file) {
        console.log(file.fieldname + ' completed uploading to ' + file.path)
        done=true;
    }
}));

// Display form to submit p12 and passphrase
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

// Upload p12 file and break it into key.pem and cert.pem
app.post('/upload', function(req, res){
    if(done){
        var help_string = "GET 127.0.0.1:"+config.port+"/ios/YOUR_TOKEN"
        // creates SYNC children to generate key.pem and cert.pem
        var exec = require('child_process').execSync;
        console.log("Generating cert.pem")
        exec("openssl pkcs12 -in "+ req.files.certificate.path +" -out cert.pem -clcerts -nokeys -passin pass:" + req.body.passphrase);
        console.log("Generating key.pem")
        exec("openssl pkcs12 -in "+ req.files.certificate.path +" -out key.pem -nocerts -nodes -passin pass:" + req.body.passphrase);
        res.end('Certificate uploaded. Trying to generate key.pem and cert.pem\n'+ help_string);
    }
})

// Accept push_token and send notification to it.
app.get('/ios/:push_token',function(req, res){
  push_token = req.params.push_token;
  res.end(JSON.stringify({'status':true, 'token':push_token}));
  send_puh_notification(push_token)
  if(config.INTERVAL_SEC > 0){
      bind_func = send_puh_notification.bind(this, push_token)
      setInterval(bind_func, config.INTERVAL_SEC)
  }
});

// Start listening to configurable port
app.listen(config.port, function(){
    console.log('Working on', config.port);
    console.log("GET 127.0.0.1:"+config.port+"/");
    console.log("GET 127.0.0.1:"+config.port+"/ios/YOUR_TOKEN");
})

// Use 'apn' and send push notification to given token
function send_puh_notification(push_token){
  var options = { 'passphrase': config.passphrase };
  var apnConnection = new apn.Connection(options);
  if(!push_token){
    console.log("unable to send notification. Token not defined");
    return;
  }
  console.log("sending to....", push_token);
  var myDevice = new apn.Device(push_token);
  var note = new apn.Notification();
  note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
  note.badge = 3;
  // note.sound = "ping.aiff";
  note.sound = "default";
  note.alert = "New notification.timestamp=" + (Math.floor(new Date() / 1000 )+ ", count="+config.NOTIFICATION_CNT++);
  note.payload = {'messageFrom': 'Push-To-Me', 'timestamp':Math.floor(new Date() / 1000), 'count':config.NOTIFICATION_CNT};
  try{
    apnConnection.pushNotification(note, myDevice);
  }catch(ex){
    console.log("eeeeeeeee", ex)
  }
}

// YES.. have to do this. It keeps the server running.
process.on('uncaughtException', function(err) {
  console.log('Caught exception: ' + err);
  console.log('Check your certificate and passphrase');
});
