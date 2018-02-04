'use strict';
const usb = require('usb');

/**
 * CO2-monitor Connection
 * @class Monitor
 */
class CO2Monitor {
    /**
     * @param {[Object]} options - Optional configuration.
     * @param {[Number]} options.vid - VendorId of CO2 monitor.
     * @param {[Number]} options.pid - ProductId of CO2 monitor.
     * @constructor
     */
    constructor (options) {
        const o = options;
        this._vid = (o && o.vid) || 0x04D9;
        this._pid = (o && o.pid) || 0xA052;
        // Random key buffer.
        this._key = Buffer.from([
            0xc4, 0xc6, 0xc0, 0x92, 0x40, 0x23, 0xdc, 0x96
        ]);

        this._device = null;
        this._interface = null;
        this._endpoint = null;

        this._co2 = null;
        this._temp = null;
    }

    /**
     * Setup usb connection to CO2 monitor.
     * @param {Function} callback
     */
    connect (callback) {
        this._device = usb.findByIds(this._vid, this._pid);
        if (!this._device) {
            return callback(new Error('Device not found!'));
        }
        // Open device to use control methods.
        this._device.open();
        this._interface = this._device.interfaces[0];
        if (!this._interface) {
            return callback(new Error('Interface not found!'));
        }
        // Parameters for `libusb_control_transfer`.
        const bmReqType = 0x21,
            bReq = 0x09,
            wValue= 0x0300,
            wIdx = 0x00;
        // Setup OUT transfer.
        this._device.controlTransfer(bmReqType, bReq, wValue, wIdx, this._key, (err) => {
            if (err) {
                return callback(err);
            }
            this._interface.claim();
            this._endpoint = this._interface.endpoints[0];
            return callback();
        });
    }

    /**
     * Close device connection.
     * @param {Function} callback
     */
    disconnect (callback) {
        this._interface.release(true, (err) => {
            this._device.close();
            return callback(err);
        });
    }

    /**
     * Fetch data from CO2 monitor.
     * @param {Function} callback
     */
    transfer (callback) {
        const transLen = 8;
        this._endpoint.transfer(transLen, (err) => {
            if (err) {
                return callback(err);
            }
            const nTransfers = 8,
                transferSize = 64;
            this._endpoint.startPoll(nTransfers, transferSize);

            const done = {};

            this._endpoint.on('data', (data) => {
                const decrypted = CO2Monitor._decrypt(this._key, data);
                const checksum = decrypted[3],
                    sum = decrypted.slice(0, 3)
                        .reduce((s, item) => (s + item), 0) & 0xff;
                // Validate checksum.
                if (decrypted[4] !== 0x0d || checksum !== sum) {
                    const err = new Error('Checksum Error.');
                    return this._endpoint.stopPoll(() => callback(err));
                }

                const op = decrypted[0];
                const value = decrypted[1] << 8 | decrypted[2];
                switch (op) {
                    case 0x42:
                        // Temperature
                        this._temp = parseFloat(
                            (value / 16 - 273.15).toFixed(2)
                        );
                        done.temp = true;
                        break;
                    case 0x50:
                        // CO2
                        this._co2 = value;
                        done.co2 = true;
                        break;
                    default:
                        break;
                }
                // Fetch data only once a time.
                if (done.temp && done.co2) {
                    this._endpoint.stopPoll(callback);
                }
            });
            this._endpoint.on('error', (err) => {
                return this._endpoint.stopPoll(() => callback(err));
            });
        });
    }

    /**
     * Get latest Ambient Temperature (Tamb)
     * @returns {Number}
     */
    get temperature () {
        return this._temp;
    }

    /**
     * Get latest Relative Concentration of CO2 (CntR)
     * @returns {Number}
     */
    get co2 () {
        return this._co2;
    }

    /**
     * Decrypt data fetched from CO2 monitor.
     * @param {Buffer} key
     * @param {Buffer} data
     * @see https://hackaday.io/project/5301-reverse-engineering-a-low-cost-usb-co-monitor/log/17909-all-your-base-are-belong-to-us
     * @static
     */
    static _decrypt(key, data) {
        const cstate = [
            0x48, 0x74, 0x65, 0x6D, 0x70, 0x39, 0x39, 0x65
        ];
        const shuffle = [2, 4, 0, 7, 1, 6, 5, 3];
        const length = cstate.length;
        let i;
        const dataXor = [];
        for (i = 0; i < length; i++) {
            const idx = shuffle[i];
            dataXor[idx] = data[i] ^ key[idx];
        }
        const dataTmp = [];
        for (i = 0; i < length; i++) {
            dataTmp[i] = ((dataXor[i] >> 3) | (dataXor[(i - 1 + 8) % 8] << 5)) & 0xff;
        }
        const results = [];
        for (i = 0; i < length; i++) {
            const ctmp = ((cstate[i] >> 4) | (cstate[i] << 4)) & 0xff;
            results[i] = ((0x100 + dataTmp[i] - ctmp) & 0xff);
        }
        return results;
    }
}

module.exports = CO2Monitor;
