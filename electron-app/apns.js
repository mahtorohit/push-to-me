var fs = require('fs')
var Configstore = require('configstore')
var pkg = require('./package.json');
var defaults = {'certFilePath': 'certificates/cert.pem',
				'keyFilePath':'certificates/key.pem',
				'passphrase': '',
				'writeFilename': 'certificates/certificate.p12'}
var conf = new Configstore(pkg.name, defaults);

function checkCertificates () {
	var certFilePath = conf.get('certFilePath')
	var keyFilePath = conf.get('keyFilePath')
	if(fs.existsSync(certFilePath) && fs.existsSync(keyFilePath)){
		return true
	}
}

function updateStatus(msg){
	msg = msg || ""
	document.getElementById('ios_result').value = msg;
}

function apns_upload_certificate(){
	updateStatus('validating..')
	var filename = document.getElementById('p12_certificate').value
	if(filename && fs.existsSync(filename)){
		// filename='/Users/pranav/Downloads/VESSEL.p12'
		p12_passphrase = document.getElementById('p12_passphrase').value
		var writeFilename = conf.get('writeFilename')
		try{
			data = fs.readFileSync(filename)
			conf.set('passphrase',p12_passphrase)
			res = fs.writeFileSync(writeFilename, data)
			updateStatus('Certificate uploaded')
			updateStatus('Generating keys now')
			generateKeys()
			updateStatus("Done.")
		}catch(e){
			updateStatus('Exception ' + e)
			console.log(e)
		}
	}else{
		updateStatus('Certificate path is not correct.')
	}
}

function generateKeys(){
	var passphrase = conf.get('passphrase')
	var writeFilename = conf.get('writeFilename')
	var certFilePath = conf.get('certFilePath')
	var keyFilePath = conf.get('keyFilePath')
	var exec = require('child_process').execSync;
    updateStatus("Generating cert.pem")
    exec("openssl pkcs12 -in "+ writeFilename +" -out "+ certFilePath +" -clcerts -nokeys -passin pass:" + passphrase);
    updateStatus("Generating key.pem")
    exec("openssl pkcs12 -in "+ writeFilename +" -out "+ keyFilePath +" -nocerts -nodes -passin pass:" + passphrase);
}

function send_puh_notification(push_token){
	var certFilePath = conf.get('certFilePath')
	var keyFilePath = conf.get('keyFilePath')
	var passphrase = conf.get('passphrase')

	if(!checkCertificates()){
		updateStatus('Certificates not found. Please upload first.')
		return
	}
	var options = { 'passphrase': passphrase, 'cert': certFilePath, 'key': keyFilePath };
	var apnConnection = new apn.Connection(options);
	if(!push_token){
		console.log("Unable to send notification. Token not defined");
		updateStatus("Unable to send notification. Token not defined")
		return;
	}
	console.log("sending to....", push_token);
	updateStatus("sending to...."+ push_token)
	var myDevice = new apn.Device(push_token);
	var note = new apn.Notification();
	note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
	note.badge = 10;
	note.sound = "ping.aiff";
	note.alert = "Default message from Push-To-Me desktop app.";
	note.payload = {'messageFrom': 'An offer '};
	user_payload = {}
	try{
		user_payload_str = document.getElementById('apns_payload').value
		console.log(user_payload_str)
		if(user_payload_str)
			user_payload = JSON.parse(user_payload_str)
		console.log(user_payload)
	}catch(e){
		console.log(e)
		updateStatus("invalid json payload")
		return
	}
	if(user_payload.hasOwnProperty('aps')){
		aps = user_payload['aps']
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
		delete user_payload['aps']
	}
	if(Object.keys(user_payload).length > 0){
		note.payload = user_payload
	}
	// note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
	// note.badge = 3;
	// note.sound = "ping.aiff";
	// note.sound = "default";
	// note.alert = "custom alert"
	// note.alert = "New notification.timestamp=" + (Math.floor(new Date() / 1000 ));
	//"New notification.timestamp=" + (Math.floor(new Date() / 1000 )+ ", count="+config.notification_cnt++);
	// note.payload = {"aps":{"alert":"Message for IOS"},"vs":{"a":"www.yahoo.co.in","style":"normal","title":"KDBugathon","message":"Hello this is first message Furious 7.","cid":"22031"}}
	// {'aps':{'alert': '25% off you next purchase, promotion code: tYR8Ip'}, 'vs': {'a': ∂'http://www.jcrew.com', 'cid': 28664}}, 'app_brand_id': 181, 'munchkin_id': '588-MQE-543', 'uuid': 'BC9F7AC6-05AD-449E-BAD8-5B419375B128', 'delivery_id': None, 'app_id': 361, 'push_token': ß'c387b8aee4b874b26b66185a10d60e57ea74cea6f3b649c8c9bd6e5a11f1a8d3', 'os': 'ios', 'campaign_parameters':
	// note.payload = {"aps":{"alert":"Message for IOS"},"vs":{"a":"http://google.com","style":"normal","title":"KDBugathon","message":"Hello this is first message Furious 7.","cid":"22031"}}
	// note.payload = JSON.parse(document.getElementById('apns_payload').value)
	// console.log("@@@", JSON.parse(document.getElementById('apns_payload').value))
	try{
		apnConnection.pushNotification(note, myDevice);
		console.log("sent to....", myDevice, note);
	}catch(ex){
		console.log("eeeeeeeee", ex)
	}
}

function apns_handler(){
	var token = document.getElementById('ios_push_token').value
	send_puh_notification(token)
}
