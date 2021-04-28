import { Client, Signal } from "src/sdk";
import { IonSFUGRPCWebSignal } from 'src/sdk/signal/grpc-web-impl';
const serverConfig = require("config/config.json")

const getUrl: () => string = () => {
    const is_dev_mode = process.env.NODE_ENV == "development";
    const proto = is_dev_mode ? "ws" : "wss";
    const url = proto + "://" + serverConfig.serverIp;
    return "http://" + serverConfig.serverIp;
}

class SfuProxy {

    private static instance: SfuProxy;
    private client_: Client;
    private signal_: IonSFUGRPCWebSignal;
    private url_: string;

    private constructor() {
        const url = getUrl();
        this.signal_ = new IonSFUGRPCWebSignal(url);
        this.client_ = new Client(this.signal_);
    }

    public getDefaultClient: () => Client = () => {
        return this.client_;
    }

    public createNewClient: () => Client = () => {
        return new Client(this.signal_);
    }

    public getUrl: () => string = () => {
        return this.url_;
    }

    public getSfuSignal: () => IonSFUGRPCWebSignal = () => {
        return this.signal_;
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new SfuProxy();
        }
        return this.instance;
    }
}

export { SfuProxy };
