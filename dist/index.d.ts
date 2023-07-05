/// <reference types="node" />
import * as ws from 'ws';
import { EventEmitter } from 'node:events';
export declare class CloudBit extends EventEmitter {
    device_id: string;
    private socket;
    inputValue: number;
    constructor(device_id: string, socket: ws.WebSocket);
    getInputValue(): number;
    setOutput(value: number): Promise<unknown>;
    /**
     * A function to listen to the events that the CloudBit client may emit.
     * Note: If you listen to the Heartbeat event, do NOT send anything over the Socket connection.
     * @param event Event to listen to. Should be `INPUT`, `OUTPUT`, or `Heartbeat`.
     * @param cb Event listener callback.
     */
    on(event: 'input' | 'output' | 'heartbeat', cb: (this: CloudBit, data: any) => void): this;
}
export declare class Server extends ws.Server {
    cloudbits: Set<CloudBit>;
    constructor(options?: ws.ServerOptions, callback?: () => void);
    getCloudBitByDeviceId(deviceId: string): CloudBit | void;
}
