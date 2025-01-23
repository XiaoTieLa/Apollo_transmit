import EventEmitter from "eventemitter3";
import { ChannelId, MessageData, ServerInfo, StatusMessage } from ".";
import { Channel, RemoveStatusMessages, ClientChannelId, ClientChannelWithoutId, ConnectionGraphUpdate, FetchAssetResponse, IWebSocket, Parameter, ParameterValues, Service, ServiceCallFailure, ServiceCallPayload, ServiceCallResponse, ServiceId, SubscriptionId, Time } from "./types";
type EventTypes = {
    open: () => void;
    error: (error: Error) => void;
    close: (event: CloseEvent) => void;
    serverInfo: (event: ServerInfo) => void;
    status: (event: StatusMessage) => void;
    removeStatus: (event: RemoveStatusMessages) => void;
    message: (event: MessageData) => void;
    time: (event: Time) => void;
    advertise: (newChannels: Channel[]) => void;
    unadvertise: (removedChannels: ChannelId[]) => void;
    advertiseServices: (newServices: Service[]) => void;
    unadvertiseServices: (removedServices: ServiceId[]) => void;
    parameterValues: (event: ParameterValues) => void;
    serviceCallResponse: (event: ServiceCallResponse) => void;
    connectionGraphUpdate: (event: ConnectionGraphUpdate) => void;
    fetchAssetResponse: (event: FetchAssetResponse) => void;
    serviceCallFailure: (event: ServiceCallFailure) => void;
};
export default class FoxgloveClient {
    #private;
    static SUPPORTED_SUBPROTOCOL: string;
    constructor({ ws }: {
        ws: IWebSocket;
    });
    on<E extends EventEmitter.EventNames<EventTypes>>(name: E, listener: EventEmitter.EventListener<EventTypes, E>): void;
    off<E extends EventEmitter.EventNames<EventTypes>>(name: E, listener: EventEmitter.EventListener<EventTypes, E>): void;
    close(): void;
    subscribe(channelId: ChannelId): SubscriptionId;
    unsubscribe(subscriptionId: SubscriptionId): void;
    advertise(clientChannel: ClientChannelWithoutId): ClientChannelId;
    unadvertise(channelId: ClientChannelId): void;
    getParameters(parameterNames: string[], id?: string): void;
    setParameters(parameters: Parameter[], id?: string): void;
    subscribeParameterUpdates(parameterNames: string[]): void;
    unsubscribeParameterUpdates(parameterNames: string[]): void;
    sendMessage(channelId: ChannelId, data: Uint8Array): void;
    sendServiceCallRequest(request: ServiceCallPayload): void;
    subscribeConnectionGraph(): void;
    unsubscribeConnectionGraph(): void;
    fetchAsset(uri: string, requestId: number): void;
    /**
     * @deprecated Use `sendServiceCallRequest` instead
     */
    sendCallServiceRequest(request: ServiceCallPayload): void;
}
export {};
//# sourceMappingURL=FoxgloveClient.d.ts.map