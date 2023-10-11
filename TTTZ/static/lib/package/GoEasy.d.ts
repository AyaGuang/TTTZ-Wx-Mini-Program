import { BadgeOptions, CallBackOptions, ConnectOptions, GoEasyOptions, MessageCallback, Scene } from "./InterfaceTypes";
import { GoEasyPubSub } from "./pubsub";
import { ImApiEvents } from "./im/events/public/im-api-events";
import { MediaType } from "./rtc/media-type";
import { GoEasyIM } from "./im";
export default class GoEasy {
    static instance: GoEasy;
    static readonly version: string;
    static readonly IM_EVENT: typeof ImApiEvents;
    static readonly IM_SCENE: typeof Scene;
    static readonly MEDIA_TYPE: typeof MediaType;
    readonly im: GoEasyIM;
    readonly pubsub: GoEasyPubSub;
    private goEasySocket;
    private options;
    private constructor();
    static getInstance(options: GoEasyOptions): GoEasy;
    setBadge(options: BadgeOptions): void;
    connect(options: ConnectOptions): void;
    disconnect(options: CallBackOptions): void;
    getConnectionStatus(): string;
    private validateOptions;
    onClickNotification(clickHandler: MessageCallback): void;
    private confirmUserIdAndData;
}
