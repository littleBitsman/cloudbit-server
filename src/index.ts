import * as https from 'https'
import { CloudBit } from './cloudbit'
import { Server } from './server'

interface ServerOptions extends https.ServerOptions {
    port: number
}

/**
 * The top level function to create a server quickly. If you want to create an HTTPS server, it is recommended to do so with `Server.createHttpsServer()`.
 * @param options Server options with a port option. If you do not specify a port or options, an HTTP server will be created. If the `options.key` and `options.cert` fields exist, an HTTPS server will be created.
 * @returns A Server object.
 */

function createServer(options: ServerOptions | undefined): Server {
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

export = {
    Server: Server,
    CloudBit: CloudBit,
    createServer: createServer
}