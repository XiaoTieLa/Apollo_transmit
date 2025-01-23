"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const eventemitter3_1 = tslib_1.__importDefault(require("eventemitter3"));
const parse_1 = require("./parse");
const types_1 = require("./types");
const textEncoder = new TextEncoder();
class FoxgloveClient {
    static SUPPORTED_SUBPROTOCOL = "foxglove.websocket.v1";
    #emitter = new eventemitter3_1.default();
    #ws;
    #nextSubscriptionId = 0;
    #nextAdvertisementId = 0;
    constructor({ ws }) {
        this.#ws = ws;
        this.#reconnect();
    }
    on(name, listener) {
        this.#emitter.on(name, listener);
    }
    off(name, listener) {
        this.#emitter.off(name, listener);
    }
    #reconnect() {
        this.#ws.binaryType = "arraybuffer";
        this.#ws.onerror = (event) => {
            this.#emitter.emit("error", event.error ?? new Error("WebSocket error"));
        };
        this.#ws.onopen = (_event) => {
            if (this.#ws.protocol !== _a.SUPPORTED_SUBPROTOCOL) {
                throw new Error(`Expected subprotocol ${_a.SUPPORTED_SUBPROTOCOL}, got '${this.#ws.protocol}'`);
            }
            this.#emitter.emit("open");
        };
        this.#ws.onmessage = (event) => {
            let message;
            try {
                if (event.data instanceof ArrayBuffer) {
                    message = (0, parse_1.parseServerMessage)(event.data);
                }
                else {
                    message = JSON.parse(event.data);
                }
            }
            catch (error) {
                this.#emitter.emit("error", error);
                return;
            }
            switch (message.op) {
                case "serverInfo":
                    this.#emitter.emit("serverInfo", message);
                    return;
                case "status":
                    this.#emitter.emit("status", message);
                    return;
                case "removeStatus":
                    this.#emitter.emit("removeStatus", message);
                    return;
                case "advertise":
                    this.#emitter.emit("advertise", message.channels);
                    return;
                case "unadvertise":
                    this.#emitter.emit("unadvertise", message.channelIds);
                    return;
                case "parameterValues":
                    this.#emitter.emit("parameterValues", message);
                    return;
                case "advertiseServices":
                    this.#emitter.emit("advertiseServices", message.services);
                    return;
                case "unadvertiseServices":
                    this.#emitter.emit("unadvertiseServices", message.serviceIds);
                    return;
                case "connectionGraphUpdate":
                    this.#emitter.emit("connectionGraphUpdate", message);
                    return;
                case "serviceCallFailure":
                    this.#emitter.emit("serviceCallFailure", message);
                    return;
                case types_1.BinaryOpcode.MESSAGE_DATA:
                    this.#emitter.emit("message", message);
                    return;
                case types_1.BinaryOpcode.TIME:
                    this.#emitter.emit("time", message);
                    return;
                case types_1.BinaryOpcode.SERVICE_CALL_RESPONSE:
                    this.#emitter.emit("serviceCallResponse", message);
                    return;
                case types_1.BinaryOpcode.FETCH_ASSET_RESPONSE:
                    this.#emitter.emit("fetchAssetResponse", message);
                    return;
            }
            this.#emitter.emit("error", new Error(`Unrecognized server opcode: ${message.op}`));
        };
        this.#ws.onclose = (event) => {
            this.#emitter.emit("close", event);
        };
    }
    close() {
        this.#ws.close();
    }
    subscribe(channelId) {
        const id = this.#nextSubscriptionId++;
        const subscriptions = [{ id, channelId }];
        this.#send({ op: "subscribe", subscriptions });
        return id;
    }
    unsubscribe(subscriptionId) {
        this.#send({ op: "unsubscribe", subscriptionIds: [subscriptionId] });
    }
    advertise(clientChannel) {
        const id = ++this.#nextAdvertisementId;
        const channels = [{ id, ...clientChannel }];
        this.#send({ op: "advertise", channels });
        return id;
    }
    unadvertise(channelId) {
        this.#send({ op: "unadvertise", channelIds: [channelId] });
    }
    getParameters(parameterNames, id) {
        this.#send({ op: "getParameters", parameterNames, id });
    }
    setParameters(parameters, id) {
        this.#send({ op: "setParameters", parameters, id });
    }
    subscribeParameterUpdates(parameterNames) {
        this.#send({ op: "subscribeParameterUpdates", parameterNames });
    }
    unsubscribeParameterUpdates(parameterNames) {
        this.#send({ op: "unsubscribeParameterUpdates", parameterNames });
    }
    sendMessage(channelId, data) {
        const payload = new Uint8Array(5 + data.byteLength);
        const view = new DataView(payload.buffer, payload.byteOffset, payload.byteLength);
        view.setUint8(0, types_1.ClientBinaryOpcode.MESSAGE_DATA);
        view.setUint32(1, channelId, true);
        payload.set(data, 5);
        this.#ws.send(payload);
    }
    sendServiceCallRequest(request) {
        const encoding = textEncoder.encode(request.encoding);
        const payload = new Uint8Array(1 + 4 + 4 + 4 + encoding.length + request.data.byteLength);
        const view = new DataView(payload.buffer, payload.byteOffset, payload.byteLength);
        let offset = 0;
        view.setUint8(offset, types_1.ClientBinaryOpcode.SERVICE_CALL_REQUEST);
        offset += 1;
        view.setUint32(offset, request.serviceId, true);
        offset += 4;
        view.setUint32(offset, request.callId, true);
        offset += 4;
        view.setUint32(offset, request.encoding.length, true);
        offset += 4;
        payload.set(encoding, offset);
        offset += encoding.length;
        const data = new Uint8Array(request.data.buffer, request.data.byteOffset, request.data.byteLength);
        payload.set(data, offset);
        this.#ws.send(payload);
    }
    subscribeConnectionGraph() {
        this.#send({ op: "subscribeConnectionGraph" });
    }
    unsubscribeConnectionGraph() {
        this.#send({ op: "unsubscribeConnectionGraph" });
    }
    fetchAsset(uri, requestId) {
        this.#send({ op: "fetchAsset", uri, requestId });
    }
    /**
     * @deprecated Use `sendServiceCallRequest` instead
     */
    sendCallServiceRequest(request) {
        this.sendServiceCallRequest(request);
    }
    #send(message) {
        this.#ws.send(JSON.stringify(message));
    }
}
_a = FoxgloveClient;
exports.default = FoxgloveClient;
//# sourceMappingURL=FoxgloveClient.js.map