# Push To Me

Are you a mobile developer and working on push notification functionality ?
If yes then you will need this while development :)

> Target user is a developer working on mobile platform for push notifications.
> This project allows you to upload p12 file and then pass your push token and then receive a nofitication so that you can proceed with your code. And in case of android you can provide server_key and push_token.


#### Version
1.0.0

#### Requirements
1. openssl
2. nodejs > 10

#### Installation
1. Download project
2. unzip
3. Execute following

*For IOS*
```sh
$ cd ios
$ npm install
$ node server.js
```
*For ANDROID*
```sh
$ cd android
$ npm install
$ node server.js
```

###### Thats it !!!

#### How to use

*For IOS*

1. go to http://localhost:8080/
2. Upload a p12 file and provide passphrase if any
3. If you do not see any errors then you have configured it !!
4. now go to http://localhost:8080/ios/YOUR_TOKEN

*For ANDROID*

1. go to http://localhost:9090/SERVER_KEY/PUSH_TOKEN


#### Configurations
Modify **config.js** in respective directories.

| Parameter        | Type           | default  | Explaination |
|:-------------:|:-------------:|:-----:|:-----|
| port      | int | 8080/9090 | For ios 8080 nad for android 9090 |
| interval_sec      | int      |   -1 | Set value in seconds to receive notification contineously after that interval
