import { EventEmitter } from 'node:events'
import * as ws from 'ws'
import * as qs from 'querystring'
import * as url from 'url'

export const enum CloudBitEvents {
    INPUT = 'INPUT',
    OUTPUT = 'OUTPUT',
    HEARTBEAT = 'Heartbeat',
    HEARTBEAT_ACK = 'HeartbeatAck',
    HELLO = 'Hello'
}
export class CloudBit extends EventEmitter {
    device_id: string
    socket: ws.WebSocket
    inputValue: number = 0
    constructor(device_id: string, socket: ws.WebSocket) {
        super()
        this.device_id = device_id
        this.socket = socket
    }
    getInputValue(): number { return this.inputValue }
    private async sendEvent(event: CloudBitEvents, data: number): Promise<void> {
        return new Promise((resolve, reject) => {
            if (event != CloudBitEvents.OUTPUT) reject(`Cannot send a ${event} event.`)
            this.emit(event, data)
            if (this.socket.readyState == 1) {
                resolve(this.socket.send(JSON.stringify({ type: event, value: data })))
            } else reject('Socket is not open.')
        })
    }

    async setOutput(value: number) {
        return await this.sendEvent(CloudBitEvents.OUTPUT, value)
    }

    // Events
    on(event: CloudBitEvents, cb: (this: CloudBit, data: any) => void): this {
        super.on(event, cb)
        return this
    }
}



export class Server extends ws.Server {
    cloudbits: Set<CloudBit> = new Set<CloudBit>()
    constructor(options?: ws.ServerOptions, callback?: () => void) {
        super(options, callback)
        this.on('connection', (socket, request) => {
            const device_id = new URL(socket.url).searchParams.get('device_id')
            if (device_id == null) return socket.close(1007)
            if (this.getCloudBitByDeviceId(device_id)) return socket.close(1007)
            const cb = new CloudBit(device_id, socket)
            this.cloudbits.add(cb)
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
}