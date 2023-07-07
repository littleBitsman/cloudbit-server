/// <reference types="node" />
/// <reference types="node" />
import * as ws from 'ws';
import * as https from 'https';
import { EventEmitter } from 'node:events';
interface ServerOptions extends https.ServerOptions {
    port: number;
}
/**
 * The top level function to create a server quickly. If you want to create an HTTPS server, it is recommended to do so with `Server.createHttpsServer()`.
 * @param options Server options with a port option. If you do not specify a port or options, an HTTP server will be created. If the `options.key` and `options.cert` fields exist, an HTTPS server will be created.
 * @returns A Server object.
 */
export declare function createServer(options: ServerOptions | undefined): Server;
/**
 * The CloudBit class that represents a CloudBit connected to the web socket server.
 * @class
 */
export declare class CloudBit extends EventEmitter {
    readonly device_id: string;
    private readonly socket;
    private inputValue;
    /**
     * The CloudBit constructor. Do not use this since the Server class already instantiates one for every new client on the Web Socket.
     */
    constructor(device_id: string, socket: ws.WebSocket);
    /**
     * Get the input value from the input BitSnap on this CloudBit.
     * @returns The current value of the input.
     */
    getInputValue(): number;
    /**
     * This function exists to allow for changes from the physical CloudBit input to be mirrored here. Do not use this.
     * @private
     * @api private
     */
    setInput(value: number): void;
    /**
     * Sets the output value on this CloudBit to the `value`. This number should be in the range 0-99. Anything less than 0 will be truncated to 0, and anything greater than 99 will be truncated to 99.
     * @param value The new output value.
     * @async
     */
    setOutput(value: number): Promise<unknown>;
    /**
     * A function to listen to the events that the CloudBit client may emit.
     * Note: If you listen to the Heartbeat event, do NOT send anything over the Socket connection.
     * @param event Event to listen to.
     * @param cb Event listener callback.
     */
    on(event: 'input' | 'output' | 'heartbeat' | string | symbol, cb: (this: CloudBit, data: any) => void): this;
    /**
     * A function to listen to the events that the CloudBit client may emit. The listener is called **once**. When the event is emitted, the listener is removed, then the callback is invoked.
     * @param event Event to listen to.
     * @param cb Event listener callback.
     */
    once(event: 'input' | 'output' | 'heartbeat' | string | symbol, cb: (this: CloudBit, data: any) => void): this;
    /**
     * Internal function for Server.getCloudBitBySocket(). Doesn't have any use otherwise.
     */
    socketEquals(socket: unknown): boolean;
}
/**
 * The CloudBit Server class.
 * @class
 */
export declare class Server extends ws.Server {
    readonly cloudbits: Set<CloudBit>;
    private readonly events;
    /**
     * The constructor for the Server class. It is recommended to call `Server.createServer()` or `Server.createHttpsServer()` instead of directly instantiating this class.
     */
    constructor(options?: ws.ServerOptions, callback?: () => void);
    /**
     * Gets a CloudBit object by the specified `deviceId`. If it does not exist, undefined is returned.
     * @param deviceId The device ID to search for.
     * @returns A CloudBit object if it exists as a client of the web socket server. Otherwise, undefined.
     */
    getCloudBitByDeviceId(deviceId: string): CloudBit | void;
    getCloudBitBySocket(socket: ws.WebSocket): CloudBit | void;
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
    static createServer(port?: number): Server;
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
    static createHttpsServer(options: ServerOptions): Server;
}
export {};
