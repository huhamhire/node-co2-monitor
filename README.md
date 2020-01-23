# node-co2-monitor

Node.JS library for reading CO2 concentration and indoor temperature from TFA Dostmann AirCO2NTROL Mini.

[![npm](https://img.shields.io/npm/v/node-co2-monitor.svg)](https://www.npmjs.com/package/node-co2-monitor)
[![npm downloads](https://img.shields.io/npm/dm/node-co2-monitor.svg)](https://www.npmjs.com/package/node-co2-monitor)

## Contents

* [Supported Hardware](#supported-hardware)
* [Install](#install)
* [Getting started](#getting-started)
* [API](#api)
    * [Methods](#methods)
    * [Events](#events)
* [Credits](#credits)
* [License](#license)


## Supported Hardware

* [TFA Dostmann AirCO2NTROL Mini - Monitor CO2 31.5006](https://www.amazon.de/dp/B00TH3OW4Q)


## Install

```bash
npm install node-co2-monitor
```


## Getting started

```javascript
'use strict';
const CO2Monitor = require('node-co2-monitor');

const monitor = new CO2Monitor();

// Connect device.
monitor.connect((err) => {
    if (err) {
        return console.error(err.stack);
    }
    console.log('Monitor connected.');

    // Read data from CO2 monitor.
    monitor.transfer();
});

// Get results.
monitor.on('temp', (temperature) => {
    console.log(`temp: ${ temperature }`);
});
monitor.on('co2', (co2) => {
    console.log(`co2: ${ co2 }`);
});

// Error handler
monitor.on('error', (err) => {
    console.error(err.stack);
    // Disconnect device
    monitor.disconnect(() => {
        console.log('Monitor disconnected.');
        process.exit(0);
    });
});
```


## API
### Methods
#### new CO2Monitor(options) -> Object
Create CO2Monitor instance.

#### monitor.connect(Function callback)
Setup usb connection to CO2 monitor.

#### monitor.disconnect(Function callback)
Close device connection.

#### monitor.transfer([Function callback])
Start data transfer from CO2 monitor.

#### monitor.temperature -> Number
Get latest Ambient Temperature (Tamb) in ℃.

#### monitor.co2 -> Number
Get latest Relative Concentration of CO2 (CntR) in ppm.


### Events

#### temp -> Number
Triggered by temperature update with Ambient Temperature (Tamb) in ℃.

#### co2 -> Number
Triggered by co2 update with Relative Concentration of CO2 (CntR) in ppm.

#### error -> Error
Triggered by error.


## Projects using node-co2-monitor

* [CO2 Monitor Exporter](https://github.com/huhamhire/co2-monitor-exporter) - Prometheus exporter for CO2 concentration and indoor temperature from TFA Dostmann AirCO2NTROL Mini.


## Credits

Inspired by Henryk Plötz:
[Reverse-Engineering a low-cost USB CO₂ monitor](https://hackaday.io/project/5301-reverse-engineering-a-low-cost-usb-co-monitor/log/17909-all-your-base-are-belong-to-us).


## License

MIT
