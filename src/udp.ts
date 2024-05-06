import * as dgram from 'node:dgram'
import { EventEmitter } from 'node:events'

class UdpCloudBit {
    readonly macAddress: string

    constructor(addr: string) {
        this.macAddress = addr
    }
}

class UdpServer {
    private readonly socket = dgram.createSocket('udp4')
    private readonly eventStream = new EventEmitter

    constructor() {

    }
}