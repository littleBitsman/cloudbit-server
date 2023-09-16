import * as ws from 'ws'
import * as http from 'http'
import * as https from 'https'
import { CloudBit } from './cloudbit'
import { EventEmitter } from 'node:events'

export enum WebSocketOpcodes {
    INPUT = 0x1,
    OUTPUT = 0x2,
    HELLO = 0x3,
    HEARTBEAT = 0x4,
    HEARTBEAT_ACK = 0x5
}

interface ServerOptions extends https.ServerOptions {
    port: number
}

export class Server {
    readonly cloudbits: Set<CloudBit> = new Set<CloudBit>()
    private readonly EventStream = new EventEmitter()
    private readonly WSS
    /**
     * The constructor for the Server class. It is recommended to call `Server.createServer()` or `Server.createHttpsServer()` instead of directly instantiating this class.
     */
    constructor(options?: ws.ServerOptions, callback?: () => void) {
        this.WSS = new ws.Server(options, callback)
        this.WSS.on('connection', (socket, req) => {
            const deviceId = Array.from(this.cloudbits.keys()).length.toString()
            const hbInterval = 30000 + Math.round(Math.random() * 100)
            const cb = new CloudBit(deviceId, socket, hbInterval)
            cb.once('close', () => {
                this.cloudbits.delete(cb)
            })
            this.cloudbits.add(cb)
            socket.send(JSON.stringify({ 
                opcode: WebSocketOpcodes.HELLO, 
                heartbeat_interval: hbInterval, 
                deviceId: deviceId
            }))
            socket.on('message', (data) => {
                try {
                    const json = JSON.parse(data.toString('utf-8'))
                    console.log(json)
                    switch (json.opcode) {
                    }
                } catch (err) {
                    // TODO #3 make something here
                }
            })
        })
    }

    on(event: 'connection', callback: (cloudbit: CloudBit) => void): this {
        this.EventStream.on(event, callback)
        return this
    }

    /**
     * Gets a CloudBit object by the specified `deviceId`. If it does not exist, undefined is returned.
     * @param deviceId The device ID to search for.
     * @returns A CloudBit object if it exists as a client of the web socket server. Otherwise, undefined.
     */
    getCloudBitByDeviceId(deviceId: string): CloudBit | undefined {
        try {
            return Array.from(this.cloudbits.keys()).filter((cb) => cb.deviceId == deviceId)[0]
        } catch {
            return undefined
        }
    }

    getCloudBitBySocket(socket: ws.WebSocket): CloudBit | void {
        try {
            return Array.from(this.cloudbits.keys()).filter((cb) => cb.socketEquals(socket))[0]
        } catch {
            return undefined
        }
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