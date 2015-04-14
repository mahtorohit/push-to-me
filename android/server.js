
var config = require('./config')
var gcm = require('node-gcm');
var express = require('express');
var app = express();
// Create a message
// ... with default values
var message = new gcm.Message();
var push_token = null;
var server_key = null;

app.get('/:server_key/:push_token',function(req, res){
  push_token = req.params.push_token;
  server_key = req.params.server_key;
  res.end(JSON.stringify({'status':true, 'token':push_token}));
  send_puh_notification(push_token)
  if(config.interval_sec > 0){
      bind_func = send_puh_notification.bind(this, push_token)
      setInterval(bind_func, config.interval_sec)
  }
});

app.listen(config.port, function(){
    console.log('Working on', config.port);
    console.log("GET 127.0.0.1:"+config.port+"/");
    console.log("GET 127.0.0.1:"+config.port+"/SERVER_KEY/YOUR_TOKEN");
})

// ... or as a data object (overwrites previous data object)
message.addData({
    key1: 'message1',
    key2: 'message2'
});

function send_puh_notification(push_token){
  if(server_key && push_token){
    // Set up the sender with you API key
    var sender = new gcm.Sender(server_key);
    // ... trying only once
    sender.sendNoRetry(message, push_token, function(err, result) {
      if(err)
        console.error('GCM reply:', err);
      else
        console.log('GCM reply:', result);
    });
  }else{
    console.log("Missing server_key OR push_token")
  }
}
