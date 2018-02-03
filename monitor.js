'use strict';
const usb = require('usb');

/**
 * CO2-monitor Connection
 * @class Monitor
 */
class Monitor {
    /**
     * @constructor
     */
    constructor () {
        this._vid = 0x04D9;
        this._pid = 0xA052;
        // Random key buffer.
        this._key = Buffer.from([
            0xc4, 0xc6, 0xc0, 0x92, 0x40, 0x23, 0xdc, 0x96
        ]);

        this._device = null;
        this._interface = null;
        this._endpoint = null;
    }

    /**
     * Setup usb connection to CO2 monitor.
     * @param {Function} callback
     */
    connect (callback) {
        this._device = usb.findByIds(vid, pid);
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
        this._device.controlTransfer(bmReqType, bReq, wValue, wIdx, this.key, (err) => {
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
        this._endpoint.stopPoll(() => {
            this._interface.release(true, (err) => {
                this._device.close();
                return callback(err);
            });
        });
    }

    transfer (callback) {
        const transLen = 8;
        this._endpoint.transfer(transLen, (err))
    }

    /**
     * Decrypt data fetched from CO2 monitor.
     * @param {Buffer} key
     * @param {Buffer} data
     * @see https://hackaday.io/project/5301-reverse-engineering-a-low-cost-usb-co-monitor/log/17909-all-your-base-are-belong-to-us
     */
    _decrypt(key, data) {
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

module.exports = Monitor;
