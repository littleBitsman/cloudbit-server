import { EventEmitter } from 'node:events'
import { WebSocketServer } from 'ws'

class WsCloudBit {

}

class Server {
    readonly cloudbits = new Set<WsCloudBit>()
    private readonly eventStream = new EventEmitter()
    private readonly ws: WebSocketServer

    constructor() {
        this.ws = new WebSocketServer()
    }
}