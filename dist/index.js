"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = exports.CloudBit = void 0;
const node_events_1 = require("node:events");
const ws = __importStar(require("ws"));
class CloudBit extends node_events_1.EventEmitter {
    constructor(device_id, socket) {
        super();
        this.device_id = device_id;
        this.socket = socket;
        this.sendEvent("OUTPUT" /* CloudBitEvents.OUTPUT */, '');
    }
    sendEvent(event, ...data) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (event != "OUTPUT" /* CloudBitEvents.OUTPUT */)
                    reject(`Cannot send a ${event} event.`);
                this.emit(event, data);
                if (this.socket.readyState == 1) {
                    resolve(this.socket.send(data));
                }
                else
                    reject('Socket is not open.');
            });
        });
    }
    // Events
    on(event, cb) {
        super.on(event, cb);
        return this;
    }
}
exports.CloudBit = CloudBit;
class Server extends ws.Server {
    constructor(options, callback) {
        super(options, callback);
        this.cloudbits = new Set();
        this.on('connection', (socket, request) => {
            const device_id = new URL(socket.url).searchParams.get('device_id');
            if (device_id == null)
                return socket.close(1007);
            if (this.getCloudBitByDeviceId(device_id))
                return socket.close(1007);
            const cb = new CloudBit(device_id, socket);
            this.cloudbits.add(cb);
        });
    }
    getCloudBitByDeviceId(deviceId) {
        var cloudbit = undefined;
        this.cloudbits.forEach((value) => {
            if (value.device_id == deviceId && cloudbit == undefined) {
                cloudbit = value;
            }
        });
        return cloudbit;
    }
}
exports.Server = Server;
