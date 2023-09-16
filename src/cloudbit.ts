import { EventEmitter } from 'node:events'
import * as ws from 'ws'

/**
 * The CloudBit class that represents a CloudBit connected to the web socket server.
 * @class
 */
export class CloudBit extends EventEmitter {
    readonly device_id: string
    private readonly socket: ws.WebSocket
    private inputValue: number = 0
    /**
     * The CloudBit constructor. Do not use this since the Server class already instantiates one for every new client on the Web Socket.
     */
    constructor(device_id: string, socket: ws.WebSocket) {
        super()
        this.device_id = device_id
        this.socket = socket
    }
    /**
     * Get the input value from the input BitSnap on this CloudBit.
     * @returns The current value of the input.
     */
    getInputValue(): number { return this.inputValue }
    /**
     * This function exists to allow for changes from the physical CloudBit input to be mirrored here. Do not use this.
     * @private
     * @api private
     */
    setInput(value: number) {
        this.inputValue = value
        this.emit('input', value)
    }
    /**
     * Sets the output value on this CloudBit to the `value`. This number should be in the range 0-99. Anything less than 0 will be truncated to 0, and anything greater than 99 will be truncated to 99.
     * @param value The new output value.
     * @async
     */
    async setOutput(value: number) {
        return new Promise((resolve, reject) => {
            if (value < 0) value = 0
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
    on(event: 'input' | 'output' | 'heartbeat' | string | symbol, cb: (this: CloudBit, data: any) => void): this {
        super.on(event, cb)
        return this
    }
    /**
     * A function to listen to the events that the CloudBit client may emit. The listener is called **once**. When the event is emitted, the listener is removed, then the callback is invoked.
     * @param event Event to listen to.
     * @param cb Event listener callback.
     */
    once(event: 'input' | 'output' | 'heartbeat' | string | symbol, cb: (this: CloudBit, data: any) => void): this {
        super.once(event, cb)
        return this
    }
    /**
     * Internal function for Server.getCloudBitBySocket(). Doesn't have any use otherwise.
     */
    socketEquals(socket: unknown): boolean {
        return socket instanceof ws.WebSocket && socket == this.socket
    }
}