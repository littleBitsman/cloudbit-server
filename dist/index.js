"use strict";
const cloudbit_1 = require("./cloudbit");
const server_1 = require("./server");
/**
 * The top level function to create a server quickly. If you want to create an HTTPS server, it is recommended to do so with `Server.createHttpsServer()`.
 * @param options Server options with a port option. If you do not specify a port or options, an HTTP server will be created. If the `options.key` and `options.cert` fields exist, an HTTPS server will be created.
 * @returns A Server object.
 */
function createServer(options) {
    if (!options) {
        return server_1.Server.createServer(3000);
    }
    else if (options.key && options.cert) {
        return server_1.Server.createHttpsServer(options);
    }
    else if (!isNaN(options.port)) {
        return server_1.Server.createServer(options.port);
    }
    else {
        return server_1.Server.createServer(3000);
    }
}
module.exports = {
    Server: server_1.Server,
    CloudBit: cloudbit_1.CloudBit,
    createServer: createServer
};
