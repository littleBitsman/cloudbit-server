import { WebSocketOpcodes } from './server'
import { EventEmitter } from 'node:events'
import * as ws from 'ws'

interface InputData {
    value: number
}

interface SocketMessage {
    opcode: WebSocketOpcodes,
    data: InputData | undefined
}

/**
 * The CloudBit class that represents a CloudBit connected to the web socket server.
 * @class
 */
export class CloudBit {
    readonly deviceId: string
    private readonly socket: ws.WebSocket
    private inputValue: number = 0
    private outputValue: number = 0
    private eventStream = new EventEmitter()
    private lastHeartbeat: number = 0
    constructor(deviceId: string, socket: ws.WebSocket, heartbeatInterval: number) {
        this.deviceId = deviceId
        this.socket = socket
        this.socket.on('message', (data) => {
            try {
                const json: SocketMessage = JSON.parse(data.toString('utf8'))
                if (json.opcode = WebSocketOpcodes.INPUT) {
                    if (!json.data || !json.data.value) return
                    this.inputValue = json.data.value
                    this.eventStream.emit('input', json.data.value)
                } else if (json.opcode == WebSocketOpcodes.HEARTBEAT) {
                    this.lastHeartbeat = Date.now()
                    this.eventStream.emit('heartbeat')
                    this.socket.send(JSON.stringify({
                        opcode: WebSocketOpcodes.HEARTBEAT_ACK
                    }))
                }
            } catch {
                // TODO #3 new link lol
            }
        })
        setInterval(() => {
            if (Date.now() - this.lastHeartbeat > heartbeatInterval * 2) {
                socket.close(4001)
                this.eventStream.emit('close')
            }
        }, heartbeatInterval * 2)
        this.socket.once('close', () => this.eventStream.emit('close'))
    }
    /**
     * Get the input value from the input BitSnap on this CloudBit.
     */
    get input(): number { return this.inputValue }
    get output(): number { return this.outputValue }
    /**
     * Sets the output value on this CloudBit to the `value`. This number should be in the range 0-99. Anything less than 0 will be truncated to 0, and anything greater than 99 will be truncated to 99.
     * @param value The new output value.
     * @async
     */
    async setOutput(value: number): Promise<void> {
        return new Promise((resolve, reject) => {
            if (value < 0) value = 0
            if (value > 99) value = 99
            if (this.socket.readyState == 1) {
                this.outputValue = value
                this.eventStream.emit('output', value)
                resolve(this.socket.send(JSON.stringify({ opcode: WebSocketOpcodes.OUTPUT, data: { value: value } })))
            } else reject('Socket is not open.')
        })
    }

    // Events
    /**
     * A function to listen to the events that the CloudBit client may emit.
     * @param event Event to listen to.
     * @param cb Event listener callback.
     */
    on(event: 'input', cb: (input: number) => void): this
    on(event: 'heartbeat', cb: () => void): this
    on(event: string | symbol, cb: (...params: any[]) => void): this {
        if (event == 'close') {
            console.log('[WARNING] When listening to the \'close\' event, please use CloudBit.once(). The event will only be able to be emitted once anyway.')
        }
        this.eventStream.on(event, cb)
        return this
    }
    /**
     * A function to listen to the events that the CloudBit client may emit. The listener is called **once**. When the event is emitted, the listener is removed, then the callback is invoked.
     * @param event Event to listen to.
     * @param cb Event listener callback.
     */
    once(event: 'input', cb: (input: number) => void): this
    once(event: 'heartbeat', cb: () => void): this
    once(event: 'close', cb: () => void): this
    once(event: string | symbol, cb: (...params: any[]) => void): this {
        this.eventStream.once(event, cb)
        return this
    }
    /**
     * Internal function for Server.getCloudBitBySocket(). Doesn't have any use otherwise.
     * @private
     */
    socketEquals(socket: unknown): boolean {
        return socket instanceof ws.WebSocket && socket == this.socket
    }
}