import * as ws from 'ws'
import * as http from 'http'
import * as https from 'https'

interface ServerOptions extends https.ServerOptions {
    port: number
}

/**
 * The top level function to create a server quickly. If you want to create an HTTPS server, it is recommended to do so with `Server.createHttpsServer()`.
 * @param options Server options with a port option. If you do not specify a port or options, an HTTP server will be created. If the `options.key` and `options.cert` fields exist, an HTTPS server will be created.
 * @returns A Server object.
 */

export function createServer(options: ServerOptions | undefined): Server {
    if (!options) {
        return Server.createServer(3000)
    } else if (options.key && options.cert) {
        return Server.createHttpsServer(options)
    } else if (!isNaN(options.port)) {
        return Server.createServer(options.port)
    } else {
        return Server.createServer(3000)
    }
}

import { CloudBit } from './cloudbit'

/**
 * The CloudBit Server class.
 * @class
 */
export class Server extends ws.Server {
    readonly cloudbits: Set<CloudBit> = new Set<CloudBit>()
    private readonly events = ['input', 'output', 'heartbeat']
    /**
     * The constructor for the Server class. It is recommended to call `Server.createServer()` or `Server.createHttpsServer()` instead of directly instantiating this class.
     */
    constructor(options?: ws.ServerOptions, callback?: () => void) {
        super(options, callback)
        this.on('connection', (socket, req) => {
            const device_id = new URL(`wss://localhost:${req.socket.localPort}${req.url}`).searchParams.get('device_id')
            if (device_id == null) return socket.close(4002)
            if (this.getCloudBitByDeviceId(device_id)) return socket.close(4002)
            const cb = new CloudBit(device_id, socket)
            this.cloudbits.add(cb)
            socket.once('open', () => {
                socket.send(JSON.stringify({ type: 'Hello', heartbeat_interval: 30000 }))
            })
            socket.on('message', (data) => {
                try {
                    const json = JSON.parse(data.toString('utf-8'))
                    console.log(json)
                    switch (json.type) {
                        case 'input':
                            if (!isNaN(json.value)) {
                                cb.setInput(json.value)
                            }
                            break
                    }
                } catch (err) {
                    // TODO #3 make something here
                }
            })
        })
    }

    /**
     * Gets a CloudBit object by the specified `deviceId`. If it does not exist, undefined is returned.
     * @param deviceId The device ID to search for.
     * @returns A CloudBit object if it exists as a client of the web socket server. Otherwise, undefined.
     */
    getCloudBitByDeviceId(deviceId: string): CloudBit | void {
        var cloudbit: CloudBit | void = undefined
        this.cloudbits.forEach((value) => {
            if (value.device_id == deviceId && cloudbit == undefined) {
                cloudbit = value
            }
        })
        return cloudbit
    }

    getCloudBitBySocket(socket: ws.WebSocket): CloudBit | void {
        var cloudbit: CloudBit | void = undefined
        this.cloudbits.forEach((value) => {
            if (value.socketEquals(socket) && cloudbit == undefined) {
                cloudbit = value
            }
        })
        return cloudbit
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
    static createServer(port: number = 3000): Server {
        const server = http.createServer()
        const ws = new this({ server: server })
        server.listen(port, () => {
            console.log(`[INFO] Started CloudBit server over HTTP on port ${port}.`)
        })
        return ws
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
    static createHttpsServer(options: ServerOptions): Server {
        const server = https.createServer(options)
        const ws = new this({ server: server })
        server.listen(options.port | 3000, () => {
            console.log(`[INFO] Started CloudBit server over HTTPS on port ${options.port | 3000}`)
        })
        return ws
    }
}