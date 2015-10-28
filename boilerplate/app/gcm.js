var gcm = require('node-gcm');
var apn = require('apn');
var Configstore = require('configstore')
var pkg = require('./package.json');
var conf = new Configstore(pkg.name, {});

var pushtomeApp = angular.module('pushtomeApp', ['angular-growl']);

pushtomeApp.config(['growlProvider', function(growlProvider) {
  growlProvider.globalTimeToLive(4000);
  growlProvider.globalDisableCountDown(true);
  growlProvider.globalPosition('top-center');
}]);

pushtomeApp.controller('GCM', ['$scope', 'growl', function ($scope, growl) {
  // server_key = "AIzaSyC8YhlT42qohZVp4kM4RGi9DZbpldORdIc"
  // push_token = "APA91bE9bj8c-4efslxIpf3C3Yolx_hQQcax_YYn_rf7Hdaz-Uhjr4Sv8XoVlJcwVb-gXJ_pcJzqw16dPOCdpYRPAAfap3duBD6Esv5x4xE3hAYw1O5nvtY"
  $scope.message = new gcm.Message()
  $scope.data = {}

  $scope.boot = function () {
	$scope.data = conf.get('gcm')
  }

  $scope.clear = function () {
	$scope.data = {}
  }

  $scope.remember_values = function (data) {
	try{
	  data.payload_json = JSON.parse($scope.data.gcm_payload_str)
	}catch(e){
	  growl.error("Please check gcm payload", {'title': 'Invalid JSON'});
	  return false
	}
	conf.set('gcm',data)
	growl.success('Data saved.')
	return true
  }

  $scope.send_puh_notification = function() {
	var sender = new gcm.Sender($scope.data.server_key);
	if($scope.data.payload_json){
	  $scope.message.addData($scope.data.payload_json);
	}else{
	  $scope.message.addData({'default':'data'});
	}
	sender.sendNoRetry($scope.message, $scope.data.push_token, function(err, result) {
	  if(err){
		console.log(err)
		if(typeof err === 'object'){
		  switch(err['syscall']){
			case 'getaddrinfo':
			  growl.error("Please check your internet connection", {'title': 'Connection Issue'});
		  }
		}else if (typeof err === 'number'){
		  switch(err){
			case 401:
			  growl.error("Received 404", {'title': 'Invalid server key'});
			  break;
			case 400:
			  growl.error("Received 400", {'title': 'Invalid push token'});
			  break;
		  }
		}else{
		  growl.error("", {'title': 'Error in sending.'});
		}
	  }else{
		growl.success("Please check respective device", {'title': 'Notification sent.'});
	  }
	});
  }

  $scope.gcm_handler = function(form) {
	if (form) {
	  form.$setPristine();
	  form.$setUntouched();
	}
	if(form.$valid){
	  $scope.send_puh_notification()
	}
  }
}]);
