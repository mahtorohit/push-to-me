var gcm = require('node-gcm');
var apn = require('apn');
// Create a message
// ... with default values
var message = new gcm.Message();
var push_token = null;
var server_key = null;

var pushtomeApp = angular.module('pushtomeApp', []);

pushtomeApp.controller('GCM', function ($scope) {
  $scope.server_key = "AIzaSyC8YhlT42qohZVp4kM4RGi9DZbpldORdIc"
  $scope.push_token = "APA91bE9bj8c-4efslxIpf3C3Yolx_hQQcax_YYn_rf7Hdaz-Uhjr4Sv8XoVlJcwVb-gXJ_pcJzqw16dPOCdpYRPAAfap3duBD6Esv5x4xE3hAYw1O5nvtY"
  $scope.message = new gcm.Message()
  $scope.gcm_payload_str = '{"example":"GCM server"}'

  $scope.send_notification = function(form) {
    if (form) {
      form.$setPristine();
      form.$setUntouched();
    }
  }
});



function gcm_handler(){
  server_key = document.getElementById('gcm_server_key').value
  push_token = document.getElementById('gcm_push_token').value
  try{
    payload_str = document.getElementById('gcm_payload').value
    payload = JSON.parse(payload_str)
  }catch(ex){
    console.log('payload is not valid json')
    document.getElementById('android_result').value = 'payload is not valid json';
    return 0
  }
  send_puh_notification(server_key, push_token, payload)
}

function send_puh_notification(server_key, push_token, payload){
  // document.getElementById('andorid_form').formValidation()
  if(server_key && push_token){
    info = "Operaion in progress.."
    // Set up the sender with you API key
    var sender = new gcm.Sender(server_key);
    // ... trying only once
    if(payload){
      message.addData(payload);
    }else{
      message.addData({'default':'data'});
    }
    
    sender.sendNoRetry(message, push_token, function(err, result) {
      if(err){
        console.error('GCM reply:', err);
        if(typeof err === 'object'){
          if(err['syscall'] === 'getaddrinfo'){
            console.log('Please check your internet connection')
            msg = 'Error:: Please check your internet connection'
          }
        }else if (typeof err === 'number'){
          if(err === 401){
            console.log("Status : 401. invalid server key")
            msg = 'Error:: Status-401. invalid server key'
          }
        }
      }else{
        console.log('GCM reply:', result);
        msg = 'Success:: ' + result.success;
      }
      document.getElementById('android_result').value = msg;
    });
  }else{
    console.log("Missing server_key OR push_token")
    info = "Missing server_key OR push_token"
  }
  document.getElementById('android_result').value = info;
}
