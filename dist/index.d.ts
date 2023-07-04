/// <reference types="node" />
import { EventEmitter } from 'node:events';
import * as ws from 'ws';
export declare const enum CloudBitEvents {
    INPUT = "INPUT",
    OUTPUT = "OUTPUT",
    HEARTBEAT = "Heartbeat",
    HEARTBEAT_ACK = "HeartbeatAck",
    HELLO = "Hello"
}
export declare class CloudBit extends EventEmitter {
    device_id: string;
    socket: ws.WebSocket;
    inputValue: number;
    constructor(device_id: string, socket: ws.WebSocket);
    getInputValue(): number;
    private sendEvent;
    setOutput(value: number): Promise<void>;
    on(event: CloudBitEvents, cb: (this: CloudBit, data: any) => void): this;
}
export declare class Server extends ws.Server {
    cloudbits: Set<CloudBit>;
    constructor(options?: ws.ServerOptions, callback?: () => void);
    getCloudBitByDeviceId(deviceId: string): CloudBit | void;
}
