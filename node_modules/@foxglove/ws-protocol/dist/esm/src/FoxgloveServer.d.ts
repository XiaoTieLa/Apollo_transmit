import EventEmitter from "eventemitter3";
import { ChannelId } from ".";
import { Channel, ClientChannel, ClientChannelId, ClientPublish, FetchAsset, FetchAssetResponse, IWebSocket, Parameter, Service, ServiceCallFailure, ServiceCallPayload, ServiceCallRequest, ServiceId, StatusMessage, SubscriptionId } from "./types";
type ClientInfo = {
    name: string;
    connection: IWebSocket;
    subscriptions: Map<SubscriptionId, ChannelId>;
    subscriptionsByChannel: Map<ChannelId, SubscriptionId>;
    advertisements: Map<ClientChannelId, ClientChannel>;
    parameterSubscriptions: Set<string>;
};
type SingleClient = {
    client: ClientInfo;
};
type EventTypes = {
    error: (error: Error) => void;
    /** The first subscription to this channel has been created. This channel should begin sending messages to subscribed clients. */
    subscribe: (channel: ChannelId) => void;
    /** The last subscription to this channel has been removed. This channel should stop sending messages. */
    unsubscribe: (channel: ChannelId) => void;
    /** A client-published message has been received. */
    message: (event: ClientPublish & SingleClient) => void;
    /** A client advertised a channel. */
    advertise: (channel: ClientChannel & SingleClient) => void;
    /** A client stopped advertising a channel. */
    unadvertise: (channel: {
        channelId: ChannelId;
    } & SingleClient) => void;
    /** Request to retrieve parameter values has been received. */
    getParameters: (request: {
        parameterNames: string[];
        id?: string;
    }, clientConnection: IWebSocket | undefined) => void;
    /** Request to set parameter values has been received. */
    setParameters: (request: {
        parameters: Parameter[];
        id?: string;
    }, clientConnection: IWebSocket | undefined) => void;
    /** Request to subscribe to parameter value updates has been received. */
    subscribeParameterUpdates: (parameterNames: string[]) => void;
    /** Request to unsubscribe from parameter value updates has been received. */
    unsubscribeParameterUpdates: (parameterNames: string[]) => void;
    /** Service call request has been received. */
    serviceCallRequest: (request: ServiceCallRequest, clientConnection: IWebSocket) => void;
    /** Request to fetch an asset has been received. */
    fetchAsset: (request: FetchAsset, clientConnection: IWebSocket) => void;
};
export default class FoxgloveServer {
    #private;
    static SUPPORTED_SUBPROTOCOL: string;
    readonly name: string;
    readonly capabilities: string[];
    readonly supportedEncodings?: string[];
    readonly metadata?: Record<string, string>;
    readonly sessionId?: string;
    constructor({ name, capabilities, supportedEncodings, metadata, sessionId, }: {
        name: string;
        capabilities?: string[];
        supportedEncodings?: string[];
        metadata?: Record<string, string>;
        sessionId?: string;
    });
    on<E extends EventEmitter.EventNames<EventTypes>>(name: E, listener: EventEmitter.EventListener<EventTypes, E>): void;
    off<E extends EventEmitter.EventNames<EventTypes>>(name: E, listener: EventEmitter.EventListener<EventTypes, E>): void;
    /**
     * Select a sub-protocol to communicate with a new client.
     * @param protocols sub-protocols offered by the client in the connection header
     */
    handleProtocols(protocols: Iterable<string>): string | false;
    /**
     * Advertise a new channel and inform any connected clients.
     * @returns The id of the new channel
     */
    addChannel(channel: Omit<Channel, "id">): ChannelId;
    /**
     * Remove a previously advertised channel and inform any connected clients.
     */
    removeChannel(channelId: ChannelId): void;
    /**
     * Advertise a new service and inform any connected clients.
     * @returns The id of the new service
     */
    addService(service: Omit<Service, "id">): ServiceId;
    /**
     * Remove a previously advertised service and inform any connected clients.
     */
    removeService(serviceId: ServiceId): void;
    /**
     * Emit a message payload to any clients subscribed to `chanId`.
     */
    sendMessage(chanId: ChannelId, timestamp: bigint, payload: BufferSource): void;
    /**
     * Emit a time update to clients.
     */
    broadcastTime(timestamp: bigint): void;
    /**
     * Send a service call response to the client
     * @param response Response to send to the client
     * @param connection Connection of the client that called the service
     */
    sendServiceCallResponse(response: ServiceCallPayload, connection: IWebSocket): void;
    /**
     * Send a service call failure response to the client
     * @param response Response to send to the client
     * @param connection Connection of the client that called the service
     */
    sendServiceCallFailure(response: ServiceCallFailure, connection: IWebSocket): void;
    /**
     * Publish parameter values.
     * @param parameters Parameter values
     * @param id Optional request ID coming from a "getParameters" request
     * @param connection Optional connection when parameter values are to be sent to a single client
     */
    publishParameterValues(parameters: Parameter[], id?: string, connection?: IWebSocket): void;
    /**
     * Inform clients about parameter value changes.
     * @param parameters Parameter values
     */
    updateParameterValues(parameters: Parameter[]): void;
    /**
     * Track a new client connection.
     * @param connection WebSocket used to communicate with the client
     * @param name Human-readable name for the client in log messages
     */
    handleConnection(connection: IWebSocket, name: string): void;
    /**
     * Send a response to a fetchAsset request
     * @param response The response to send
     * @param connection Connection of the client that called the service
     */
    sendFetchAssetResponse(response: FetchAssetResponse, connection: IWebSocket): void;
    /**
     * Send a status message to one or all clients.
     *
     * @param status Status message
     * @param connection Optional connection. If undefined, the status message will be sent to all clients.
     */
    sendStatus(status: Omit<StatusMessage, "op">, connection?: IWebSocket): void;
    /**
     * Remove status message(s) for one or for all clients.
  
     * @param statusIds Status ids to be removed.
     * @param connection Optional connection. If undefined, the status will be removed for all clients.
     */
    removeStatus(statusIds: string[], connection?: IWebSocket): void;
}
export {};
//# sourceMappingURL=FoxgloveServer.d.ts.map