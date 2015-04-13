# Push To Me

Are you a mobile developer and working on push notification functionality ?
If yes then you will need this while development :)

> Target user is a developer working on mobile platform for push notifications.
> This project allows you to upload p12 file and then pass your push token and then receive a nofitication so that you can proceed with your code.

### Version
1.0.0

### Requirements
1. openssl
2. nodejs > 10

### Installation
1. Download project
2. unzip
3. Execute following
```sh
$ cd ios
$ npm install
$ node serverForIOS.js
```

### How to use
1. go to http://localhost:8080/
2. Upload a p12 file and provide passphrase if any
3. If you do not see any errors then you have configured it !!
4. now go to http://localhost:8080/ios/YOUR_TOKEN
