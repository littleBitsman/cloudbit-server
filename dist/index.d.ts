/// <reference types="node" />
import * as ws from 'ws';
import * as https from 'https';
interface ServerOptions extends https.ServerOptions {
    port: number;
}
/**
 * The top level function to create a server quickly. If you want to create an HTTPS server, it is recommended to do so with `Server.createHttpsServer()`.
 * @param options Server options with a port option. If you do not specify a port or options, an HTTP server will be created. If the `options.key` and `options.cert` fields exist, an HTTPS server will be created.
 * @returns A Server object.
 */
export declare function createServer(options: ServerOptions | undefined): Server;
import { CloudBit } from './cloudbit';
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
