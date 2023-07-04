import { EventEmitter } from 'node:events';
import * as ws from 'ws';
export class CloudBit extends EventEmitter {
    constructor(device_id, socket) {
        super();
        this.inputValue = 0;
        this.device_id = device_id;
        this.socket = socket;
    }
    getInputValue() { return this.inputValue; }
    async sendEvent(event, data) {
        return new Promise((resolve, reject) => {
            if (event != "OUTPUT" /* CloudBitEvents.OUTPUT */)
                reject(`Cannot send a ${event} event.`);
            this.emit(event, data);
            if (this.socket.readyState == 1) {
                resolve(this.socket.send(JSON.stringify({ type: event, value: data })));
            }
            else
                reject('Socket is not open.');
        });
    }
    async setOutput(value) {
        return await this.sendEvent("OUTPUT" /* CloudBitEvents.OUTPUT */, value);
    }
    // Events
    on(event, cb) {
        super.on(event, cb);
        return this;
    }
}
export class Server extends ws.Server {
    constructor(options, callback) {
        super(options, callback);
        this.cloudbits = new Set();
        this.on('connection', (socket, request) => {
            const device_id = new URL(socket.url).searchParams.get('device_id');
            if (device_id == null)
                return socket.close(1007);
            if (this.getCloudBitByDeviceId(device_id))
                return socket.close(1007);
            const cb = new CloudBit(device_id, socket);
            this.cloudbits.add(cb);
        });
    }
    getCloudBitByDeviceId(deviceId) {
        var cloudbit = undefined;
        this.cloudbits.forEach((value) => {
            if (value.device_id == deviceId && cloudbit == undefined) {
                cloudbit = value;
            }
        });
        return cloudbit;
    }
}
