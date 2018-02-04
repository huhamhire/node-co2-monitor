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
    });
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