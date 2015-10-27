var fs = require('fs')
var Configstore = require('configstore')
var pkg = require('./package.json');
var defaults = {'certFilePath': 'certificates/cert.pem',
				'keyFilePath':'certificates/key.pem',
				'writeFilename': 'certificates/certificate.p12'}
var conf = new Configstore(pkg.name);

var pushtomeApp = angular.module('pushtomeApp');

pushtomeApp.controller('APNS', ['$scope', 'growl', function ($scope, growl) {
	$scope.data = {}
	$scope.config = {}

	$scope.boot = function () {
		$scope.data = conf.get('apns')
		$scope.data.apns_payload_str = '{"aps":{"alert":"modified alert","badge":10}}'
		conf.set('apns_config', defaults)
		$scope.config = conf.get('apns_config')
		$scope.data.certificates_exists = $scope.checkCertificates()
	}

	$scope.clear = function () {
		$scope.data = {}
	}

	$scope.remember_values = function (data) {
		try{
			data.payload_json = JSON.parse($scope.data.apns_payload_str)
		}catch(e){
			growl.error("Please check gcm payload", {'title': 'Invalid JSON'});
			return false
		}
		conf.set('apns',data)
		growl.success('Available data saved.')
		return true
	}

	$scope.checkCertificates = function() {
		if(fs.existsSync($scope.config.certFilePath) && fs.existsSync($scope.config.keyFilePath)){
			return true
		}
		return false
	}

	$scope.generateKeys = function(){
		var passphrase = $scope.data.p12_passphrase
		var writeFilename = $scope.config.writeFilename
		var certFilePath = $scope.config.certFilePath
		var keyFilePath = $scope.config.keyFilePath
		var exec = require('child_process').execSync;
		exec("openssl pkcs12 -in "+ writeFilename +" -out "+ certFilePath +" -clcerts -nokeys -passin pass:" + passphrase);
		exec("openssl pkcs12 -in "+ writeFilename +" -out "+ keyFilePath +" -nocerts -nodes -passin pass:" + passphrase);
		growl.success("Pem keys generated", {'title': 'Keys are generated'})
	}

	$scope.send_puh_notification = function(){
		var certFilePath = $scope.config.certFilePath
		var keyFilePath = $scope.config.keyFilePath
		var passphrase = $scope.config.passphrase
		var push_token = $scope.data.push_token

		if(!$scope.checkCertificates()){
			growl.success("Please upload p12 file.", {'title': 'Certificates not found.'})
			return
		}
		var options = { 'passphrase': passphrase, 'cert': certFilePath, 'key': keyFilePath };
		var apnConnection = new apn.Connection(options);
		if(!push_token){
			growl.error("Unable to send notification.", {'title': 'Token not defined'})
			return;
		}
		try{
			var myDevice = new apn.Device(push_token);
		}catch(e){
			growl.error('Invalid hex string', {'title': 'Check push token'})
			return
		}
		var note = new apn.Notification();
		note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
		note.badge = 10;
		note.sound = "ping.aiff";
		note.alert = "Default message from Push-To-Me desktop app.";
		note.payload = {'messageFrom': 'An offer '};
		user_payload = {}
		try{
			if($scope.data.apns_payload_str)
				$scope.data.payload_json = JSON.parse($scope.data.apns_payload_str)
		}catch(e){
			growl.error('JSON is invalid', {'title': 'Error'})
			return
		}
		if($scope.data.payload_json.hasOwnProperty('aps')){
			aps = $scope.data.payload_json['aps']
			if(aps.hasOwnProperty('expiry')){
				note.expiry = aps['expiry']
			}
			if(aps.hasOwnProperty('badge')){
				note.badge = aps['badge']
			}
			if(aps.hasOwnProperty('sound')){
				note.sound = aps['sound']
			}
			if(aps.hasOwnProperty('alert')){
				note.alert = aps['alert']
			}
			delete $scope.data.payload_json['aps']
		}
		if(Object.keys($scope.data.payload_json).length > 0){
			note.payload = $scope.data.payload_json
		}
		try{
			apnConnection.pushNotification(note, myDevice);
			growl.success('Notification sent', {'title': 'Please check respective device.'})
		}catch(ex){
			growl.error('Error in sending notification')
			console.log("eeeeeeeee", ex)
		}
	}

	$scope.apns_handler = function(form){
		if (form) {
			form.$setPristine();
			form.$setUntouched();
		}
		if(form.$valid){
			$scope.send_puh_notification()
		}
	}

	$scope.apns_upload_certificate = function(){
		var filename = $scope.data.p12_certificate
		if(filename && fs.existsSync(filename)){
			// filename='/Users/pranav/Downloads/VESSEL.p12'
			var writeFilename = $scope.config.writeFilename
			try{
				data = fs.readFileSync(filename)
				res = fs.writeFileSync(writeFilename, data)
				$scope.generateKeys()
				growl.success("Certificate uploaded.")
				$scope.data.certificates_exists = $scope.checkCertificates()
			}catch(e){
				growl.error('Check password once', {'title':"Unable to use given certificate."})
				console.log(e)
			}
		}else{
			growl.error("Certificate path is not correct.")
		}
	}

}])
