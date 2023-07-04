import { EventEmitter } from 'node:events'

enum CloudBitEvents {
    INPUT = 'INPUT',
    OUTPUT = 'OUTPUT',
    HEARTBEAT = 'Heartbeat',
    HEARTBEAT_ACK = 'HeartbeatAck',
    HELLO = 'Hello'
}
class CloudBit extends EventEmitter {
    device_id: string
    socket: WebSocket
    constructor (device_id: string, socket: WebSocket) {
        super()
        this.device_id = device_id
        this.socket = socket
        this.sendEvent(CloudBitEvents.OUTPUT, '')
    }
    async sendEvent(event: CloudBitEvents, ...data: any) {
        return new Promise((resolve, reject) => {
            if (event != CloudBitEvents.OUTPUT) reject(`Cannot send a ${event} event.`)
            this.emit(event, data)
            if (this.socket.readyState == 1) {
                resolve(this.socket.send(data))
            } else reject('Socket is not open.')
        })
    }
    // Events
    on(event: CloudBitEvents, cb: (this: CloudBit, data: any) => void): this {
        super.on(event, cb)
        return this
    }
}