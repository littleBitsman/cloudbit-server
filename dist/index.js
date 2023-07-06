"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = exports.CloudBit = exports.createServer = void 0;
const ws = require("ws");
const http = require("http");
const https = require("https");
const node_events_1 = require("node:events");
/**
 * The top level function to create a server quickly. If you want to create an HTTPS server, it is recommended to do so with `Server.createHttpsServer()`.
 * @param options Server options with a port option. If you do not specify a port or options, an HTTP server will be created. If the `options.key` and `options.cert` fields exist, an HTTPS server will be created.
 * @returns A Server object.
 */
function createServer(options) {
    if (!options) {
        return Server.createServer(3000);
    }
    else if (options.key && options.cert) {
        return Server.createHttpsServer(options);
    }
    else if (!isNaN(options.port)) {
        return Server.createServer(options.port);
    }
    else {
        return Server.createServer(3000);
    }
}
exports.createServer = createServer;
/**
 * The CloudBit class that represents a CloudBit connected to the web socket server.
 * @class
 */
class CloudBit extends node_events_1.EventEmitter {
    /**
     * The CloudBit constructor. Do not use this since the Server class already instantiates one for every new client on the Web Socket.
     */
    constructor(device_id, socket) {
        super();
        this.inputValue = 0;
        this.events = ['input', 'output', 'heartbeat'];
        this.device_id = device_id;
        this.socket = socket;
    }
    /**
     * Get the input value from the input BitSnap on this CloudBit.
     * @returns The current value of the input.
     */
    getInputValue() { return this.inputValue; }
    /**
     * This function exists to allow for changes from the physical CloudBit input to be mirrored here. Do not use this.
     * @param value
     * @private
     * @api private
     */
    setInput(value) {
        this.inputValue = value;
    }
    /**
     * Sets the output value on this CloudBit to the `value`. This number should be in the range 0-99. Anything less than 0 will be truncated to 0, and anything greater than 99 will be truncated to 99.
     * @param value The new output value.
     * @async
     */
    async setOutput(value) {
        return new Promise((resolve, reject) => {
            this.emit('output', value);
            if (this.socket.readyState == 1)
                resolve(this.socket.send(JSON.stringify({ type: 'output', value: value })));
            else
                reject('Socket is not open.');
        });
    }
    // Events
    /**
     * A function to listen to the events that the CloudBit client may emit.
     * Note: If you listen to the Heartbeat event, do NOT send anything over the Socket connection.
     * @param event Event to listen to.
     * @param cb Event listener callback.
     */
    on(event, cb) {
        if (!this.events.includes(event))
            throw new Error('Invalid event name.');
        super.on(event, cb);
        return this;
    }
    /**
     * A function to listen to the events that the CloudBit client may emit. The listener is called **once**. When the event is emitted, the listener is removed, then the callback is invoked.
     * @param event Event to listen to.
     * @param cb Event listener callback.
     */
    once(event, cb) {
        if (!this.events.includes(event))
            throw new Error('Invalid event name.');
        super.once(event, cb);
        return this;
    }
}
exports.CloudBit = CloudBit;
/**
 * The CloudBit Server class.
 * @class
 */
class Server extends ws.Server {
    /**
     * The constructor for the Server class. It is recommended to call `Server.createServer()` or `Server.createHttpsServer()` instead of directly instantiating this class.
     */
    constructor(options, callback) {
        super(options, callback);
        this.cloudbits = new Set();
        this.on('connection', (socket, req) => {
            const device_id = new URL(`wss://localhost:${req.socket.localPort}${req.url}`).searchParams.get('device_id');
            if (device_id == null)
                return socket.close(4002);
            if (this.getCloudBitByDeviceId(device_id))
                return socket.close(4002);
            const cb = new CloudBit(device_id, socket);
            this.cloudbits.add(cb);
            socket.once('open', () => {
                socket.send(JSON.stringify({ type: 'Hello', heartbeat_interval: 30000 }));
            });
            socket.on('message', (data) => {
                try {
                    const json = JSON.parse(data.toString('utf-8'));
                    switch (json.type) {
                        case 'input':
                            if (!isNaN(json.value)) {
                                cb.setInput(json.value);
                            }
                            break;
                    }
                }
                catch (err) {
                }
            });
        });
    }
    /**
     * Gets a CloudBit object by the specified `deviceId`. If it does not exist, undefined is returned.
     * @param deviceId The device ID to search for.
     * @returns A CloudBit object if it exists as a client of the web socket server. Otherwise, undefined.
     */
    getCloudBitByDeviceId(deviceId) {
        var cloudbit = undefined;
        this.cloudbits.forEach((value) => {
            if (value.device_id == deviceId && cloudbit == undefined) {
                cloudbit = value;
            }
        });
        return cloudbit;
    }
    /**
     * The recommended way to create a simple HTTP-based web socket server for CloudBits to connect to.
     * @param port The port number for the server to listen on. If none is specified, defaults to 3000.
     * @returns A CloudBit Server object.
     * @example
     * // Create a server with the default port, 3000
     * const server = Server.createServer()
     *
     * // Create a server with a specific port
     * const port = 443 // Make sure that if you are using a reserved port (generally <1024) that the current user has permissions to listen on this port and that the port is available
     * const server = Server.createServer(port)
     */
    static createServer(port = 3000) {
        const server = http.createServer();
        const ws = new this({ server: server });
        server.listen(port, () => {
            console.log(`[INFO] Started CloudBit server over HTTP on port ${port}.`);
        });
        return ws;
    }
    /**
     * The recommended way to create a simple HTTPS-based web socket server for CloudBits to connect to.
     * @param options The ServerOptions to create the server on. If the `options.port` field is not specified, defaults to 3000. The `options.key` and `options.cert` should be valid key and certificate strings.
     * @returns
     * @example
     * // Create an HTTPS server
     * const fs = require('fs')
     * const port = 3000 // Change this to any port as you wish
     * const server = Server.createHttpsServer({
     *     key: fs.readFileSync('./path/to/key.pem', 'utf-8'), // The key does not have to be a .pem, as long as it is readable in a text editor it will work
     *     cert: fs.readFileSync('./path/to/cert.pem', 'utf-8'), // Same thing here
     *     port: port
     * })
     */
    static createHttpsServer(options) {
        const server = https.createServer(options);
        const ws = new this({ server: server });
        server.listen(options.port | 3000, () => {
            console.log(`[INFO] Started CloudBit server over HTTPS on port ${options.port | 3000}`);
        });
        return ws;
    }
}
exports.Server = Server;
