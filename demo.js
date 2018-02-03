'use strict';

const CO2Monitor = require('./co2_monitor');

const monitor = new CO2Monitor();

monitor.connect((err) => {
    if (err) {
        return console.error(err.stack);
    }
    console.log('Monitor connected.');

    monitor.transfer((err) => {
        if (err) {
            return console.error(err.stack);
        }
        console.log('Data transferred.');

        console.log(`temp: ${ monitor.temperature }`);
        console.log(`co2: ${ monitor.co2 }`);
    });
});
