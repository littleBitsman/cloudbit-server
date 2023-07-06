import * as ws from 'ws'
import * as http from 'http'
import * as https from 'https'
import { EventEmitter } from 'node:events';

interface ServerOptions extends https.ServerOptions {
    port: number
}

export default function(options: ServerOptions | undefined): Server {
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

export class CloudBit extends EventEmitter {
    device_id: string
    private socket: ws.WebSocket
    private inputValue: number = 0
    private events = [ 'input', 'output', 'heartbeat' ]
    constructor(device_id: string, socket: ws.WebSocket) {
        super()
        this.device_id = device_id
        this.socket = socket
    }
    getInputValue(): number { return this.inputValue }
    /**
     * This function exists to allow for changes from the physical CloudBit input to be mirrored here. Do not use this.
     * @param value
     */
    setInput(value: number) {
        this.inputValue = value
    }
    async setOutput(value: number) {
        return new Promise((resolve, reject) => {
            this.emit('output', value)
            if (this.socket.readyState == 1) resolve(this.socket.send(JSON.stringify({ type: 'output', value: value })));
            else reject('Socket is not open.')
        })
    }

    // Events
    /**
     * A function to listen to the events that the CloudBit client may emit.
     * Note: If you listen to the Heartbeat event, do NOT send anything over the Socket connection.
     * @param event Event to listen to.
     * @param cb Event listener callback.
     */
    on(event: 'input' | 'output' | 'heartbeat', cb: (this: CloudBit, data: any) => void): this {
        if (!this.events.includes(event)) throw new Error('Invalid event name.');
        super.on(event, cb)
        return this
    }
    once(event: 'input' | 'output' | 'heartbeat', cb: (this: CloudBit, data: any) => void): this {
        if (!this.events.includes(event)) throw new Error('Invalid event name.');
        super.once(event, cb)
        return this
    }
}

export class Server extends ws.Server {
    readonly cloudbits: Set<CloudBit> = new Set<CloudBit>()
    constructor(options?: ws.ServerOptions, callback?: () => void) {
        super(options, callback)
        this.on('connection', (socket, request) => {
            const device_id = new URL(socket.url).searchParams.get('device_id')
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
                    switch (json.type) {
                        case 'input': 
                            if (!isNaN(json.value)) {
                                cb.setInput(json.value)
                            }
                            break
                    }
                } catch (err) {

                }
            })
        })
    }
    getCloudBitByDeviceId(deviceId: string): CloudBit | void {
        var cloudbit: CloudBit | void = undefined
        this.cloudbits.forEach((value) => {
            if (value.device_id == deviceId && cloudbit == undefined) {
                cloudbit = value
            }
        })
        return cloudbit
    }
    static createServer(port: number = 3000): Server {
        const server = http.createServer()
        server.listen(port)        
        return new this({ server: server })
    }
    static createHttpsServer(options: ServerOptions): Server {
        const server = https.createServer(options)
        server.listen(options.port | 3000)
        return new this({ server: server })
    }
}