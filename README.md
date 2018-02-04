# node-co2-monitor

Node.JS library for reading CO2 concentration and indoor temperature from TFA Dostmann AirCO2NTROL Mini.

## Contents

* [Supported Hardware](#supported-hardware)
* [Install](#install)
* [Getting started](#getting-started)
* [API](#api)
    * [Methods](#methods)
* [Credits](#credits)


## Supported Hardware

* [TFA Dostmann AirCO2NTROL Mini - Monitor CO2 31.5006](https://www.amazon.de/dp/B00TH3OW4Q)


## Install

```bash
npm install node-co2-monitor
```


## Getting started

```javascript
'use strict';
const CO2Monitor = require('./co2_monitor');

const monitor = new CO2Monitor();

// Connect device.
monitor.connect((err) => {
    if (err) {
        return console.error(err.stack);
    }
    console.log('Monitor connected.');

    // Read data from CO2 monitor.
    monitor.transfer((err) => {
        if (err) {
            return console.error(err.stack);
        }
        console.log('Data transferred.');

        // Get results.
        console.log(`temp: ${ monitor.temperature }`);
        console.log(`co2: ${ monitor.co2 }`);

        // Disconnect device
        monitor.disconnect(() => {
            console.log('Monitor disconnected.');
            process.exit(0);
        });
    });
});
```


## API
### Methods
#### new CO2Monitor(options) -> Object
Create CO2Monitor instance.

#### monitor.connect(Function callback)
Setup usb connection to CO2 monitor.

#### montior.disconnect(Function callback)
Close device connection.

#### monitor.transfer(Function callback)
Fetch data from CO2 monitor.

#### monitor.temperature -> Number
Get latest Ambient Temperature (Tamb) in ℃.

#### monitor.co2 -> Number
Get latest Relative Concentration of CO2 (CntR) in ppm.


## Credits

Inspired by Henryk Plötz:
[Reverse-Engineering a low-cost USB CO₂ monitor](https://hackaday.io/project/5301-reverse-engineering-a-low-cost-usb-co-monitor/log/17909-all-your-base-are-belong-to-us).
