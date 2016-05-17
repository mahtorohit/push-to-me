
# Push To Me

Are you a mobile developer and working on push notification feature ?
If yes then you will need this while development :)

> Target user is a developer working on mobile platform for push notifications.
> This utility accepts (for iOS)p12 certificate, push token and then sends push notification to that device. Similarly for android, it accepts server key, push token and then sends a push notificaiton.

#### Version
1.0.0

## Now introducing ElectronJS application (currently only for OS X)
Handy GUI utility to send push notification to your device.

* Download dmg from release tab.
* Install it.

1. If you are working with GCM(andorid) then provide
    1. API key
    2. Push token
    3. JSON payload

   and **hit send button**. Thats it... you will recive a notificaiton on your android device.

2. If you are working with APNS(Apple service for push notifications) then provide
    1. path of p12 file
    2. passphrase if any
    3. JSON payload

    and **hit send button**. Thats it... you will receive a notificaiton on your iDevice.

---
---
#### *_Read following notes if you are not going to use electron desktop application._*
#### Requirements
1. openssl
2. nodejs > 10

#### Installation
1. Download project
2. unzip
3. Execute following

*For OS X*
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

*For OS X*

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
| port      | int | 8080/9090 | For OS X 8080 and for android 9090 |
| interval_sec      | int      |   -1 | Set value in seconds to receive notification contineously after that interval


License
----

MIT
