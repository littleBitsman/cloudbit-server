/// <reference types="node" />
/// <reference types="node" />
import * as ws from 'ws';
import * as https from 'https';
import { EventEmitter } from 'node:events';
interface ServerOptions extends https.ServerOptions {
    port: number;
}
export declare function createServer(options: ServerOptions | undefined): Server;
export declare class CloudBit extends EventEmitter {
    device_id: string;
    private socket;
    private inputValue;
    private events;
    constructor(device_id: string, socket: ws.WebSocket);
    getInputValue(): number;
    /**
     * This function exists to allow for changes from the physical CloudBit input to be mirrored here. Do not use this.
     * @param value
     */
    setInput(value: number): void;
    setOutput(value: number): Promise<unknown>;
    /**
     * A function to listen to the events that the CloudBit client may emit.
     * Note: If you listen to the Heartbeat event, do NOT send anything over the Socket connection.
     * @param event Event to listen to.
     * @param cb Event listener callback.
     */
    on(event: 'input' | 'output' | 'heartbeat', cb: (this: CloudBit, data: any) => void): this;
    once(event: 'input' | 'output' | 'heartbeat', cb: (this: CloudBit, data: any) => void): this;
}
export declare class Server extends ws.Server {
    readonly cloudbits: Set<CloudBit>;
    constructor(options?: ws.ServerOptions, callback?: () => void);
    getCloudBitByDeviceId(deviceId: string): CloudBit | void;
    static createServer(port?: number): Server;
    static createHttpsServer(options: ServerOptions): Server;
}
export {};
